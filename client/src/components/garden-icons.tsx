// Garden-themed decorative SVG components
// Extracted from the garden theme design

export const Sun = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <circle cx="32" cy="32" r="12" fill="#fde047" />
    {[...Array(12)].map((_, i) => {
      const angle = (i * Math.PI * 2) / 12;
      const x1 = 32 + Math.cos(angle) * 18;
      const y1 = 32 + Math.sin(angle) * 18;
      const x2 = 32 + Math.cos(angle) * 28;
      const y2 = 32 + Math.sin(angle) * 28;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fde047" strokeWidth="4" strokeLinecap="round" />;
    })}
  </svg>
);

export const Cloud = ({ className = "w-24 h-12", opacity = 0.7 }: { className?: string; opacity?: number }) => (
  <svg viewBox="0 0 120 60" className={className} style={{ opacity }} aria-hidden>
    <ellipse cx="40" cy="30" rx="20" ry="14" fill="white" />
    <ellipse cx="60" cy="26" rx="24" ry="18" fill="white" />
    <ellipse cx="80" cy="32" rx="22" ry="16" fill="white" />
  </svg>
);

export const Sprout = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M12 22c-.6-5-1-9 0-12 1.5-4.5 5.5-6.5 10-7-1 4-3.5 8-8 9-1.1.2-2 .9-2 2v8z" fill="#16a34a" />
    <path d="M12 14c-.5-3-1.8-5.3-4.3-6.9C5 5.5 2.4 5.1 1 5c.9 2.9 2.4 5 4.7 6.4 1.9 1.1 4 1.6 6.3 2.6z" fill="#22c55e" />
  </svg>
);

export const Barn = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <rect x="10" y="24" width="44" height="28" fill="#ef4444" rx="2" />
    <polygon points="32,10 8,26 56,26" fill="#b91c1c" />
    <rect x="28" y="34" width="8" height="18" fill="#7f1d1d" />
    <line x1="32" y1="34" x2="32" y2="52" stroke="#efefef" strokeWidth="2" />
    <line x1="28" y1="43" x2="36" y2="43" stroke="#efefef" strokeWidth="2" />
  </svg>
);

export const Bee = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <ellipse cx="32" cy="36" rx="12" ry="8" fill="#f59e0b" />
    <rect x="22" y="32" width="20" height="8" fill="#111827" rx="2" />
    <rect x="26" y="32" width="3" height="8" fill="#f59e0b" />
    <rect x="35" y="32" width="3" height="8" fill="#f59e0b" />
    <ellipse cx="22" cy="36" rx="5" ry="4" fill="#111827" />
    <ellipse cx="42" cy="36" rx="5" ry="4" fill="#111827" />
    <ellipse cx="25" cy="28" rx="6" ry="4" fill="#93c5fd" />
    <ellipse cx="39" cy="28" rx="6" ry="4" fill="#93c5fd" />
  </svg>
);

export const Hills = ({ className = "w-full h-24 md:h-28" }: { className?: string }) => (
  <svg viewBox="0 0 800 120" className={className} aria-hidden>
    <path d="M0 60 C 150 0, 350 120, 500 60 C 650 0, 750 120, 800 60 L800 120 L0 120 Z" fill="#86efac" />
    <path d="M0 80 C 120 20, 320 140, 520 80 C 680 30, 760 120, 800 100 L800 120 L0 120 Z" fill="#4ade80" />
  </svg>
);