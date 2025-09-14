
'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DocumentationPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    setIsDownloading(true);
    const content = contentRef.current;

    // Hide download button from the PDF
    const downloadButton = content.querySelector('#download-button');
    if (downloadButton) (downloadButton as HTMLElement).style.visibility = 'hidden';

    try {
        const canvas = await html2canvas(content, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'px', [canvas.width, canvas.height]);
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('Finger-Of-God-Technical-Documentation.pdf');
    } catch(error) {
        console.error("Failed to generate PDF", error);
    } finally {
        if (downloadButton) (downloadButton as HTMLElement).style.visibility = 'visible';
        setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div ref={contentRef} className="p-4 md:p-8 bg-background">
        <Card className="max-w-4xl mx-auto shadow-none border-none">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl font-bold flex items-center gap-2">
                            <FileText /> Finger Of God Technical Documentation
                        </CardTitle>
                        <CardDescription className="mt-2">
                            An overview of the project's architecture, technologies, and features.
                        </CardDescription>
                    </div>
                    <div id="download-button" className="print:hidden">
                        <Button onClick={handleDownload} disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 animate-spin"/> : <Download className="mr-2"/>}
                            {isDownloading ? 'Downloading...' : 'Download PDF'}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 mt-6">
                 <section>
                    <h2 className="text-2xl font-semibold border-b pb-2 mb-4">1. Project Overview</h2>
                    <p className="text-muted-foreground">
                        Finger Of God is a modern, full-stack e-commerce application built with Next.js and Firebase. It provides a complete shopping experience, including product browsing, a shopping cart, secure checkout, user authentication, and an admin dashboard for store management. The application is designed to be scalable, performant, and easily customizable.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold border-b pb-2 mb-4">2. Technology Stack</h2>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li><strong>Frontend Framework:</strong> Next.js (with App Router) & React</li>
                        <li><strong>Backend & Database:</strong> Firebase (Firestore, Authentication, Cloud Functions)</li>
                        <li><strong>Generative AI:</strong> Genkit (for AI-powered features like product description generation)</li>
                        <li><strong>UI Components:</strong> ShadCN UI, Radix UI</li>
                        <li><strong>Styling:</strong> Tailwind CSS</li>
                        <li><strong>Form Management:</strong> React Hook Form with Zod for validation</li>
                        <li><strong>State Management:</strong> React Context API</li>
                        <li><strong>Deployment:</strong> Vercel & Firebase App Hosting</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold border-b pb-2 mb-4">3. Key Features</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-muted/30">
                            <CardHeader><CardTitle className="text-lg">Customer-Facing</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-2 text-sm">
                                    <li>Product catalog with search and category filters.</li>
                                    <li>Detailed product pages with multiple images and variants.</li>
                                    <li>Shopping cart and persistent wishlist.</li>
                                    <li>Secure checkout with multiple payment options.</li>
                                    <li>User authentication (Email/Password & Google).</li>
                                    <li>Order history and detailed order tracking.</li>
                                    <li>Push notifications for new products.</li>
                                </ul>
                            </CardContent>
                        </Card>
                         <Card className="bg-muted/30">
                            <CardHeader><CardTitle className="text-lg">Admin Panel</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-2 text-sm">
                                    <li>Dashboard with revenue and sales analytics.</li>
                                    <li>Full product management (CRUD operations).</li>
                                    <li>AI-powered product description generation.</li>
                                    <li>Order management with status updates.</li>
                                    <li>Automated email notifications for customers.</li>
                                    <li>Global site settings and homepage customization.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>
                
                 <section>
                    <h2 className="text-2xl font-semibold border-b pb-2 mb-4">4. Project Structure</h2>
                    <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
{`src
├── app/                  # Next.js App Router
│   ├── (main)/           # Main application routes (customer-facing)
│   ├── admin/            # Admin panel routes
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles and theme
├── components/           # Reusable React components
│   └── ui/               # ShadCN UI components
├── context/              # Global state management (React Context)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions, Firebase config
├── ai/                   # Genkit AI flows and configuration
└── functions/            # Firebase Cloud Functions (for triggers)`}
                    </pre>
                </section>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
