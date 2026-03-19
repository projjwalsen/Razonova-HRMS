import Link from 'next/link';

const Footer = () => {
  const footerSections = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Our Team', href: '/team' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'HR Consulting', href: '/services#consulting' },
        { label: 'Talent Management', href: '/services#talent' },
        { label: 'Payroll Solutions', href: '/services#payroll' },
        { label: 'Analytics', href: '/services#analytics' },
      ],
    },
    {
      title: 'Industries',
      links: [
        { label: 'Healthcare', href: '/industries#healthcare' },
        { label: 'Finance', href: '/industries#finance' },
        { label: 'Technology', href: '/industries#technology' },
        { label: 'Manufacturing', href: '/industries#manufacturing' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Case Studies', href: '/case-studies' },
        { label: 'Blog', href: '/blog' },
        { label: 'Whitepapers', href: '/resources#whitepapers' },
        { label: 'Webinars', href: '/resources#webinars' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'LinkedIn', href: '#linkedin' },
    { name: 'Twitter', href: '#twitter' },
    { name: 'Facebook', href: '#facebook' },
    { name: 'Instagram', href: '#instagram' },
  ];

  return (
    <footer className="bg-black text-white">
      {/* Main Footer */}
      <div className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-xl font-['Montserrat']">H</span>
                </div>
                <span className="text-2xl font-bold font-['Montserrat'] tracking-tight">
                  HRMS
                </span>
              </Link>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Transforming human resource management with innovative solutions that
                empower businesses to build stronger, more productive workplaces.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
                    aria-label={social.name}
                  >
                    <span className="text-sm font-medium">{social.name[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-white mb-4 font-['Montserrat']">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="border-t border-white/10 pt-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-white mb-2 font-['Montserrat']">Address</h4>
                <p className="text-gray-400 text-sm">
                  123 Business Avenue<br />
                  Suite 100<br />
                  New York, NY 10001
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2 font-['Montserrat']">Contact</h4>
                <p className="text-gray-400 text-sm">
                  <a href="tel:+1234567890" className="hover:text-white transition-colors">
                    +1 (234) 567-890
                  </a>
                  <br />
                  <a href="mailto:info@hrms.com" className="hover:text-white transition-colors">
                    info@hrms.com
                  </a>
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2 font-['Montserrat']">Hours</h4>
                <p className="text-gray-400 text-sm">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday - Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} HRMS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
