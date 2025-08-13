import { Sun, Cloud, Barn, Hills } from './garden-icons';

export function GardenHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      {/* Sky gradient */}
      <div className="bg-gradient-to-b from-sky-200 via-sky-100 to-green-100">
        <div className="relative px-6 pt-6 pb-24 md:pb-28">
          <div className="flex items-center gap-3">
            <Barn />
            <h1 className="text-2xl md:text-3xl font-extrabold text-green-900 tracking-tight">
              Reading Roots
            </h1>
          </div>
          <p className="mt-1 text-green-800/90 max-w-xl">
            A garden-themed library for little readers — plant your bookshelf, track what you own, and watch your collection grow.
          </p>

          {/* Sun & clouds */}
          <div className="absolute right-6 top-6 animate-[spin_40s_linear_infinite]">
            <Sun className="w-14 h-14 md:w-16 md:h-16" />
          </div>
          <div className="absolute -right-8 top-16 animate-[float_16s_ease-in-out_infinite]">
            <Cloud />
          </div>
          <div className="absolute left-4 top-8 animate-[float_20s_ease-in-out_infinite]">
            <Cloud className="w-20" opacity={0.5} />
          </div>
        </div>

        {/* Hills */}
        <Hills />
      </div>
    </div>
  );
}