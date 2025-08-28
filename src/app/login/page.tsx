import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Lock, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.88 1.62-4.41 0-7.99-3.59-7.99-7.99s3.58-7.99 7.99-7.99c2.27 0 4.13.88 5.61 2.29l-2.2 2.2c-1.39-1.31-3.2-2.2-5.61-2.2-3.41 0-6.17 2.76-6.17 6.17s2.76 6.17 6.17 6.17c2.09 0 3.65-.88 4.79-1.98.92-.92 1.4-2.36 1.58-4.26H12.48z"
    />
  </svg>
);

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.15,1.9A5.86,5.86,0,0,0,8.83,4.3a5.52,5.52,0,0,1,1.52,4.2,5.89,5.89,0,0,1-3.32,5.24,6.22,6.22,0,0,0,3.52,10.29,6.07,6.07,0,0,0,4.15-1.74,5.77,5.77,0,0,0,3.31,1.74,6.22,6.22,0,0,0,3.52-10.29,5.89,5.89,0,0,1-3.32-5.24,5.52,5.52,0,0,1,1.52-4.2A5.86,5.86,0,0,0,12.15,1.9Z"
    />
  </svg>
);

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center space-x-2">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">ShopWave</span>
            </Link>
        </div>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>Enter your details to create a new account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input id="signup-name" type="text" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-sm text-muted-foreground">OR CONTINUE WITH</span>
      </div>
       <div className="grid grid-cols-2 gap-4">
          <Button variant="outline">
            <GoogleIcon className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button variant="outline">
            <AppleIcon className="mr-2 h-4 w-4" />
            Apple
          </Button>
        </div>
      </div>
    </div>
  );
}
