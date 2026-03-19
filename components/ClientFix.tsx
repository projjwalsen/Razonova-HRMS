// components/ClientFix.tsx
"use client";

import { useEffect } from "react";

export default function ClientFix() {
  useEffect(() => {
    document.body.style.visibility = 'visible';

    const gsapElements = document.querySelectorAll('[class*="gsap-"]');
    gsapElements.forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });

    document.body.classList.add('loaded');

    return () => {
      document.body.classList.remove('loaded');
    };
  }, []);

  return null;
}