"use client";

import { useEffect, useId, useState } from "react";

export function useScrollReveal(threshold = 0.1) {
  const id = useId();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [id, threshold]);

  return { id, inView };
}

export function revealClass(
  inView: boolean,
  animation = "animate-in fade-in slide-in-from-bottom-4 duration-300"
) {
  return inView ? animation : "opacity-0";
}
