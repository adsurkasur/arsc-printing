# ARSC service API v1 — frozen 2026-11-18

This extends PRINT_JOB_CONTRACT.md; the worker wire protocol remains v1 unchanged.
All responses use Cache-Control: no-store. Errors: {error:{code,message}}.
Admin endpoints require Authorization: Bearer <Supabase user access token> and an admin role.
Customer order identity is its existing per-order HttpOnly capability cookie, never the pickup code.

## Customer

POST /api/orders retains its existing strict request and adds pickupCode to its response:
{id,status:"pending_verification",csrfToken,pickupCode:"ARSC-4821"}.
GET /api/orders?id=<uuid> returns {id,status,created_at,estimated_time,amount_due,pickupCode,version,csrfToken} only to its capability holder.
Pickup codes have four digits (including leading zeros), are unique among active orders
(status pending_verification or approved), and may be reused after cancellation/delivery.
They are convenience labels, not passwords. No public lookup or queue exposes them.

POST /api/orders/<id>/cancel
Headers: capability cookie, Origin matching the application, X-CSRF-Token.
Body: {expectedVersion:integer>=0}.
Response: {id,status:"cancelled",version,pickupCode}.
Only pending_verification may be cancelled. The transaction locks the order;
concurrent approval and cancellation cannot both win. Repeating an already completed
cancellation returns the current cancelled result. A stale version returns 409 STALE_VERSION;
approved/delivered returns 409 INVALID_TRANSITION. Missing/wrong capability or CSRF returns 403 FORBIDDEN.
Cancellation schedules document retention for 1 hour and payment proof for 24 hours;
it does not delete files immediately or issue a financial refund.

## Admin order search

GET /api/admin/orders?page=1&pageSize=20&status=approved&from=2026-11-18&to=2026-11-18&q=ARSC-4821
Response: {items:[<existing safe admin order fields plus pickupCode>],page,pageSize,total}.
page >=1 (maximum10000), pageSize 1..100 (default20). Newest created_at then id first.
status is an order status: pending_verification|approved|delivered|cancelled.
from/to are inclusive calendar dates in Asia/Jakarta and filter created_at.
q is a trimmed literal substring of customer_name OR pickup_code, maximum100 characters;
percent/underscore and punctuation are treated as text, never PostgREST filter syntax.
Invalid or unknown query parameters return 400 INVALID_INPUT. No credential hashes,
capabilities, storage paths, or signed URLs occur in list results.
The legacy GET /api/orders admin array is retained during UI migration.

## Daily summary

GET /api/admin/summary?date=2026-11-18
Default date: today in Asia/Jakarta.
Response: {date,timeZone:"Asia/Jakarta",orderCount:integer,pages:integer,revenueVerified:integer}.
orderCount includes all orders created on that date (including cancelled).
pages sums coalesce(actual_pages,0)*copies of those created orders.
revenueVerified sums amount_due for payment_status=verified, not cancelled,
whose verified_at falls on that date. This is a manual-verification operational summary,
not settlement/refund accounting. Currency is integer IDR. Empty day returns zeros.

## Workers

GET /api/admin/workers
Response: {items:[{id,printerKey:"fake",enabled:boolean}]} ordered by id.
Includes enabled and disabled workers so existing assignments remain understandable.
Never exposes credentials. No registration/rotation UI API is added here.

## Receipt view

GET /api/admin/orders/<id>/receipt
Response:
{order:{id,pickupCode,customerName,status,paymentStatus,amountDue,pages,copies,
createdAt,verifiedAt,approvedAt,deliveredAt},
jobs:[{id,revision,status,printerKey,workerId,backendJobId,backendInstanceId,lastErrorCode}],
events:[{eventId,jobId,type,createdAt}],backendCompletionIsPhysicalProof:false}.
Jobs are sorted by revision; events by created_at then event_id. No raw event result,
claim token/hash, signed URL, document path, or worker credential is returned.
Receipt may have zero jobs/events for pending orders. Unknown order returns 404 NOT_FOUND.
A backend_completed receipt is not proof of physical printing or customer pickup.

## Boundaries

GET routes never mutate. Invalid parameters:400 INVALID_INPUT; missing admin token:401;
non-admin:403; backend unavailable:503. Customer mutation conflicts:409.
Pickup pool exhaustion:503 PICKUP_CAPACITY. DB functions are service_role-only.
No change to print-job approval/fencing/idempotency or legacy no-auto-enqueue rules.

Implementation notes: pickup allocation starts at a random code and checks the bounded pool under a transaction lock; it is non-sequential. Cancel is rejected whenever ANY print job exists, even if an inconsistent order still says pending_verification. Centralized request rate limiting remains a proposal; no code-only lookup route exists.
