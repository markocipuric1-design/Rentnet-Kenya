"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA_ID = "G-FS1KPGG40M";
const STORAGE_KEY = "rentnet_cookie_consent";

export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        const prefs = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
        setEnabled(!!prefs.analytics);
      } catch {}
    };
    check();
    window.addEventListener("rentnet:consent", check);
    return () => window.removeEventListener("rentnet:consent", check);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}');
      `}</Script>
    </>
  );
}
