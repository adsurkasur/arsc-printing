import {test} from 'node:test'
import assert from 'node:assert/strict'
import {searchParams,summaryDate,dateValue} from '../src/lib/admin-api'
test('admin search rejects unsafe paging, dates, duplicates and unknown fields',()=>{
 assert.deepEqual(searchParams(new URLSearchParams()),{p_page:1,p_size:20,p_status:null,p_from:null,p_to:null,p_query:null})
 for(const q of ['page=0','page=1.2','pageSize=101','page=1&page=2','status=printing','from=2026-02-30','from=2026-12-02&to=2026-12-01','unsafe=x'])assert.throws(()=>searchParams(new URLSearchParams(q)),/INVALID_INPUT/)
 assert.equal(searchParams(new URLSearchParams({q:'x),status.eq.approved%_'})).p_query,'x),status.eq.approved%_')
})
test('summary uses explicit valid calendar days; unknown filters rejected',()=>{
 assert.equal(summaryDate(new URLSearchParams('date=2026-11-18')),'2026-11-18')
 for(const d of ['2026-02-30','2026-13-01','yesterday','2026-01-01T12:00:00Z'])assert.throws(()=>dateValue(d),/INVALID_INPUT/)
 assert.throws(()=>summaryDate(new URLSearchParams('date=2026-11-18&date=2026-11-19')),/INVALID_INPUT/)
 assert.throws(()=>summaryDate(new URLSearchParams('q=x')),/INVALID_INPUT/)
})
