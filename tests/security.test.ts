import {test} from 'node:test'
import assert from 'node:assert/strict'
import {PDFDocument} from 'pdf-lib'
import {assertOrigin,capabilityToken,csrfFor,assertCapability,assertCsrf,parseOrder,readBoundedBody,requireCron,customerOrder,capabilityCookie} from '../src/lib/api-security'
import {validateFile,computePrice,canonicalPath,readUpload,deleteStoredFile} from '../src/lib/storage'
import {localDb} from '../src/lib/api-security'
import {GET as orphanGET,POST as orphanPOST} from '../src/app/api/cleanup-orphans/route'
const id='434ece91-f248-4f43-bd31-baa64c6c44c5'
test('origin/capability/CSRF are scoped and cookie is HttpOnly',()=>{
 assert.throws(()=>assertOrigin(new Request('http://localhost/api',{method:'POST'})),/FORBIDDEN/)
 assert.throws(()=>assertOrigin(new Request('http://localhost/api',{method:'POST',headers:{origin:'https://evil.invalid'}})),/FORBIDDEN/)
 const token=capabilityToken(id,'synthetic-signing-secret-that-is-long-enough')
 const cookie=capabilityCookie(id,token,false)
 assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/)
 const req=new Request('http://localhost/api',{headers:{cookie:cookie.split(';')[0],'X-CSRF-Token':csrfFor(token)}})
 assert.doesNotThrow(()=>assertCapability(req,id,token));assert.doesNotThrow(()=>assertCsrf(req,token))
 assert.throws(()=>assertCapability(req,'534ece91-f248-4f43-bd31-baa64c6c44c5',token),/FORBIDDEN/)
 assert.throws(()=>assertCsrf(new Request('http://localhost'),token),/FORBIDDEN/)
})
test('order rejects forged paths, price, status and invalid numeric/options inputs',()=>{
 const input={customer_name:'Synthetic',contact:'synthetic',copies:1,color_mode:'bw',paper_size:'F4',layout:'1-up',scale_mode:'fit',orientation:'portrait',user_note:''}
 assert.equal(parseOrder(input).paper_size,'F4')
 for(const extra of [{status:'approved'},{file_path:'other/customer.pdf'},{amount_due:1},{copies:0},{copies:1.5},{copies:101},{paper_size:'A3'}])assert.throws(()=>parseOrder({...input,...extra}),/INVALID_INPUT/)
})
test('bounded stream cancels actual oversized body without trusting Content-Length',async()=>{
 let cancelled=false
 const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(2048))},cancel(){cancelled=true}})
 const request=new Request('http://localhost',{method:'POST',body:stream,duplex:'half'} as RequestInit)
 await assert.rejects(readBoundedBody(request,1024),/PAYLOAD_TOO_LARGE/);assert.equal(cancelled,true)
})
test('PDF parser validates bytes and server page count, not MIME or client claims',async()=>{
 const pdf=await PDFDocument.create();pdf.addPage();pdf.addPage()
 const bytes=await pdf.save()
 assert.equal((await validateFile('document',bytes,'application/pdf')).pages,2)
 await assert.rejects(validateFile('document',new TextEncoder().encode('<svg/>'),'application/pdf'),/FILE_INVALID/)
 await assert.rejects(validateFile('document',new TextEncoder().encode('%PDF-invalid'),'application/pdf'),/FILE_INVALID/)
 await assert.rejects(validateFile('document',bytes,'image/png'),/FILE_INVALID/)
})
test('proof accepts parsed PNG/JPEG only; SVG, wrong magic and oversize rejected',async()=>{
 const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jhioAAAAASUVORK5CYII=','base64'))
 assert.equal((await validateFile('proof',png,'image/png')).mime,'image/png')
 await assert.rejects(validateFile('proof',new TextEncoder().encode('<svg/>'),'image/svg+xml'),/FILE_INVALID/)
 await assert.rejects(validateFile('proof',new Uint8Array(5*1024*1024+1),'image/png'),/PAYLOAD_TOO_LARGE/)
})
test('server price uses validated pages/copies and canonical path excludes traversal',()=>{
 assert.equal(computePrice(2,3,'bw'),3000);assert.equal(computePrice(2,3,'color'),4500)
 assert.throws(()=>computePrice(501,1,'bw'),/INVALID_INPUT/)
 assert.throws(()=>canonicalPath(id,'document','../secret'),/INVALID_INPUT/)
 assert.equal(canonicalPath(id,'document','orders/'+id+'/document/random.pdf'),'orders/'+id+'/document/random.pdf')
})
test('customer projection excludes PII/paths/secrets and cron is fail closed',()=>{
 const projected=customerOrder({id,status:'pending_verification',customer_name:'private',contact:'private',file_path:'private',capability_hash:'private'})
 assert.equal(JSON.stringify(projected).includes('private'),false)
 assert.throws(()=>requireCron(new Request('http://localhost'),undefined),/UNAUTHENTICATED/)
 assert.throws(()=>requireCron(new Request('http://localhost',{headers:{authorization:'Bearer wrong'}}),'synthetic-secret'),/UNAUTHENTICATED/)
})
test('orphan GET never mutates and wrong-secret POST never reaches database',async()=>{
 assert.equal((await orphanGET()).status,405)
 assert.equal((await orphanPOST(new Request('http://localhost/api/cleanup-orphans',{method:'POST',headers:{authorization:'Bearer wrong'}}))).status,401)
})
test('multipart is bounded by kind while streaming and rejects missing/duplicate metadata',async()=>{
 const form=new FormData();form.set('orderId',id);form.set('kind','proof');form.set('file',new File([new Uint8Array([1,2,3])],'synthetic.png',{type:'image/png'}))
 const request=new Request('http://localhost',{method:'POST',body:form})
 assert.equal((await readUpload(request)).kind,'proof')
 const duplicate=new FormData();duplicate.set('orderId',id);duplicate.set('kind','proof');duplicate.append('kind','document');duplicate.set('file',new File(['x'],'synthetic.png',{type:'image/png'}))
 await assert.rejects(readUpload(new Request('http://localhost',{method:'POST',body:duplicate})),/INVALID_INPUT/)
 const prefix='--boundary\r\nContent-Disposition: form-data; name="kind"\r\n\r\nproof\r\n'
 let cancelled=false
 const stream=new ReadableStream({start(c){c.enqueue(new TextEncoder().encode(prefix));c.enqueue(new Uint8Array(5*1024*1024+16385))},cancel(){cancelled=true}})
 const big=new Request('http://localhost',{method:'POST',headers:{'content-type':'multipart/form-data; boundary=boundary'},body:stream,duplex:'half'} as RequestInit)
 await assert.rejects(readUpload(big),/PAYLOAD_TOO_LARGE/);assert.equal(cancelled,true)
})
test('storage failure leaves a deny-access tombstone and path for a safe retry; active orders rejected',async()=>{
 const row={id,status:'delivered',version:0,file_path:'orders/'+id+'/document/synthetic.pdf',file_deleted:false,payment_proof_path:null}
 let patch:Record<string,unknown>|null=null;let fail=true;let calls=0
 const builder={select(){return this},eq(){return this},update(value:Record<string,unknown>){patch=value;return this},async maybeSingle(){if(patch){Object.assign(row,patch);patch=null;return {data:{id},error:null}}return {data:{...row},error:null}}}
 const db={from(){return builder},storage:{from(){return {async remove(){calls++;assert.equal(row.file_deleted,true);return {error:fail?{message:'synthetic storage outage'}:null}}}}}} as unknown as ReturnType<typeof localDb>
 await assert.rejects(deleteStoredFile(db,id,'document'),/STORAGE_DELETE_PENDING/)
 assert.equal(row.file_path,'orders/'+id+'/document/synthetic.pdf');assert.equal(row.file_deleted,true)
 fail=false;await deleteStoredFile(db,id,'document');assert.equal(calls,2)
 row.status='approved';await assert.rejects(deleteStoredFile(db,id,'document'),/INVALID_TRANSITION/);assert.equal(calls,2)
})


test('Origin matches actual loopback Host under Next URL reconstruction; remote Host is rejected',()=>{
 assert.doesNotThrow(()=>assertOrigin(new Request('http://localhost:3100/api',{headers:{host:'127.0.0.1:3100',origin:'http://127.0.0.1:3100'}})))
 assert.throws(()=>assertOrigin(new Request('http://localhost:3100/api',{headers:{host:'127.0.0.1:3100',origin:'http://localhost:3100'}})),/FORBIDDEN/)
 assert.throws(()=>assertOrigin(new Request('http://localhost:3100/api',{headers:{host:'evil.invalid',origin:'http://evil.invalid'}})),/FORBIDDEN/)
})
