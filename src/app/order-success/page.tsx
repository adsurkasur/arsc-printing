import OrderSuccessClient from '@/components/OrderSuccessClient';
export default async function OrderSuccessPage({searchParams}:{searchParams:Promise<{orderId?:string}>}) {
 const {orderId}=await searchParams;
 // Authorization is performed by the scoped API; never query public orders from this page.
 return <OrderSuccessClient initialOrderId={orderId ?? null}/>;
}
