"use client";

const logos = [
  {
    key: "loco",
    el: (
      <svg viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6">
        <rect x="0" y="6" width="16" height="16" rx="3" fill="#b0b0b0" />
        <rect x="4" y="10" width="8" height="8" rx="1.5" fill="white" />
        <text x="22" y="20" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="16" fill="#b0b0b0" letterSpacing="-0.5">CO</text>
      </svg>
    ),
  },
  {
    key: "logoipsum1",
    el: (
      <svg viewBox="0 0 130 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7">
        <circle cx="12" cy="16" r="11" stroke="#b0b0b0" strokeWidth="1.5" fill="none" />
        <path d="M12 7 L12 16 L18 20" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" />
        <text x="28" y="14" fontFamily="Georgia, serif" fontWeight="700" fontSize="9" fill="#b0b0b0">Logoipsum</text>
        <text x="28" y="25" fontFamily="Georgia, serif" fontWeight="400" fontSize="7.5" fill="#b0b0b0">Brand Standard</text>
      </svg>
    ),
  },
  {
    key: "logoipsum2",
    el: (
      <svg viewBox="0 0 115 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6">
        <text x="0" y="19" fontFamily="Georgia, serif" fontWeight="400" fontSize="11" fill="#b0b0b0">logo</text>
        <circle cx="44" cy="14" r="8" stroke="#b0b0b0" strokeWidth="1.5" fill="none" />
        <circle cx="44" cy="14" r="3" fill="#b0b0b0" />
        <rect x="42.5" y="4" width="3" height="3" rx="0.5" fill="#b0b0b0" />
        <rect x="42.5" y="4" width="3" height="3" rx="0.5" fill="#b0b0b0" transform="rotate(45 44 14)" />
        <rect x="42.5" y="4" width="3" height="3" rx="0.5" fill="#b0b0b0" transform="rotate(90 44 14)" />
        <rect x="42.5" y="4" width="3" height="3" rx="0.5" fill="#b0b0b0" transform="rotate(135 44 14)" />
        <rect x="42.5" y="4" width="3" height="3" rx="0.5" fill="#b0b0b0" transform="rotate(180 44 14)" />
        <rect x="42.5" y="4" width="3" height="3" rx="0.5" fill="#b0b0b0" transform="rotate(225 44 14)" />
        <rect x="42.5" y="4" width="3" height="3" rx="0.5" fill="#b0b0b0" transform="rotate(270 44 14)" />
        <rect x="42.5" y="4" width="3" height="3" rx="0.5" fill="#b0b0b0" transform="rotate(315 44 14)" />
        <text x="56" y="19" fontFamily="Georgia, serif" fontWeight="400" fontSize="11" fill="#b0b0b0"> ipsum</text>
      </svg>
    ),
  },
  {
    key: "ipsum",
    el: (
      <svg viewBox="0 0 90 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6">
        <text x="0" y="20" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="18" fill="#b0b0b0" letterSpacing="2">IPSUM</text>
      </svg>
    ),
  },
  {
    key: "logoipsum3",
    el: (
      <svg viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6">
        <path d="M10 4 L18 7 L18 15 C18 19 14 22 10 24 C6 22 2 19 2 15 L2 7 Z" stroke="#b0b0b0" strokeWidth="1.5" fill="none" />
        <path d="M6 14 L9 17 L14 11" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="24" y="19" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="12" fill="#b0b0b0" letterSpacing="0.3">Logoipsum</text>
      </svg>
    ),
  },
  {
    key: "brand1",
    el: (
      <svg viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6">
        <rect x="0" y="4" width="20" height="20" rx="10" stroke="#b0b0b0" strokeWidth="1.5" fill="none" />
        <path d="M6 14 h8 M10 10 v8" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" />
        <text x="26" y="19" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="11" fill="#b0b0b0" letterSpacing="0.3">NEXUS</text>
      </svg>
    ),
  },
  {
    key: "brand2",
    el: (
      <svg viewBox="0 0 90 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6">
        <polygon points="10,4 18,22 2,22" stroke="#b0b0b0" strokeWidth="1.5" fill="none" />
        <text x="24" y="19" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="700" fontSize="13" fill="#b0b0b0">Venture</text>
      </svg>
    ),
  },
];

const allLogos = [...logos, ...logos, ...logos];

export default function TrustedBySection() {
  return (
    <>
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: scroll-left 20s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .marquee-wrapper {
          overflow: hidden;
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }
      `}</style>

      <section className="w-full bg-white py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          {/* Fixed label */}
          <p className="text-center text-xl font-medium text-black font-montserrat sm:text-left sm:text-2xl">
            Trusted by industry leader
          </p>

          {/* Scrolling logos */}
          <div className="marquee-wrapper w-full">
            <div className="marquee-track items-center gap-8">
              {allLogos.map((logo, i) => (
                <div
                  key={`${logo.key}-${i}`}
                  className="flex items-center justify-center px-6 opacity-50 transition-opacity duration-300 hover:opacity-75 sm:px-8"
                >
                  {logo.el}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}