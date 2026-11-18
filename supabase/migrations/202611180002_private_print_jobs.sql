-- LOCAL ONLY. Never auto-enqueue existing orders. SQL/RLS need local-DB verification.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS legacy_status text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS legacy_review_required boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_paper_size_check;
UPDATE public.orders SET legacy_status=status, legacy_review_required=true,
 status=CASE WHEN status IN ('delivered','cancelled') THEN status ELSE 'pending_verification' END;
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending_verification';
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK(status IN ('pending_verification','approved','delivered','cancelled'));
ALTER TABLE public.orders ADD CONSTRAINT orders_paper_size_check CHECK(paper_size IN ('A4','F4'));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 1;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS capability_hash text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS creation_key uuid UNIQUE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS request_hash text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending','verified','rejected'));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS amount_due integer NOT NULL DEFAULT 0 CHECK(amount_due>=0);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS file_sha256 text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS file_size integer;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS file_mime text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
-- NOT VALID preserves problematic legacy data for review, but enforces new rows/updates.
ALTER TABLE public.orders ADD CONSTRAINT orders_limits CHECK(copies BETWEEN 1 AND 100 AND pages BETWEEN 1 AND 500 AND copies*pages<=1000) NOT VALID;
ALTER TABLE public.orders ADD CONSTRAINT orders_options CHECK(color_mode IN ('bw','color') AND layout IN ('1-up','2-up','4-up') AND scale_mode IN ('fit','fill','100') AND orientation IN ('portrait','landscape')) NOT VALID;
UPDATE public.orders SET file_url=NULL,payment_proof_url=NULL;

CREATE TABLE public.print_workers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), credential_hash text NOT NULL CHECK(credential_hash ~ '^[a-f0-9]{64}$'),
 enabled boolean NOT NULL DEFAULT true, printer_key text NOT NULL CHECK(printer_key='fake')
);
CREATE TABLE public.print_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES public.orders(id),
 revision integer NOT NULL, status text NOT NULL DEFAULT 'ready' CHECK(status IN ('ready','claimed','submitted','backend_completed','failed','needs_reconciliation')),
 target_worker_id uuid NOT NULL REFERENCES public.print_workers(id), printer_key text NOT NULL CHECK(printer_key='fake'),
 document_path text NOT NULL, document_sha256 text NOT NULL CHECK(document_sha256 ~ '^[a-f0-9]{64}$'),
 document_size integer NOT NULL CHECK(document_size BETWEEN 1 AND 10485760), options jsonb NOT NULL,
 version integer NOT NULL DEFAULT 0, lease_generation integer NOT NULL DEFAULT 0,
 claim_request_id uuid, claim_token_hash text, lease_until timestamptz,
 attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(),
 submission_started_at timestamptz, backend_instance_id text, backend_job_id text,
 last_error_code text, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(order_id,revision), UNIQUE(backend_instance_id,backend_job_id)
);
CREATE INDEX print_jobs_ready ON public.print_jobs(target_worker_id,printer_key,next_attempt_at) WHERE status='ready';
CREATE TABLE public.print_job_events (
 event_id uuid PRIMARY KEY, job_id uuid NOT NULL REFERENCES public.print_jobs(id),
 worker_id uuid REFERENCES public.print_workers(id), actor_id uuid, type text NOT NULL,
 request_hash text NOT NULL, result jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.print_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_job_events ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='admin');
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated,service_role;
-- Remove all inherited order/storage policies, including permissive legacy policies.
DO $$ DECLARE p record; BEGIN
 FOR p IN SELECT tablename,policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('orders','user_roles') LOOP
  EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,p.tablename);
 END LOOP;
END $$;
DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete documents" ON storage.objects;
UPDATE storage.buckets SET public=false WHERE id='documents';
REVOKE ALL ON public.orders,public.user_roles,public.print_workers,public.print_jobs,public.print_job_events FROM anon,authenticated;
GRANT SELECT ON public.orders,public.print_jobs TO authenticated;
CREATE POLICY admin_orders_read ON public.orders FOR SELECT TO authenticated USING(public.is_admin());
CREATE POLICY admin_jobs_read ON public.print_jobs FOR SELECT TO authenticated USING(public.is_admin());
-- Service-role clients stay exclusively inside authenticated server handlers.
GRANT ALL ON public.orders,public.user_roles,public.print_workers,public.print_jobs,public.print_job_events TO service_role;

CREATE FUNCTION public.print_job_response(j public.print_jobs) RETURNS jsonb
LANGUAGE sql IMMUTABLE SET search_path='' AS $$
 SELECT jsonb_build_object('id',j.id,'orderId',j.order_id,'status',j.status,'version',j.version,
 'generation',j.lease_generation,'leaseUntil',j.lease_until,'printerKey',j.printer_key,
 'submissionStartedAt',j.submission_started_at,'backendJobId',j.backend_job_id,
 'document',jsonb_build_object('sha256',j.document_sha256,'size',j.document_size),'options',j.options);
