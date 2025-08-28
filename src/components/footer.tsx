
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.48 2.96,10.28 2.38,9.95C2.38,9.97 2.38,9.98 2.38,10C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16.03 6.02,17.25 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M18,3.25H6A2.75,2.75,0,0,0,3.25,6V18A2.75,2.75,0,0,0,6,20.75H18A2.75,2.75,0,0,0,20.75,18V6A2.75,2.75,0,0,0,18,3.25ZM17.25,8.5H15.5a.75.75,0,0,0-.75.75v1.5h2.5l-.34,2.5H14.75V18h-3V13.25H10V10.75h1.75V9.06c0-1.78,1.08-2.76,2.69-2.76h2.06Z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
  </svg>
);

export function Footer() {
  const { state: settings } = useSiteSettings();

  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
               {settings.logoUrl ? (
                <Image src={settings.logoUrl} alt={settings.appName} width={120} height={40} style={{objectFit: 'contain', filter: 'brightness(0.1)'}} />
              ) : (
                 <span className="text-xl font-bold">{settings.appName}</span>
              )}
            </Link>
            <p className="text-sm text-muted-foreground">
              Your one-stop shop for everything you need.
            </p>
          </div>

          {settings.footer.columns.map((column) => (
             <div key={column.id} className="space-y-3">
                <h4 className="font-semibold">{column.title}</h4>
                <ul className="space-y-2 text-sm">
                    {column.links.map((link) => (
                        <li key={link.id}>
                            <Link href={link.url} className="text-muted-foreground hover:text-primary">{link.label}</Link>
                        </li>
                    ))}
                </ul>
            </div>
          ))}
          
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
             <h4 className="font-semibold">Subscribe to our newsletter</h4>
            <p className="text-sm text-muted-foreground mt-2 mb-4">Get the latest deals and updates straight to your inbox.</p>
            <form className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Email" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {settings.appName}. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
             {settings.footer.socialLinks.twitter && <Link href={settings.footer.socialLinks.twitter} className="hover:text-primary"><TwitterIcon className="h-5 w-5" /></Link>}
            {settings.footer.socialLinks.facebook && <Link href={settings.footer.socialLinks.facebook} className="hover:text-primary"><FacebookIcon className="h-5 w-5" /></Link>}
            {settings.footer.socialLinks.instagram && <Link href={settings.footer.socialLinks.instagram} className="hover:text-primary"><InstagramIcon className="h-5 w-5" /></Link>}
          </div>
        </div>
      </div>
    </footer>
  );
}
