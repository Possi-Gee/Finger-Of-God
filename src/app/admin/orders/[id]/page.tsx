
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrders, type Order, type OrderStatus } from '@/hooks/use-orders';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, User, MoreVertical, Store, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { sendOrderStatusUpdateEmail } from '@/app/actions/send-email';
import { useSiteSettings } from '@/hooks/use-site-settings';

const getStatusClass = (status: Order['status']) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-500 text-white hover:bg-yellow-500/80';
    case 'Shipped': return 'bg-blue-500 text-white hover:bg-blue-500/80';
    case 'Delivered': return 'bg-green-500 text-white hover:bg-green-500/80';
    case 'Cancelled': return 'bg-red-500 text-white hover:bg-red-500/80';
    default: return 'bg-gray-500 text-white hover:bg-gray-500/80';
  }
};

const getPaymentMethodName = (method: string) => {
    const names: { [key: string]: string } = {
        card: 'Credit/Debit Card',
        mobile_money: 'Mobile Money',
        on_delivery: 'Pay on Delivery',
    };
    return names[method] || 'Unknown';
}

const getDeliveryMethodName = (method: Order['deliveryMethod']) => {
    return method === 'delivery' ? 'Home Delivery' : 'In-store Pickup';
}

const statuses: OrderStatus[] = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];


export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { state, dispatch } = useOrders();
  const { state: siteSettings } = useSiteSettings();
  const { toast } = useToast();

  const order = useMemo(() => {
    return state.orders.find((o) => o.id.toString() === id);
  }, [id, state.orders]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (order) {
        dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id: order.id, status } });
        
        const emailResult = await sendOrderStatusUpdateEmail({
            order,
            status,
            fromEmail: siteSettings.fromEmail,
            appName: siteSettings.appName,
            logoUrl: siteSettings.logoUrl
        });

        if (emailResult.error) {
            toast({
                title: 'Status Updated (Email Failed)',
                description: `Order #${order.id} status changed, but notification email failed: ${emailResult.error.message}`,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Order Status Updated',
                description: `Order #${order.id} is now ${status}. Customer notified.`
            });
        }
    }
  };
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <p className="text-muted-foreground mt-2">The order you are looking for does not exist.</p>
        <Button onClick={() => router.push('/admin/orders')} className="mt-6">
          Back to Orders List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="mr-2" /> Back to Orders
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Update Status <MoreVertical className="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {statuses.map(status => (
                    <DropdownMenuItem 
                        key={status} 
                        onClick={() => handleStatusChange(status)}
                        disabled={order.status === status}
                    >
                        Mark as {status}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

       <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                     <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
                     <CardDescription>Placed on {new Date(order.date).toLocaleString()}</CardDescription>
                </div>
                <div className="text-right mt-4 sm:mt-0">
                    <p className="text-sm text-muted-foreground">Order Status</p>
                    <Badge className={cn("text-lg mt-1", getStatusClass(order.status))}>{order.status}</Badge>
                </div>
            </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package/> Ordered Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="divide-y">
                    {order.items.map((item) => (
                    <li key={item.id} className="flex items-center py-4">
                        <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md" />
                        <div className="ml-4 flex-grow">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Variant: {item.variant.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-semibold">GH₵{(item.variant.price * item.quantity).toFixed(2)}</p>
                             <p className="text-sm text-muted-foreground">GH₵{item.variant.price.toFixed(2)} each</p>
                        </div>
                    </li>
                    ))}
                </ul>
                 <Separator className="my-4"/>
                 <div className="space-y-2 text-right">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>GH₵{order.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tax:</span> <span>GH₵{order.tax.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Shipping:</span> <span>GH₵{order.shippingFee.toFixed(2)}</span></div>
                    <Separator/>
                    <div className="flex justify-between font-bold text-lg"><span>Total:</span> <span>GH₵{order.total.toFixed(2)}</span></div>
                 </div>
            </CardContent>
           </Card>
            {order.orderNotes && (
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><MessageSquare /> Customer Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{order.orderNotes}</p>
                  </CardContent>
              </Card>
            )}
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User /> Customer Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {order.deliveryMethod === 'delivery' ? (
                        <>
                            <h4 className="font-semibold">Shipping Address</h4>
                            <address className="not-italic text-muted-foreground">
                                {order.shippingAddress.fullName}<br />
                                {order.shippingAddress.address}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                                {order.shippingAddress.country}
                            </address>
                        </>
                    ) : (
                        <div>
                            <h4 className="font-semibold">Customer</h4>
                            <p className="text-muted-foreground">This order is for in-store pickup.</p>
                        </div>
                    )}
                     <Separator className="my-4" />
                      <h4 className="font-semibold">Contact Email</h4>
                      <p className="text-muted-foreground">{order.shippingAddress.email}</p>
                     <Separator className="my-4" />
                      <h4 className="font-semibold">Payment Information</h4>
                     <p className="text-muted-foreground">Method: {getPaymentMethodName(order.paymentMethod)}</p>
                     <Separator className="my-4" />
                      <h4 className="font-semibold">Delivery Method</h4>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {order.deliveryMethod === 'delivery' ? <Truck className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                        <span>{getDeliveryMethodName(order.deliveryMethod)}</span>
                     </div>

                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
