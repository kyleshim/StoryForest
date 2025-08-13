import { Sprout } from './garden-icons';

export function StatPill({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string | number; 
  icon?: React.ReactNode 
}) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow border border-green-100">
      {icon}
      <span className="text-sm font-medium text-green-800">{label}</span>
      <span className="text-sm text-green-700">{value}</span>
    </div>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-green-900">Garden row progress</span>
        <span className="text-green-800">{pct}% owned</span>
      </div>
      <div className="h-3 w-full rounded-full bg-green-100 border border-green-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[10px] text-green-700 flex items-center gap-1">
        <Sprout />
        <span>Plant more books to fill the row!</span>
      </div>
    </div>
  );
}

export function GardenToggle({ 
  checked, 
  onChange, 
  label 
}: { 
  checked: boolean; 
  onChange: (v: boolean) => void; 
  label?: string 
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-emerald-500" : "bg-gray-300"
      }`}
      aria-pressed={checked}
      aria-label={label || "toggle"}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function GardenTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-800">
      <Sprout className="w-3 h-3" />
      {text}
    </span>
  );
}

export function GardenButton({ 
  children, 
  onClick, 
  variant = "primary",
  className = ""
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const baseClasses = "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-emerald-400 transition";
  const variantClasses = variant === "primary" 
    ? "bg-emerald-500 text-white hover:bg-emerald-600" 
    : "bg-white border border-green-200 text-green-800 hover:bg-green-50";
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
}