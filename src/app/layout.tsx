'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import '../index.css'
import '../App.css'
// Create a client component that wraps the children
function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Remove any attributes added by extensions
    const removeExtensionAttributes = () => {
      document.documentElement.removeAttribute('crxlauncher');
    };
    
    // Run once on mount
    removeExtensionAttributes();
    
    // Set up a mutation observer to handle dynamic changes
    const observer = new MutationObserver(removeExtensionAttributes);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['crxlauncher']
    });
    
    return () => observer.disconnect();
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  useEffect(() => {
    document.title = 'Quamon';
  }, []);
  return (
    <html lang="vi" suppressHydrationWarning>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Quamon - Công cụ tính điểm GPA chuyên nghiệp. Hỗ trợ đa dạng thang điểm (4, 10, 100), nhập điểm từ PDF/Excel, tính điểm kỳ vọng và quản lý kết quả học tập." />
        <meta name="keywords" content="tính điểm GPA, công cụ điểm, quản lý học tập, điểm đại học, thang điểm 4, thang điểm 10, thang điểm 100, nhập điểm PDF, xuất điểm Excel, Quamon" />
        <meta name="author" content="Quamon Team" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Quamon - Công cụ tính điểm GPA" />
        <meta property="og:description" content="Công cụ tính điểm GPA chuyên nghiệp với hỗ trợ đa dạng thang điểm" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Quamon - Công cụ tính điểm GPA" />
        <meta name="twitter:description" content="Công cụ tính điểm GPA chuyên nghiệp với hỗ trợ đa dạng thang điểm" />
        <link rel="canonical" href="https://quamon.vercel.app" />
      </Head>
      <body className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}