
'use client';

import { useOrders, type Order } from '@/hooks/use-orders';
import { useProduct } from '@/hooks/use-product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Landmark, Package, ShoppingCart, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const getStatusClass = (status: Order['status']) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-500 text-white hover:bg-yellow-500/80';
    case 'Shipped': return 'bg-blue-500 text-white hover:bg-blue-500/80';
    case 'Delivered': return 'bg-green-500 text-white hover:bg-green-500/80';
    case 'Cancelled': return 'bg-red-500 text-white hover:bg-red-500/80';
    default: return 'bg-gray-500 text-white hover:bg-gray-500/80';
  }
};

export default function AdminDashboardPage() {
  const { state: orderState } = useOrders();
  const { state: productState } = useProduct();
  const router = useRouter();

  const totalRevenue = orderState.orders.reduce((sum, order) => sum + order.total, 0);
  const totalSales = orderState.orders.length;
  const totalProducts = productState.products.length;
  const pendingOrders = orderState.orders.filter(order => order.status === 'Pending').length;
  
  const recentOrders = [...orderState.orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const stats = [
    { title: 'Total Revenue', value: `GH₵${totalRevenue.toFixed(2)}`, icon: Landmark },
    { title: 'Total Sales', value: totalSales, icon: ShoppingCart },
    { title: 'Total Products', value: totalProducts, icon: Package },
    { title: 'Pending Orders', value: pendingOrders, icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">A quick overview of your store's performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground">The last 5 orders placed on your store.</p>
            </div>
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/orders">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.shippingAddress.fullName}</TableCell>
                  <TableCell>GH₵{order.total.toFixed(2)}</TableCell>
                  <TableCell>
                     <Badge className={cn(getStatusClass(order.status))}>{order.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {recentOrders.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">No recent orders.</div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