$$;

CREATE FUNCTION public.claim_print_job(p_worker uuid,p_request uuid,p_printer text,p_token_hash text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE j public.print_jobs; e public.print_job_events; BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.print_workers WHERE id=p_worker AND enabled AND printer_key=p_printer) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 -- Serialize requestId replays for this worker even when no job has been selected yet.
 PERFORM pg_advisory_xact_lock(hashtextextended(p_worker::text||p_request::text,0));
 SELECT * INTO e FROM public.print_job_events WHERE event_id=p_request;
 IF FOUND THEN
  IF e.worker_id IS DISTINCT FROM p_worker OR e.type<>'claim' OR e.request_hash<>p_token_hash THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF;
  SELECT * INTO j FROM public.print_jobs WHERE id=e.job_id FOR UPDATE;
  IF j.claim_request_id IS DISTINCT FROM p_request OR j.status<>'claimed' OR j.lease_until<=clock_timestamp() THEN RAISE EXCEPTION 'STALE_CLAIM'; END IF;
  RETURN public.print_job_response(j);
 END IF;
 -- An intent/receipt can never be reclaimed for submission after expiration.
 WITH expired AS (UPDATE public.print_jobs SET status=CASE WHEN submission_started_at IS NOT NULL OR status='submitted' THEN 'needs_reconciliation' WHEN attempts>=3 THEN 'failed' ELSE 'ready' END,
 version=version+1, next_attempt_at=clock_timestamp()+interval '5 seconds',last_error_code='LEASE_EXPIRED'
 WHERE target_worker_id=p_worker AND status IN ('claimed','submitted') AND lease_until<=clock_timestamp() RETURNING *)
 INSERT INTO public.print_job_events(event_id,job_id,worker_id,type,request_hash,result)
 SELECT gen_random_uuid(),x.id,p_worker,'lease_expired','server',jsonb_build_object('status',x.status,'version',x.version) FROM expired x;
 SELECT q.* INTO j FROM public.print_jobs q JOIN public.orders o ON o.id=q.order_id
 WHERE q.target_worker_id=p_worker AND q.printer_key=p_printer AND q.status='ready'
 AND q.next_attempt_at<=clock_timestamp() AND o.status='approved' AND o.payment_status='verified'
 AND NOT o.file_deleted AND NOT o.legacy_review_required
 ORDER BY q.created_at FOR UPDATE OF q SKIP LOCKED LIMIT 1;
 IF NOT FOUND THEN RETURN NULL; END IF;
 UPDATE public.print_jobs SET status='claimed',claim_request_id=p_request,claim_token_hash=p_token_hash,
 lease_generation=lease_generation+1,version=version+1,attempts=attempts+1,
 lease_until=clock_timestamp()+interval '60 seconds',submission_started_at=NULL
 WHERE id=j.id RETURNING * INTO j;
 INSERT INTO public.print_job_events(event_id,job_id,worker_id,type,request_hash,result)
 VALUES(p_request,j.id,p_worker,'claim',p_token_hash,public.print_job_response(j));
 RETURN public.print_job_response(j);
END $$;

