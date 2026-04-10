'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
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
    
    return () => {
      observer.disconnect();
    };
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Quamon - A comprehensive grade calculator for students. Track grades across semesters, calculate weighted averages, import grades from PDF files, and calculate what scores you need to achieve your desired GPA." />
        <meta name="keywords" content="grade calculator, GPA calculator, student grades, academic tracking, semester grades, weighted average, PDF import" />
        <meta name="author" content="Quamon Team" />
        <meta property="og:title" content="Quamon - Grade Calculator" />
        <meta property="og:description" content="A comprehensive grade calculator for students. Track grades, calculate weighted averages, and achieve your academic goals." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Quamon - Grade Calculator" />
        <meta name="twitter:description" content="A comprehensive grade calculator for students. Track grades, calculate weighted averages, and achieve your academic goals." />
        
        {/* Performance optimizations */}
        <link rel="dns-prefetch" href="//appwrite.io" />
        <link rel="preload" href="../App.css" as="style" />
        <link rel="preload" href="../index.css" as="style" />
        <link rel="preconnect" href="https://v1.appwrite.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cloud.appwrite.io" crossOrigin="anonymous" />
        
        {/* Inline critical CSS to prevent render blocking */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for above-the-fold content */
            body { 
              margin: 0; 
              padding: 0; 
              height: 100%;
              background-color: #27262B;
              color: #ffffff;
            }
            html {
              -webkit-text-size-adjust: 100%;
              text-size-adjust: 100%;
            }
            #root {
              width: 100%;
              margin: 0;
              padding: 0;
            }
            /* CSS Variables */
            :root {
              --bg-body: #27262B;
              --bg-container: #27262B;
              --text-color: #ffffff;
              --border-color: #515058;
              --primary-purple: #2C84FA;
              --header-text: #ffffff;
              --dropdown-bg: #2B2D31;
              --dropdown-item-hover: #3F3F46;
              --input-bg: #302D36;
              --modal-bg: #1e1e1e;
              --text-muted: #AAA;
              --dropdown-border: #454545;
              --tab-inactive: #3F3F46;
              --form-card-bg: #27262B;
              --form-input-white: #3f3f46;
              --success-green: #22C55E;
            }
            /* Footer layout stabilization */
            .footer {
              min-height: 200px;
              max-height: 200px;
              height: 200px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 40px 20px;
              gap: 24px;
              width: 100%;
              box-sizing: border-box;
              contain-intrinsic-size: 200px 100%;
              contain: layout style paint;
            }
            .footer h2 {
              margin: 0;
              font-size: 20px;
              font-weight: bold;
              height: 24px;
              line-height: 1.2;
            }
            .footer a {
              color: #ffffff;
              text-decoration: none;
            }
            .footer-icons {
              display: flex;
              gap: 24px;
              align-items: center;
              height: 32px;
            }
            .footer-icon {
              width: 24px;
              height: 24px;
            }
            /* App container stability */
            .app-container {
              min-height: calc(100vh - 200px);
              contain: layout style paint;
              contain-intrinsic-size: calc(100vh - 200px) 100%;
              position: relative;
            }
            .app-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
              z-index: -1;
              opacity: 0;
              transition: opacity 0.3s ease;
            }
            .app-container.loading::before {
              opacity: 1;
            }
            /* Loading skeleton */
            .loading-skeleton { 
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
            }
            @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          `
        }} />
      </head>
      <body className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}