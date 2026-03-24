"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    const removeExtensionAttributes = () => {
      document.documentElement.removeAttribute('crxlauncher');
    };

    removeExtensionAttributes();

    const observer = new MutationObserver(removeExtensionAttributes);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['crxlauncher']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}