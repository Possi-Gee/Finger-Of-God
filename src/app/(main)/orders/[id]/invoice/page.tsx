
'use client';

import { useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/use-orders';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Printer, ArrowLeft, Loader2, Download, Package } from 'lucide-react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '@/hooks/use-auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function InvoicePage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { state: orderState } = useOrders();
    const { loading: authLoading } = useAuth();
    const { state: siteSettings } = useSiteSettings();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const order = useMemo(() => {
        return orderState.orders.find((o) => o.id.toString() === id);
    }, [id, orderState.orders]);

    const handleDownload = async () => {
        if (!invoiceRef.current || !order) return;
        
        setIsDownloading(true);
        const invoiceElement = invoiceRef.current;
        
        try {
            const canvas = await html2canvas(invoiceElement, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`invoice-${order.id}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setIsDownloading(false);
        }
    };

    if (authLoading || orderState.loading) {
        return (
             <div className="container mx-auto px-4 py-8 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                <p className="mt-4">Loading Invoice...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">Order Not Found</h1>
                <p className="text-muted-foreground mt-2">The order you are looking for does not exist.</p>
                 <Button onClick={() => router.push('/orders')} className="mt-6">
                    Back to My Orders
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-muted text-foreground min-h-screen py-8 print:bg-white">
            <div className="container mx-auto px-4">
                 <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center print:hidden">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2" /> Back to Order
                    </Button>
                    <div className="flex gap-2">
                        <Button onClick={() => window.print()}>
                            <Printer className="mr-2" /> Print
                        </Button>
                        <Button onClick={handleDownload} disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 animate-spin"/> : <Download className="mr-2"/>}
                            {isDownloading ? 'Downloading...' : 'Download PDF'}
                        </Button>
                    </div>
                </div>

                <div ref={invoiceRef} className="max-w-3xl mx-auto print:max-w-none">
                    <Card className="p-8 shadow-lg print:shadow-none print:border-none print:p-0 bg-background print:bg-white">
                        <header className="flex justify-between items-start pb-6 border-b">
                            <div>
                                {siteSettings.logoUrl ? (
                                    <Image src={siteSettings.logoUrl} alt={siteSettings.appName} width={120} height={40} className="object-contain" />
                                ) : (
                                    <h1 className="text-2xl font-bold text-primary">{siteSettings.appName}</h1>
                                )}
                                <address className="not-italic text-muted-foreground text-sm mt-2">
                                    123 Classic Lane, Osu<br/>
                                    Accra, Ghana
                                </address>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-bold uppercase text-primary">Invoice</h2>
                                <p className="text-muted-foreground text-sm mt-1">Invoice #: {order.id}</p>
                                <p className="text-muted-foreground text-sm">Date: {new Date(order.date).toLocaleDateString()}</p>
                            </div>
                        </header>

                        <section className="grid grid-cols-2 gap-8 my-6 text-sm">
                            <div>
                                <h3 className="font-semibold mb-2 text-muted-foreground">Bill To:</h3>
                                <address className="not-italic">
                                    <strong>{order.shippingAddress.fullName}</strong><br />
                                    {order.shippingAddress.address}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                                    {order.shippingAddress.country}<br/>
                                    {order.shippingAddress.email}
                                </address>
                            </div>
                        </section>
                        
                        <section className="my-8">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-center">Quantity</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.variant.name}</div>
                                            </TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right">GH₵{item.variant.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">GH₵{(item.variant.price * item.quantity).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </section>
                        
                        <div className="flex justify-end">
                            <div className="w-full max-w-sm space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">GH₵{order.subtotal.toFixed(2)}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-medium">GH₵{order.shippingFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span className="font-medium">GH₵{order.tax.toFixed(2)}</span>
                                </div>
                                <Separator/>
                                <div className="flex justify-between text-base font-bold">
                                    <span>Total</span>
                                    <span>GH₵{order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <footer className="mt-8 pt-6 border-t text-center text-muted-foreground text-xs">
                            <p>Thank you for your business!</p>
                            <p>If you have any questions about this invoice, please contact us at support@jaytelclassic.com</p>
                        </footer>
                    </Card>
                </div>
            </div>
            <style jsx global>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  .print-container, .print-container * {
                    visibility: visible;
                  }
                  .print-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                }
            `}</style>
        </div>
    );
}
