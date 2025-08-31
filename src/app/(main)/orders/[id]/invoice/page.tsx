
'use client';

import { useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/use-orders';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { useHomepage } from '@/hooks/use-homepage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, ArrowLeft, Loader2, Download } from 'lucide-react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const getPaymentMethodName = (method: string) => {
    const names: { [key: string]: string } = {
        card: 'Credit/Debit Card',
        mobile_money: 'Mobile Money',
        on_delivery: 'Pay on Delivery',
    };
    return names[method] || 'Unknown';
}

const getPaymentStatus = (orderStatus: string) => {
    if (orderStatus === 'Delivered') {
        return { text: 'Paid', className: 'font-semibold text-green-600' };
    }
    return { text: 'Payment Pending', className: 'font-semibold text-yellow-600' };
};


export default function InvoicePage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { state: orderState } = useOrders();
    const { state: siteSettings } = useSiteSettings();
    const { state: homepageState } = useHomepage();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const order = useMemo(() => {
        return orderState.orders.find((o) => o.id.toString() === id);
    }, [id, orderState.orders]);

    const handleDownload = async () => {
        if (!invoiceRef.current || !order) return;
        
        setIsDownloading(true);

        // Hide buttons during capture
        const buttons = invoiceRef.current.querySelectorAll('button');
        buttons.forEach(btn => btn.style.visibility = 'hidden');

        try {
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // This is the crucial fix
                backgroundColor: null,
            });

            // Restore button visibility
            buttons.forEach(btn => btn.style.visibility = 'visible');

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
            // Restore button visibility even on error
            buttons.forEach(btn => btn.style.visibility = 'visible');
        } finally {
            setIsDownloading(false);
        }
    };


    if (orderState.loading) {
        return (
             <div className="container mx-auto px-4 py-8 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                <p className="mt-4">Loading Invoice...</p>
            </div>
        )
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
    
    const paymentStatus = getPaymentStatus(order.status);
    
    const contactNumber = useMemo(() => {
        const ctaText = homepageState.callToAction.text;
        const numberMatch = ctaText.match(/\b\d[\d\s-]+\d\b/);
        return numberMatch ? numberMatch[0].trim() : '+233 123 456 789';
    }, [homepageState.callToAction.text]);


    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="container mx-auto px-4 py-8">
                 <div className="mb-8 flex justify-between items-center print:hidden">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2" /> Back to Order Details
                    </Button>
                    <Button onClick={handleDownload} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 animate-spin"/> : <Download className="mr-2"/>}
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                </div>
                <div ref={invoiceRef}>
                    <Card className="p-8 shadow-lg print:shadow-none print:border-none print:p-0">
                        <header className="flex justify-between items-start pb-6 border-b">
                            <div>
                                {siteSettings.logoUrl ? (
                                    <Image src={siteSettings.logoUrl} alt={siteSettings.appName} width={120} height={50} className="object-contain rounded-md" />
                                ) : (
                                    <h1 className="text-3xl font-bold text-primary">{siteSettings.appName}</h1>
                                )}
                                <p className="text-muted-foreground mt-2">Your One-Stop Shop</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold uppercase tracking-wider">Invoice</h2>
                                <p className="text-muted-foreground">#INV-{order.id}</p>
                                <p className="text-muted-foreground mt-1">Date: {new Date(order.date).toLocaleDateString()}</p>
                            </div>
                        </header>

                        <section className="grid grid-cols-2 gap-8 my-8">
                            <div>
                                <h3 className="font-semibold mb-2">Billed To:</h3>
                                <address className="not-italic text-muted-foreground">
                                    {order.shippingAddress.fullName}<br />
                                    {order.shippingAddress.address}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                                    {order.shippingAddress.country}
                                </address>
                            </div>
                            <div className="text-right">
                                <h3 className="font-semibold mb-2">Payment Details:</h3>
                                <p className="text-muted-foreground">
                                    Method: {getPaymentMethodName(order.paymentMethod)}
                                </p>
                                <p className="text-muted-foreground">
                                    Status: <span className={paymentStatus.className}>{paymentStatus.text}</span>
                                </p>
                            </div>
                        </section>

                        <section>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[60%]">Item</TableHead>
                                        <TableHead className="text-center">Quantity</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                                            </TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right">GH₵{item.variant.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">GH₵{(item.variant.price * item.quantity).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </section>

                        <section className="flex justify-end mt-8">
                            <div className="w-full max-w-sm space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>GH₵{order.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax ({siteSettings.taxRate}%)</span>
                                    <span>GH₵{order.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>GH₵{order.shippingFee.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>GH₵{order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </section>

                        <footer className="mt-12 pt-6 border-t text-center text-muted-foreground text-sm">
                            <p>Thank you for your business!</p>
                            <p>{siteSettings.appName} | Accra, Ghana | {contactNumber}</p>
                        </footer>
                    </Card>
                </div>
            </div>
        </div>
    )
}
