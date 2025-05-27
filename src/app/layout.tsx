import type { Metadata } from 'next';
// import { GeistSans } from 'geist/font/sans'; // Removed problematic import
// import { GeistMono } from 'geist/font/mono'; // Removed problematic import
import './globals.css';
import { AppLayout } from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'PhotoRecipe - AI Powered Recipe Generator',
  description: 'Generate recipes from photos of your ingredients!',
  icons: {
    icon: '/favicon.ico', // Assuming a favicon might be added later
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
