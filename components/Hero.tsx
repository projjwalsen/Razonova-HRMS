import React from 'react'
import Image from 'next/image';
import { Play } from 'lucide-react';
const Hero = () => {
  return (
    <section id="home" className='w-full bg-white font-poppins'>
      <div className='mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:gap-16 lg:px-8'>
        <div className='flex w-full flex-col justify-center text-center lg:text-left lg:max-w-2xl'>
          <span className='text-[#7C5CFC] font-semibold text-base uppercase tracking-[0.12em] font-montserrat'>Recruit - Onboard - Manage</span>
          <h1 className='mt-4 text-4xl font-semibold leading-tight text-black sm:text-5xl md:text-6xl'>Automate Your HR,</h1>
          <h2 className='mt-3 text-4xl font-semibold leading-tight text-black sm:text-5xl md:text-6xl'>Scale Your People</h2>
          <p className='mx-auto mt-6 max-w-2xl text-base text-slate-700 sm:text-lg lg:mx-0'>
            The most trusted full-suite HRMS for your people operations
          </p>
          <p className='mx-auto mt-4 max-w-2xl text-sm text-[#666666] sm:text-base lg:mx-0'>
            The best HR software for SMB companies and startups to manage employees, payroll assistance, time off, and attendance tracking with a single platform.
          </p>
          <div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start'>
            <button className='min-w-[180px] rounded-full bg-[#7C5CFC] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6944e4]'>
              Get Started
            </button>
            <button className='min-w-[180px] inline-flex items-center gap-3 rounded-full border border-[#7C5CFC] px-6 py-3 text-sm font-medium text-[#7C5CFC] transition hover:bg-[#f4f0ff]'>
              <span className='flex size-5 items-center justify-center rounded-full border border-[#7C5CFC] bg-[#f7f2ff] text-[#7C5CFC]'>
                <Play className='size-3' />
              </span>
              How it works
            </button>
          </div>
        </div>

        <div className='w-full max-w-2xl'>
          <Image
            src='/hero.svg'
            alt='Hero Image'
            width={700}
            height={700}
            className='h-auto w-full rounded-[2rem] object-contain'
          />
        </div>
      </div>
    </section>
  )
}

export default Hero