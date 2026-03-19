'use client';

import { ReactNode, useEffect, useRef } from 'react';

interface AnimatedWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedWrapper({ children, className = '', delay = 0 }: AnimatedWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      // Start fully visible (no blur)
      ref.current.style.opacity = '1';

      // Add subtle animation after a small delay
      const timer = setTimeout(() => {
        if (ref.current) {
          ref.current.style.animation = `fadeInSmooth 0.6s ease-out forwards`;
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  return (
    <div ref={ref} className={className} style={{ opacity: '1' }}>
      {children}
    </div>
  );
}
