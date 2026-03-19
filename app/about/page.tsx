'use client';

import { useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import gsap from 'gsap';
import Link from 'next/link';

export default function AboutPage() {
  const storyRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const achievementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Story Animation
    if (storyRef.current) {
      gsap.from('.story-content', {
        scrollTrigger: {
          trigger: storyRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 60,
        duration: 0.8,
        ease: 'power3.out',
      });
    }

    // Values Animation
    if (valuesRef.current) {
      gsap.from('.value-card', {
        scrollTrigger: {
          trigger: valuesRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }

    // Team Animation
    if (teamRef.current) {
      gsap.from('.team-member', {
        scrollTrigger: {
          trigger: teamRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }

    // Achievements Animation
    if (achievementsRef.current) {
      gsap.from('.achievement-item', {
        scrollTrigger: {
          trigger: achievementsRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        x: -30,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }
  }, []);

  const coreValues = [
    {
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, delivering outstanding results that exceed expectations.',
      icon: '⭐',
    },
    {
      title: 'Integrity',
      description: 'We conduct business with honesty, transparency, and ethical practices that build trust.',
      icon: '🛡️',
    },
    {
      title: 'Innovation',
      description: 'We embrace change and innovation, constantly seeking better ways to serve our clients.',
      icon: '💡',
    },
    {
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and foster strong partnerships with our clients.',
      icon: '🤝',
    },
    {
      title: 'Client-Centric',
      description: 'Our clients\' success is our success. We\'re committed to delivering tailored solutions.',
      icon: '🎯',
    },
    {
      title: 'Continuous Learning',
      description: 'We invest in ongoing learning and development to stay at the forefront of HR practices.',
      icon: '📚',
    },
  ];

  const teamMembers = [
    {
      name: 'Jennifer Martinez',
      role: 'CEO & Founder',
      image: '/team/jennifer.jpg',
    },
    {
      name: 'David Thompson',
      role: 'Chief Operating Officer',
      image: '/team/david.jpg',
    },
    {
      name: 'Sarah Chen',
      role: 'VP of Human Resources',
      image: '/team/sarah.jpg',
    },
    {
      name: 'Michael Brown',
      role: 'Director of Client Services',
      image: '/team/michael.jpg',
    },
  ];

  const achievements = [
    {
      number: '500+',
      label: 'Clients Served',
      description: 'Across various industries and sectors',
    },
    {
      number: '14+',
      label: 'Years Experience',
      description: 'Of delivering HR excellence',
    },
    {
      number: '98%',
      label: 'Satisfaction Rate',
      description: 'Client retention and satisfaction',
    },
    {
      number: '50+',
      label: 'HR Experts',
      description: 'Certified professionals on our team',
    },
    {
      number: '15+',
      label: 'Industry Awards',
      description: 'Recognition for excellence',
    },
    {
      number: '1000+',
      label: 'Projects Completed',
      description: 'Successful HR transformations',
    },
  ];

  return (
    <>
      
      <main>
        {/* Hero Section */}
        <Hero
          title="About HRMS"
          subtitle="Our Story"
          description="Discover our journey, mission, and the values that drive us to transform human resource management."
        />

        {/* Our Story Section */}
        <section ref={storyRef} className="section-padding bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="story-content">
                <span className="text-sm font-semibold text-black tracking-widest uppercase mb-4 block">
                  Our Story
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 font-['Montserrat']">
                  Building Better Workplaces Since 2010
                </h2>

                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    Founded in 2010, HRMS began with a simple vision: to make human resource
                    management more efficient, effective, and employee-centric. What started
                    as a small consulting firm has grown into a comprehensive HR solutions
                    provider serving hundreds of clients across diverse industries.
                  </p>

                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    Our journey has been marked by continuous innovation and a deep commitment
                    to understanding the evolving needs of modern workplaces. From startups
                    to Fortune 500 companies, we've helped organizations of all sizes
                    transform their HR operations and build stronger, more engaged workforces.
                  </p>

                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    Today, we're proud to be recognized as industry leaders, combining
                    cutting-edge technology with human expertise to deliver solutions that
                    make a real difference in people's work lives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Mission */}
              <div className="p-10 bg-white border-2 border-gray-100 rounded-2xl">
                <div className="text-5xl mb-6">🎯</div>
                <h3 className="text-3xl font-bold mb-4 font-['Montserrat']">Our Mission</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  To empower organizations with innovative HR solutions that optimize workforce
                  potential, foster inclusive cultures, and drive sustainable business growth.
                  We believe that when people thrive, businesses succeed.
                </p>
              </div>

              {/* Vision */}
              <div className="p-10 bg-black text-white rounded-2xl">
                <div className="text-5xl mb-6">👁️</div>
                <h3 className="text-3xl font-bold mb-4 font-['Montserrat']">Our Vision</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  To be the global leader in HR solutions, recognized for transforming workplaces
                  and setting new standards in HR excellence. We envision a world where every
                  organization has the tools and expertise to build exceptional workplaces.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section ref={valuesRef} className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-black tracking-widest uppercase mb-4 block">
                What We Believe
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-['Montserrat']">
                Our Core Values
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                These principles guide everything we do, from how we work with clients
                to how we support our own team.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreValues.map((value, index) => (
                <div
                  key={index}
                  className="value-card p-8 bg-gray-50 border-2 border-gray-100 rounded-2xl hover:border-black transition-all duration-300"
                >
                  <div className="text-5xl mb-6">{value.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 font-['Montserrat']">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Overview */}
        <section ref={teamRef} className="section-padding bg-black text-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-white tracking-widest uppercase mb-4 block">
                Leadership
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-['Montserrat']">
                Meet Our Leadership Team
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Experienced professionals dedicated to delivering exceptional HR solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="team-member group"
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-6 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl font-bold text-white/20 font-['Montserrat']">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-['Montserrat']">
                    {member.name}
                  </h3>
                  <p className="text-gray-400">{member.role}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/team"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
              >
                Meet the Full Team
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section ref={achievementsRef} className="section-padding bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-black tracking-widest uppercase mb-4 block">
                Milestones
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-['Montserrat']">
                Our Achievements
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Numbers that reflect our commitment to excellence and client success.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="achievement-item p-8 bg-white border-2 border-gray-100 rounded-2xl"
                >
                  <div className="text-5xl font-bold text-black mb-2 font-['Montserrat']">
                    {achievement.number}
                  </div>
                  <div className="text-xl font-bold mb-2 font-['Montserrat']">
                    {achievement.label}
                  </div>
                  <div className="text-gray-500">{achievement.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="section-padding bg-black text-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-['Montserrat']">
                Join Our Growing Family of Satisfied Clients
              </h2>
              <p className="text-gray-400 text-xl mb-10 leading-relaxed">
                Experience the difference that professional HR solutions can make
                for your organization.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
                >
                  Get in Touch
                </Link>
                <Link
                  href="/services"
                  className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-300"
                >
                  Our Services
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