CREATE FUNCTION public.report_print_event(p_worker uuid,p_job uuid,p_token_hash text,p_event jsonb,p_hash text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE j public.print_jobs; e public.print_job_events; t text:=p_event->>'type'; next_status text; result jsonb; BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.print_workers WHERE id=p_worker AND enabled) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 SELECT * INTO j FROM public.print_jobs WHERE id=p_job FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
 IF j.target_worker_id<>p_worker THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 SELECT * INTO e FROM public.print_job_events WHERE event_id=(p_event->>'eventId')::uuid;
 IF FOUND THEN
  IF e.job_id<>p_job OR e.worker_id IS DISTINCT FROM p_worker OR e.request_hash<>p_hash THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF;
  RETURN e.result;
 END IF;
 IF j.claim_token_hash IS DISTINCT FROM p_token_hash OR j.lease_generation<>(p_event->>'generation')::integer
 OR j.lease_until IS NULL OR j.lease_until<=clock_timestamp() THEN RAISE EXCEPTION 'STALE_CLAIM'; END IF;
 IF j.version<>(p_event->>'version')::integer THEN RAISE EXCEPTION 'STALE_VERSION'; END IF;
 IF j.status NOT IN ('claimed','submitted') THEN RAISE EXCEPTION 'INVALID_TRANSITION'; END IF;
 next_status:=j.status;
 IF t='heartbeat' THEN NULL;
 ELSIF t='submission_started' AND j.status='claimed' AND j.submission_started_at IS NULL THEN
  j.submission_started_at:=clock_timestamp();
 ELSIF t='submitted' AND j.status='claimed' AND j.submission_started_at IS NOT NULL
 AND length(p_event->>'backendJobId') BETWEEN 1 AND 128 AND length(p_event->>'backendInstanceId') BETWEEN 1 AND 128 THEN
  next_status:='submitted'; j.backend_job_id:=p_event->>'backendJobId'; j.backend_instance_id:=p_event->>'backendInstanceId';
 ELSIF t='backend_completed' AND j.status='submitted' THEN next_status:='backend_completed';
 ELSIF t='failed' AND (j.status='submitted' OR j.submission_started_at IS NULL) THEN next_status:='failed';
 ELSIF t='uncertain' THEN next_status:='needs_reconciliation';
 ELSE RAISE EXCEPTION 'INVALID_TRANSITION'; END IF;
 UPDATE public.print_jobs SET status=next_status,version=version+1,lease_until=clock_timestamp()+interval '60 seconds',
 submission_started_at=j.submission_started_at,backend_job_id=j.backend_job_id,backend_instance_id=j.backend_instance_id,
 last_error_code=CASE WHEN t IN ('failed','uncertain') THEN p_event->>'errorCode' ELSE last_error_code END
 WHERE id=p_job RETURNING * INTO j;
 result:=public.print_job_response(j);
 INSERT INTO public.print_job_events(event_id,job_id,worker_id,type,request_hash,result)
 VALUES((p_event->>'eventId')::uuid,p_job,p_worker,t,p_hash,result);
 RETURN result;
END $$;

