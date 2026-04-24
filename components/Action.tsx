"use client";

import { Play } from 'lucide-react';

const Action = () => {
  return (
    <section className="w-full bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl text-white shadow-[0_40px_120px_rgba(0,0,0,0.25)] ring-1 ring-white/10 min-h-[420px] sm:min-h-[520px] lg:min-h-[640px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-black/40"
          style={{
            backgroundImage: "url('/action.jpeg')",
            
          }}
        />
        <div
          className="absolute w-full h-full flex justify-center items-center inset-0 bg-[linear-gradient(0deg,#d9d9d9,#d9d9d9),linear-gradient(0deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5))] opacity-10"
        />

        <div className="relative md:mt-52 mt-40 z-10 flex w-full h-full flex-col items-center justify-center px-6 text-center sm:px-10 lg:px-16">
          <button
            type="button"
            className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/25 bg-white/10 text-white shadow-[0_18px_60px_rgba(15,23,42,0.35)] transition duration-300 hover:scale-105 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            aria-label="Play video"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-slate-950 shadow-sm">
              <Play className="h-5 w-5" />
            </span>
          </button>

          <div className="max-w-3xl text-white">
            <p className="mx-auto max-w-2xl text-xl font-medium leading-8 text-white/90 sm:text-2xl lg:text-3xl">
              See Our HR Solutions in Action.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Action;