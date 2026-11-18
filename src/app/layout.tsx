import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'SmartCar | Verified Pre-Owned Cars & 24/7 AI Sales Assistant',
  description:
    'Browse 150-point certified used cars with fixed transparent pricing, 7-day money-back guarantee, and instant AI automotive concierge.',
  keywords: [
    'used cars',
    'certified pre-owned',
    'buy used car',
    'AI car sales assistant',
    'SmartCar dealer',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