CREATE FUNCTION public.print_job_document(p_worker uuid,p_job uuid,p_generation integer,p_token_hash text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE j public.print_jobs; BEGIN
 SELECT * INTO j FROM public.print_jobs WHERE id=p_job FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
 IF j.target_worker_id<>p_worker OR NOT EXISTS(SELECT 1 FROM public.print_workers WHERE id=p_worker AND enabled) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 IF j.status<>'claimed' OR j.claim_token_hash IS DISTINCT FROM p_token_hash OR j.lease_generation<>p_generation OR j.lease_until IS NULL OR j.lease_until<=clock_timestamp() THEN RAISE EXCEPTION 'STALE_CLAIM'; END IF;
 IF EXISTS(SELECT 1 FROM public.orders WHERE id=j.order_id AND file_deleted) THEN RAISE EXCEPTION 'DOCUMENT_DELETED'; END IF;
 RETURN jsonb_build_object('path',j.document_path,'sha256',j.document_sha256,'size',j.document_size);
END $$;

CREATE FUNCTION public.admin_print_action(p_admin uuid,p_order uuid,p_action jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.orders; j public.print_jobs; a text:=p_action->>'action'; BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=p_admin AND role='admin') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 SELECT * INTO o FROM public.orders WHERE id=p_order FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
 SELECT * INTO j FROM public.print_jobs WHERE order_id=o.id AND revision=o.revision FOR UPDATE;
 -- Approval retries are idempotent even when the browser lost the previous response.
 IF a='approve' AND o.status='approved' AND j.id IS NOT NULL THEN
  IF j.target_worker_id IS DISTINCT FROM (p_action->>'workerId')::uuid OR j.printer_key IS DISTINCT FROM p_action->>'printerKey' THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF;
  RETURN jsonb_build_object('order',to_jsonb(o)-'capability_hash'-'request_hash','job',public.print_job_response(j));
 END IF;
 IF o.version<>(p_action->>'expectedVersion')::integer THEN RAISE EXCEPTION 'STALE_VERSION'; END IF;
 IF a='review_legacy' AND o.legacy_review_required THEN o.legacy_review_required:=false;
 ELSIF a IN ('verify_payment','reject_payment') AND o.status='pending_verification' THEN
  IF a='verify_payment' AND (o.payment_proof_path IS NULL OR o.payment_proof_deleted) THEN RAISE EXCEPTION 'DOCUMENT_NOT_READY'; END IF;
  o.payment_status:=CASE WHEN a='verify_payment' THEN 'verified' ELSE 'rejected' END;
  o.verified_by:=p_admin; o.verified_at:=clock_timestamp();
 ELSIF a IN ('approve','reprint') THEN
  IF o.legacy_review_required THEN RAISE EXCEPTION 'LEGACY_REVIEW_REQUIRED'; END IF;
  IF o.payment_status<>'verified' THEN RAISE EXCEPTION 'PAYMENT_NOT_VERIFIED'; END IF;
  IF a='approve' AND o.status<>'pending_verification' THEN RAISE EXCEPTION 'INVALID_TRANSITION'; END IF;
  IF a='reprint' THEN
   IF o.status<>'approved' OR j.id IS NULL OR j.status NOT IN ('failed','needs_reconciliation','backend_completed') OR (p_action->>'acknowledgeDuplicateRisk') IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'INVALID_TRANSITION'; END IF;
   o.revision:=o.revision+1;
  END IF;
  IF o.file_path IS NULL OR o.file_deleted OR o.file_mime IS DISTINCT FROM 'application/pdf' OR o.file_sha256 IS NULL OR o.file_sha256 !~ '^[a-f0-9]{64}$' OR o.file_size IS NULL OR o.file_size NOT BETWEEN 1 AND 10485760 OR o.actual_pages IS NULL OR o.actual_pages NOT BETWEEN 1 AND 500 OR o.copies*o.actual_pages>1000
   OR o.file_path NOT LIKE 'orders/'||o.id::text||'/document/%' THEN RAISE EXCEPTION 'DOCUMENT_NOT_READY'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.print_workers WHERE id=(p_action->>'workerId')::uuid AND enabled AND printer_key=p_action->>'printerKey') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  o.status:='approved'; o.approved_by:=p_admin; o.approved_at:=clock_timestamp();
  INSERT INTO public.print_jobs(order_id,revision,target_worker_id,printer_key,document_path,document_sha256,document_size,options)
  VALUES(o.id,o.revision,(p_action->>'workerId')::uuid,p_action->>'printerKey',o.file_path,o.file_sha256,o.file_size,
   jsonb_build_object('copies',o.copies,'paperSize',o.paper_size,'colorMode',o.color_mode,'layout',o.layout,'scaleMode',o.scale_mode,'orientation',o.orientation)) RETURNING * INTO j;
 ELSIF a='cancel' AND o.status IN ('pending_verification','approved') THEN
  IF j.id IS NOT NULL AND j.status<>'ready' THEN RAISE EXCEPTION 'INVALID_TRANSITION'; END IF;
  IF j.id IS NOT NULL THEN UPDATE public.print_jobs SET status='failed',last_error_code='ORDER_CANCELLED',version=version+1 WHERE id=j.id RETURNING * INTO j; END IF;
  o.status:='cancelled';o.cancelled_at:=clock_timestamp();
  o.file_expires_at:=clock_timestamp()+interval '1 hour';o.payment_proof_expires_at:=clock_timestamp()+interval '24 hours';
 ELSIF a='deliver' AND o.status='approved' AND j.status='backend_completed' THEN
  o.status:='delivered';o.delivered_at:=clock_timestamp();o.file_expires_at:=clock_timestamp()+interval '1 hour';o.payment_proof_expires_at:=clock_timestamp()+interval '24 hours';
 ELSIF a='reconcile' AND o.status='approved' AND j.status='needs_reconciliation' AND p_action->>'resolution'='backend_completed' AND p_action->>'reasonCode'='OPERATOR_VERIFIED' AND length(p_action->>'backendJobId') BETWEEN 1 AND 128 THEN
  UPDATE public.print_jobs SET status='backend_completed',backend_job_id=p_action->>'backendJobId',version=version+1 WHERE id=j.id RETURNING * INTO j;
 ELSE RAISE EXCEPTION 'INVALID_TRANSITION'; END IF;
 UPDATE public.orders SET status=o.status,payment_status=o.payment_status,verified_by=o.verified_by,verified_at=o.verified_at,
 legacy_review_required=o.legacy_review_required,approved_by=o.approved_by,approved_at=o.approved_at,revision=o.revision,
 delivered_at=o.delivered_at,cancelled_at=o.cancelled_at,file_expires_at=o.file_expires_at,payment_proof_expires_at=o.payment_proof_expires_at,version=version+1 WHERE id=o.id RETURNING * INTO o;
 IF j.id IS NOT NULL THEN INSERT INTO public.print_job_events(event_id,job_id,actor_id,type,request_hash,result)
 VALUES(gen_random_uuid(),j.id,p_admin,a,'admin',jsonb_build_object('status',j.status,'orderStatus',o.status,'orderVersion',o.version)); END IF;
 RETURN jsonb_build_object('order',to_jsonb(o)-'capability_hash'-'request_hash','job',CASE WHEN j.id IS NULL THEN NULL ELSE public.print_job_response(j) END);
END $$;

-- Functions are not public RPCs. Server verifies caller identity before passing IDs.
REVOKE ALL ON FUNCTION public.print_job_response(public.print_jobs) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.claim_print_job(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.report_print_event(uuid,uuid,text,jsonb,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.print_job_document(uuid,uuid,integer,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.admin_print_action(uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.print_job_response(public.print_jobs),public.claim_print_job(uuid,uuid,text,text),public.report_print_event(uuid,uuid,text,jsonb,text),public.print_job_document(uuid,uuid,integer,text),public.admin_print_action(uuid,uuid,jsonb) TO service_role;
