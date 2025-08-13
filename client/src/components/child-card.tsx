import { ChildWithStats } from '@shared/schema';
import { User, Calendar, BookOpen, Heart } from 'lucide-react';
import { Sprout, Bee } from './garden-icons';
import { calculateAge } from '@/lib/utils';

interface ChildCardProps {
  child: ChildWithStats;
  onClick?: () => void;
}

export function ChildCard({ child, onClick }: ChildCardProps) {
  // Calculate age from birth month and year
  const age = calculateAge(child.birthMonth, child.birthYear);
  
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl border border-green-200 bg-white/80 backdrop-blur p-4 shadow hover:shadow-md transition cursor-pointer book-card"
      onClick={onClick}
      style={{
        backgroundImage:
          "radial-gradient(circle at 10% 10%, rgba(134,239,172,0.15) 0 20%, transparent 20%), radial-gradient(circle at 90% 30%, rgba(252,211,77,0.15) 0 20%, transparent 20%)",
      }}
    >
      {/* Seed-packet style top */}
      <div className="flex items-start gap-3 mb-4">
        <div className="h-14 w-12 shrink-0 rounded-md border-2 border-green-400 bg-white flex items-center justify-center shadow-inner">
          <User className="w-6 h-6 text-green-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-bold text-green-900" title={child.name}>
              {child.name}
            </h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
              GARDENER
            </span>
          </div>
          <div className="flex items-center text-green-700 text-sm mt-1">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Age {age}</span>
            <Sprout className="w-3 h-3 ml-2" />
          </div>
        </div>
      </div>

      {/* Garden stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-200 text-center">
          <BookOpen className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <div className="text-[11px] text-emerald-800 font-medium">Library</div>
          <div className="font-bold text-lg text-emerald-900">{child.libraryCount}</div>
        </div>
        <div className="rounded-lg bg-amber-50 px-3 py-2 border border-amber-200 text-center">
          <Heart className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <div className="text-[11px] text-amber-800 font-medium">Wishlist</div>
          <div className="font-bold text-lg text-amber-900">{child.wishlistCount}</div>
        </div>
      </div>

      {/* Accent strip */}
      <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-green-400 to-emerald-500" />

      {/* Hover bee */}
      <div className="pointer-events-none absolute -right-4 -top-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Bee />
      </div>

      {/* Garden tip */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-1 text-[10px] text-green-700">
          <span>🌱</span>
          <span>Tap to tend this garden</span>
        </div>
      </div>
    </div>
  );
}
