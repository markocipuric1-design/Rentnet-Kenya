"use client";

import { useEffect, useState } from "react";

export function SafeHtml({ html, className }: { html: string; className?: string }) {
  const [clean, setClean] = useState(html);

  useEffect(() => {
    import("isomorphic-dompurify").then((mod) => {
      setClean(mod.default.sanitize(html));
    });
  }, [html]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
