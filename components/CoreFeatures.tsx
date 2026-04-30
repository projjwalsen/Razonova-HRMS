import React from 'react';
import Image from 'next/image';
import { BarChart3, Shield } from 'lucide-react';

const CoreFeatures = () => {
  const features = [
      {
        icon: BarChart3,
        title: 'Powerful dashboard',
        desc: 'Combine multiple report into a single beautiful dashboard.',
        color: 'bg-violet-50 text-violet-600',
      },
      {
        icon: Shield,
        title: 'Always in Best Organize',
        desc: 'Combine multiple report into a single beautiful dashboard.',
        color: 'bg-fuchsia-50 text-fuchsia-600',
      },
    ];

  return (
   <section id="features" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 items-center lg:grid-cols-[0.95fr_1.05fr] xl:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center text-base font-semibold text-black font-montserrat sm:text-lg">
              Our Core Features
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
              We Make It Effortlessly To Track All Employee Performance
            </h2>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
              Self service data analytic software that lets you create visually appealing data visualizations and insightful dashboard in minutes.
            </p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-6">
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative w-full">
            <div className="hidden md:block absolute -right-8 -top-8 h-44 w-44 rounded-full bg-[#7c3aed]/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-[0_40px_120px_rgba(15,23,42,0.12)]">
              <div className="relative min-h-[260px] md:min-h-[340px] lg:min-h-[540px] w-full">
                <Image
                  src="/core.jpeg"
                  alt="Team working on HR dashboard"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 700px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;
