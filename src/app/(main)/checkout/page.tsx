
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
            cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
            expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
            cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
        }),
        z.object({
            paymentMethod: z.literal('mobile_money'),
            mobileMoneyProvider: z.enum(["mtn", "telecel"], { required_error: "Please select a provider" }),
            mobileMoneyNumber: z.string().min(10, 'Please enter a valid phone number'),
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'mobile_money' | 'on_delivery'>('card');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);


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
      // @ts-ignore
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      mobileMoneyNumber: '',
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

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    
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
    
    const orderId = Date.now();

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
      status: 'Pending',
      orderNotes: orderNotes,
      appName: settings.appName,
    };

    try {
      // Use the orderId as the document ID in Firestore for consistency
      const orderRef = doc(collection(db, 'orders'), newOrder.id.toString());
      await setDoc(orderRef, newOrder);
      
      // Dispatch ADD_ORDER here to update local state immediately
      orderDispatch({ type: 'ADD_ORDER', payload: newOrder });

      toast({
        title: 'Order Placed!',
        description: 'Thank you for your purchase. A confirmation email will be sent shortly.',
      });
      
      cartDispatch({ type: 'CLEAR_CART' });
      router.push(`/orders/${newOrder.id}`);

    } catch (error) {
      console.error("Failed to place order:", error);
      toast({
          title: 'Order Failed',
          description: 'There was a problem placing your order. Please try again.',
          variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              </Header>
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
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <FormItem>
                            <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                              <RadioGroupItem value="card" id="card" className="peer sr-only" />
                              <CreditCard className="mb-3 h-6 w-6"/>
                              Credit/Debit Card
                            </Label>
                          </FormItem>
                          <FormItem>
                            <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                              <RadioGroupItem value="mobile_money" id="mobile_money" className="peer sr-only" />
                              <Smartphone className="mb-3 h-6 w-6" />
                              Mobile Money
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
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem className="md:col-span-4">
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input placeholder="0000 0000 0000 0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                 {selectedPaymentMethod === 'mobile_money' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mobileMoneyProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provider</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mtn">MTN Momo</SelectItem>
                                <SelectItem value="telecel">Telecel Cash</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                          control={form.control}
                          name="mobileMoneyNumber"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Mobile Number</FormLabel>
                                  <FormControl>
                                      <Input placeholder="024 123 4567" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
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
                   Place Order
                 </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
