'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

interface HeroProps {
  title: string;
  subtitle: string;
  description?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  backgroundImage?: string;
  variant?: 'default' | 'center' | 'minimal';
}

const Hero = ({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  backgroundImage,
  variant = 'default',
}: HeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline
        .from('.hero-subtitle', {
          opacity: 0,
          y: 30,
          duration: 0.8,
        })
        .from(
          '.hero-title',
          {
            opacity: 0,
            y: 50,
            duration: 0.8,
          },
          '-=0.4'
        )
        .from(
          '.hero-description',
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
          },
          '-=0.4'
        )
        .from(
          '.hero-cta',
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.2,
          },
          '-=0.4'
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const alignmentClasses = {
    default: 'text-left items-start',
    center: 'text-center items-center',
    minimal: 'text-left items-start',
  };

  return (
    <section
      ref={heroRef}
      className={`relative min-h-screen flex items-center ${
        variant === 'center' ? 'justify-center' : 'justify-start'
      } bg-white overflow-hidden`}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Background Pattern */}
      {!backgroundImage && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-black/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-black/5 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className={`max-w-4xl ${alignmentClasses[variant]}`}>
          {/* Subtitle */}
          <p className="hero-subtitle text-sm font-semibold text-black mb-4 tracking-widest uppercase">
            {subtitle}
          </p>

          {/* Title */}
          <h1
            className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 font-['Montserrat'] leading-tight"
          >
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="hero-description text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}

          {/* CTAs */}
          <div className="hero-cta flex flex-wrap gap-4">
            {primaryCTA && (
              <Link
                href={primaryCTA.href}
                className="px-8 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                {primaryCTA.label}
              </Link>
            )}
            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className="px-8 py-4 bg-transparent text-black border-2 border-black rounded-lg font-semibold hover:bg-black hover:text-white transition-all duration-300"
              >
                {secondaryCTA.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-black rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-black rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
