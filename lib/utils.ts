// Disable GSAP animations that cause blur
export function disableGsapAnimations() {
  if (typeof window !== 'undefined') {
    // Immediately show all content
    document.body.style.visibility = 'visible';

    // Remove any GSAP-style initial states
    const elements = document.querySelectorAll('.gsap-fade-up, .gsap-fade-in, .gsap-slide-left, .gsap-slide-right, .gsap-scale');
    elements.forEach(el => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });
  }
}

// Run immediately
if (typeof window !== 'undefined') {
  disableGsapAnimations();
}
