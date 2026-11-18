-- Isolated ARSC Supabase: service features. No job creation or legacy enqueue.
ALTER TABLE public.orders ADD COLUMN pickup_code text CHECK(pickup_code ~ '^ARSC-[0-9]{4}$');
CREATE UNIQUE INDEX orders_active_pickup ON public.orders(pickup_code) WHERE status IN ('pending_verification','approved');
CREATE FUNCTION public.assign_pickup_code() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
DECLARE n integer; start_at integer:=floor(random()*10000)::integer; candidate text; BEGIN
 IF NEW.pickup_code IS NOT NULL THEN RETURN NEW; END IF;
 -- Serialize allocation only; uniqueness remains enforced by the partial index.
 PERFORM pg_advisory_xact_lock(741982);
 FOR n IN 0..9999 LOOP
  candidate:='ARSC-'||lpad(((start_at+n)%10000)::text,4,'0');
  IF NOT EXISTS(SELECT 1 FROM public.orders WHERE pickup_code=candidate AND status IN ('pending_verification','approved')) THEN NEW.pickup_code:=candidate;RETURN NEW;END IF;
 END LOOP;
 RAISE EXCEPTION 'PICKUP_CAPACITY';
END $$;
CREATE TRIGGER assign_pickup BEFORE INSERT OR UPDATE OF pickup_code ON public.orders FOR EACH ROW EXECUTE FUNCTION public.assign_pickup_code();
UPDATE public.orders SET pickup_code=NULL WHERE pickup_code IS NULL;
ALTER TABLE public.orders ALTER COLUMN pickup_code SET NOT NULL;
REVOKE ALL ON FUNCTION public.assign_pickup_code() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.customer_cancel_order(p_order uuid,p_token_hash text,p_version integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.orders;BEGIN
 IF p_version IS NULL OR p_version<0 THEN RAISE EXCEPTION 'INVALID_INPUT';END IF;
 IF p_token_hash IS NULL OR p_token_hash !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
 SELECT * INTO o FROM public.orders WHERE id=p_order FOR UPDATE;
 IF NOT FOUND OR o.capability_hash IS DISTINCT FROM p_token_hash OR o.created_at<clock_timestamp()-interval '7 days' THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
 IF EXISTS(SELECT 1 FROM public.print_jobs WHERE order_id=o.id) THEN RAISE EXCEPTION 'INVALID_TRANSITION';END IF;
 IF o.status='cancelled' THEN RETURN jsonb_build_object('id',o.id,'status',o.status,'version',o.version,'pickupCode',o.pickup_code);END IF;
 IF o.status<>'pending_verification' THEN RAISE EXCEPTION 'INVALID_TRANSITION';END IF;
 IF o.version<>p_version THEN RAISE EXCEPTION 'STALE_VERSION';END IF;
 UPDATE public.orders SET status='cancelled',cancelled_at=clock_timestamp(),version=version+1,
 file_expires_at=clock_timestamp()+interval '1 hour',payment_proof_expires_at=clock_timestamp()+interval '24 hours' WHERE id=o.id RETURNING * INTO o;
 RETURN jsonb_build_object('id',o.id,'status',o.status,'version',o.version,'pickupCode',o.pickup_code);
END $$;
CREATE OR REPLACE FUNCTION public.admin_order_search(p_page integer,p_size integer,p_status text,p_from date,p_to date,p_query text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 WITH matched AS (
 SELECT o.id FROM public.orders o WHERE (p_status IS NULL OR o.status=p_status)
 AND (p_from IS NULL OR o.created_at>=p_from::timestamp AT TIME ZONE 'Asia/Jakarta')
 AND (p_to IS NULL OR o.created_at<(p_to+1)::timestamp AT TIME ZONE 'Asia/Jakarta')
 AND (p_query IS NULL OR strpos(lower(o.customer_name),lower(p_query))>0 OR strpos(lower(o.pickup_code),lower(p_query))>0)
 ), paged AS (
 SELECT jsonb_build_object('id',o.id,'pickupCode',o.pickup_code,'customer_name',o.customer_name,'contact',o.contact,'file_name',o.file_name,
 'status',o.status,'version',o.version,'revision',o.revision,'payment_status',o.payment_status,'amount_due',o.amount_due,'created_at',o.created_at,
 'legacy_review_required',o.legacy_review_required,'copies',o.copies,'pages',o.pages,'actual_pages',o.actual_pages,'paper_size',o.paper_size,'color_mode',o.color_mode,
 'layout',o.layout,'scale_mode',o.scale_mode,'orientation',o.orientation,'estimated_time',o.estimated_time,'user_note',o.user_note,
 'file_deleted',o.file_deleted,'payment_proof_deleted',o.payment_proof_deleted,
 'print_jobs',coalesce((SELECT jsonb_agg(jsonb_build_object('id',j.id,'order_id',j.order_id,'revision',j.revision,'status',j.status,'version',j.version,'target_worker_id',j.target_worker_id,'printer_key',j.printer_key,'lease_generation',j.lease_generation,'lease_until',j.lease_until,'submission_started_at',j.submission_started_at,'backend_job_id',j.backend_job_id,'last_error_code',j.last_error_code)) FROM public.print_jobs j WHERE j.order_id=o.id),'[]'::jsonb)) AS item
 FROM public.orders o JOIN matched m ON m.id=o.id ORDER BY o.created_at DESC,o.id DESC OFFSET (p_page-1)*p_size LIMIT p_size
 ) SELECT jsonb_build_object('items',coalesce((SELECT jsonb_agg(item) FROM paged),'[]'::jsonb),'page',p_page,'pageSize',p_size,'total',(SELECT count(*) FROM matched));
$$;
CREATE FUNCTION public.admin_daily_summary(p_date date) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT jsonb_build_object('date',p_date,'timeZone','Asia/Jakarta',
 'orderCount',(SELECT count(*) FROM public.orders WHERE created_at>=p_date::timestamp AT TIME ZONE 'Asia/Jakarta' AND created_at<(p_date+1)::timestamp AT TIME ZONE 'Asia/Jakarta'),
 'pages',(SELECT coalesce(sum(coalesce(actual_pages,0)::bigint*copies),0) FROM public.orders WHERE created_at>=p_date::timestamp AT TIME ZONE 'Asia/Jakarta' AND created_at<(p_date+1)::timestamp AT TIME ZONE 'Asia/Jakarta'),
 'revenueVerified',(SELECT coalesce(sum(amount_due),0) FROM public.orders WHERE payment_status='verified' AND status<>'cancelled' AND verified_at>=p_date::timestamp AT TIME ZONE 'Asia/Jakarta' AND verified_at<(p_date+1)::timestamp AT TIME ZONE 'Asia/Jakarta'));
$$;
REVOKE ALL ON FUNCTION public.customer_cancel_order(uuid,text,integer),public.admin_order_search(integer,integer,text,date,date,text),public.admin_daily_summary(date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.customer_cancel_order(uuid,text,integer),public.admin_order_search(integer,integer,text,date,date,text),public.admin_daily_summary(date) TO service_role;
NOTIFY pgrst,'reload schema';
