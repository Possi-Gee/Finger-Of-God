
'use client';

import { useOrders, type Order, type OrderStatus } from '@/hooks/use-orders';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const getStatusClass = (status: Order['status']) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-500 text-white hover:bg-yellow-500/80';
    case 'Shipped': return 'bg-blue-500 text-white hover:bg-blue-500/80';
    case 'Delivered': return 'bg-green-500 text-white hover:bg-green-500/80';
    case 'Cancelled': return 'bg-red-500 text-white hover:bg-red-500/80';
    default: return 'bg-gray-500 text-white hover:bg-gray-500/80';
  }
};

const statuses: OrderStatus[] = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const { state, dispatch } = useOrders();
  const { orders } = state;
  const router = useRouter();

  const handleStatusChange = (orderId: number, status: OrderStatus) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id: orderId, status } });
  };
  
  const handleViewOrder = (orderId: number) => {
    router.push(`/admin/orders/${orderId}`);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-2">
         <ShoppingCart className="h-8 w-8" />
         <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">Manage and track all customer orders.</p>
         </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer" onClick={() => handleViewOrder(order.id)}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.shippingAddress.fullName}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                     <Badge className={cn(getStatusClass(order.status))}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>View Details</DropdownMenuItem>
                        {statuses.map(status => (
                            <DropdownMenuItem 
                                key={status} 
                                onClick={() => handleStatusChange(order.id, status)}
                                disabled={order.status === status}
                            >
                                Mark as {status}
                            </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         {orders.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">No orders found.</div>
        )}
      </Card>
    </div>
  );
}
