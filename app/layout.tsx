import './globals.css';
import { ReactNode } from 'react';
import Navbar from '@/components/navBar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'St Croix Valley Commons',
  description: 'The BEST Place to Find Local Businesses',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <Navbar />
      <body className="bg-white">{children}

      <Footer />
      </body>
    </html>
  );
}