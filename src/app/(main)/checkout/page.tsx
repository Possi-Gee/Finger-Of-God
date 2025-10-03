
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { useOrders } from '@/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';
import { CreditCard, Truck, Smartphone, Store, MessageSquare, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/context/order-context';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { usePaystackPayment } from 'react-paystack';


const checkoutSchema = z.discriminatedUnion("deliveryMethod", [
    z.object({
        deliveryMethod: z.literal('delivery'),
        fullName: z.string().min(3, 'Full name is required'),
        email: z.string().email('A valid email is required'),
        address: z.string().min(5, 'Address is required'),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        zip: z.string().min(5, 'A valid ZIP code is required'),
        country: z.string().min(2, 'Country is required'),
    }),
    z.object({
        deliveryMethod: z.literal('pickup'),
        fullName: z.string().optional(),
        email: z.string().email('A valid email is required'),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
    })
]).and(
    z.discriminatedUnion("paymentMethod", [
        z.object({
            paymentMethod: z.literal('card'),
             // Card fields are no longer required here as Paystack handles them
            cardNumber: z.string().optional(),
            expiryDate: z.string().optional(),
            cvv: z.string().optional(),
        }),
        z.object({
            paymentMethod: z.literal('on_delivery'),
        }),
    ])
).and(z.object({
  orderNotes: z.string().optional(),
}));


type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { state: settings } = useSiteSettings();
  const { dispatch: orderDispatch } = useOrders();
  const { items } = cartState;
  const { toast } = useToast();
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'on_delivery'>('card');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paystackConfig, setPaystackConfig] = useState<any | null>(null);

  const initializePayment = usePaystackPayment(paystackConfig);


  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'card',
      deliveryMethod: 'delivery',
      fullName: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      orderNotes: '',
    }
  });

   useEffect(() => {
    if (!loading && !user) {
        toast({
            title: 'Authentication Required',
            description: 'Please log in to proceed with your order.',
            variant: 'destructive',
        });
        router.push('/login?redirect=/checkout');
    }
    if (user) {
      form.setValue('email', user.email || '');
      form.setValue('fullName', user.displayName || '');
    }
  }, [user, loading, router, toast, form]);
  
  const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const tax = subtotal * (settings.taxRate / 100);
  const deliveryFee = deliveryMethod === 'delivery' && subtotal > 0 ? settings.shippingFee : 0;
  const total = subtotal + tax + deliveryFee;

  const createOrderInFirestore = (data: CheckoutFormValues, transactionRef?: string) => {
     if (!user) {
      toast({
        title: 'Please Login',
        description: 'You must be logged in to place an order.',
        variant: 'destructive'
      })
      router.push(`/login?redirect=/checkout`);
      setIsSubmitting(false);
      return;
    }
    
    const { paymentMethod, deliveryMethod, orderNotes, email } = data;
    const orderId = Date.now().toString().slice(-8);

    const newOrder: Order = {
      id: orderId,
      userId: user.uid,
      orderId: orderId.toString(),
      customerEmail: email,
      date: new Date().toISOString(),
      items: items,
      subtotal,
      tax,
      shippingFee: deliveryFee,
      total,
      shippingAddress: data.deliveryMethod === 'delivery' ? { 
        fullName: data.fullName!,
        email: data.email!,
        address: data.address!, 
        city: data.city!, 
        state: data.state!, 
        zip: data.zip!, 
        country: data.country! 
      } : { fullName: data.fullName || user.displayName || 'In-store Pickup', email: data.email!, address: '', city: '', state: '', zip: '', country: '' },
      paymentMethod,
      deliveryMethod,
      status: paymentMethod === 'card' ? 'Pending' : 'Pending', // All orders start as pending
      orderNotes: orderNotes,
      appName: "Jaytel Classic Store",
      // Add transaction reference if available
      ...(transactionRef && { transactionRef }),
    };

    const orderRef = doc(collection(db, 'orders'), newOrder.id.toString());
    setDoc(orderRef, newOrder).then(() => {
        orderDispatch({ type: 'ADD_ORDER', payload: newOrder });
        toast({
          title: 'Order Placed!',
          description: 'Thank you for your purchase. A confirmation email will be sent shortly.',
        });
        cartDispatch({ type: 'CLEAR_CART' });
        router.push(`/orders/${newOrder.id}`);
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'create',
            requestResourceData: newOrder
        });
        errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        setIsSubmitting(false);
    });
  }


  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    
    if (data.paymentMethod === 'card') {
      // Configure Paystack
       const newConfig = {
            reference: (new Date()).getTime().toString(),
            email: data.email,
            amount: total * 100, // Amount in kobo
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
            currency: 'GHS',
        };
       
        // This is async, so we wait for it to be set
        await new Promise<void>(resolve => {
            setPaystackConfig(newConfig);
            resolve();
        });
       
    } else {
      // For other payment methods, create order directly
      createOrderInFirestore(data);
    }
  };
  
    // Effect to trigger Paystack payment after config is set
  useEffect(() => {
    if (paystackConfig) {
      initializePayment({
        onSuccess: (transaction) => {
          // Pass form data and transaction ref to order creation
          createOrderInFirestore(form.getValues() as CheckoutFormValues, transaction.reference);
        },
        onClose: () => {
          toast({
            title: 'Payment cancelled',
            description: 'Your payment was not completed.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
        },
      });
    }
  }, [paystackConfig]);


  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin" />
            <p className="mt-4">Verifying authentication...</p>
        </div>
    );
  }

  if (items.length === 0 && !isSubmitting) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-semibold">Your cart is empty.</h1>
            <p className="mt-2 text-muted-foreground">You can't proceed to checkout without any items.</p>
            <Button onClick={() => router.push('/')} className="mt-6">Continue Shopping</Button>
        </div>
    );
  }
  
  const getSubmitButtonText = () => {
    if (isSubmitting) return "Processing...";
    if (selectedPaymentMethod === 'card') return `Pay GH₵${total.toFixed(2)} Now`;
    return 'Place Order';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
             <Card>
              <CardHeader>
                <CardTitle>Delivery Method</CardTitle>
                <CardDescription>Choose how you'd like to receive your order.</CardDescription>
              </CardHeader>
              <CardContent>
                 <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                       <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                              setDeliveryMethod(value as any);
                            }}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            <FormItem>
                              <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                                <Truck className="mb-3 h-6 w-6" />
                                Home Delivery
                              </Label>
                            </FormItem>
                            <FormItem>
                              <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                                <Store className="mb-3 h-6 w-6" />
                                In-store Pickup
                              </Label>
                            </FormItem>
                          </RadioGroup>
                       </FormControl>
                    </FormItem>
                  )}
                 />
              </CardContent>
             </Card>

            <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                  <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                </CardContent>
            </Card>

            {deliveryMethod === 'delivery' && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USA">United States</SelectItem>
                            <SelectItem value="CAN">Canada</SelectItem>
                            <SelectItem value="MEX">Mexico</SelectItem>
                             <SelectItem value="GHA">Ghana</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you'd like to pay for your order.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                       <FormControl>
                         <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedPaymentMethod(value as any);
                          }}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <FormItem>
                            <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                              <RadioGroupItem value="card" id="card" className="peer sr-only" />
                              <CreditCard className="mb-3 h-6 w-6"/>
                              Pay Now
                            </Label>
                          </FormItem>
                          <FormItem>
                            <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value="on_delivery" id="on_delivery" className="peer sr-only" />
                                <Truck className="mb-3 h-6 w-6"/>
                                Pay on Delivery
                            </Label>
                          </FormItem>
                         </RadioGroup>
                       </FormControl>
                       <FormMessage className="pt-4" />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardContent>
                {selectedPaymentMethod === 'card' && (
                  <div className="text-center text-muted-foreground bg-gray-50 p-4 rounded-md">
                     You will be redirected to Paystack to complete your payment securely.
                  </div>
                )}
                {selectedPaymentMethod === 'on_delivery' && (
                  <div className="text-center text-muted-foreground bg-gray-50 p-4 rounded-md">
                    You will pay with cash or mobile money when your order is delivered.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <MessageSquare />
                      Order Notes (Optional)
                  </CardTitle>
                  <CardDescription>
                      Add any special instructions for your order.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <FormField
                      control={form.control}
                      name="orderNotes"
                      render={({ field }) => (
                          <FormItem>
                              <FormControl>
                                  <Textarea
                                      placeholder="e.g., Please leave the package at the front door."
                                      {...field}
                                  />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
              </CardContent>
            </Card>

          </div>

          <div className="mt-8 lg:mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y mb-6">
                  {items.map(item => (
                    <li key={item.id} className="flex items-center py-3">
                       <Image src={item.image} alt={item.name} width={48} height={48} className="rounded-md" />
                      <div className="ml-4 flex-grow">
                        <p className="font-semibold text-sm">{item.name} <span className="text-muted-foreground">({item.variant.name})</span></p>
                         <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">GH₵{(item.variant.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <Separator />
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>GH₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes ({settings.taxRate}%)</span>
                    <span>GH₵{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span>GH₵{deliveryFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>GH₵{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Button type="submit" className="w-full" size="lg" disabled={items.length === 0 || isSubmitting}>
                   {isSubmitting && <Loader2 className="mr-2 animate-spin"/>}
                    {getSubmitButtonText()}
                 </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
