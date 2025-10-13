import React, { useMemo } from 'react';
import { BookWithDetails } from '@shared/schema';
import { Heart, ThumbsUp, ThumbsDown, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookSearchResult } from '@/lib/book-api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bee } from './garden-icons';

export interface BookCardProps {
  book: BookWithDetails | BookSearchResult;
  view: 'library' | 'wishlist' | 'recommendation';
  onRate?: (rating: string | null) => void;
  onAddToLibrary?: () => void;
  onAddToWishlist?: () => void;
  onRemoveFromLibrary?: () => void;
  onRemoveFromWishlist?: () => void;
  onClick?: () => void;
  actionLabel?: string;
}

export function BookCard({
  book,
  view,
  onRate,
  onAddToLibrary,
  onAddToWishlist,
  onRemoveFromLibrary,
  onRemoveFromWishlist,
  onClick,
  actionLabel = 'Add to Library'
}: BookCardProps) {
  // Type guard to check if the book has the inLibrary property (i.e., it's a BookWithDetails)
  const isBookWithDetails = (book: any): book is BookWithDetails => {
    return 'inLibrary' in book;
  };

  const rating = isBookWithDetails(book) ? book.rating : null;
  const inLibrary = isBookWithDetails(book) ? book.inLibrary : false;
  const inWishlist = isBookWithDetails(book) ? book.inWishlist : false;

  const gradientPalette = useMemo(
    () => [
      'from-emerald-400 via-emerald-500 to-sky-400',
      'from-amber-400 via-orange-400 to-pink-500',
      'from-sky-400 via-purple-400 to-indigo-500',
      'from-rose-400 via-pink-500 to-orange-400',
      'from-teal-400 via-cyan-400 to-blue-500',
      'from-lime-400 via-emerald-400 to-green-500',
    ],
    []
  );

  const gradientIndex = useMemo(() => {
    const source = `${book.title}-${book.author}`;
    const total = source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return total % gradientPalette.length;
  }, [book.author, book.title, gradientPalette]);

  const gradient = gradientPalette[gradientIndex];

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl p-4 text-white shadow-lg transition-all book-card',
        `bg-gradient-to-br ${gradient}`,
        onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
            <Sparkles className="h-3 w-3" />
            {book.ageRange || 'All Ages'}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30',
                    inWishlist && view !== 'wishlist' ? 'bg-white text-amber-500 hover:bg-white/80 hover:text-amber-500' : ''
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    inWishlist ? onRemoveFromWishlist?.() : onAddToWishlist?.();
                  }}
                >
                  <Heart className={cn('h-4 w-4', inWishlist ? 'fill-current text-amber-500' : '')} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-4 flex flex-1 flex-col items-center justify-center">
          <div className="relative flex h-32 w-24 items-center justify-center rounded-2xl bg-white/15 p-1.5 shadow-inner backdrop-blur-sm">
            <img
              src={book.coverUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}
              alt={book.title}
              className="h-full w-full rounded-xl object-cover shadow-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/200x300?text=No+Cover';
              }}
            />
            <div className="pointer-events-none absolute -right-5 -top-3 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
              <Bee />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-heading text-base font-semibold leading-tight line-clamp-2" title={book.title}>
            {book.title}
          </h3>
          <p className="mt-1 text-sm text-white/80 line-clamp-1" title={book.author}>
            {book.author}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        {view === 'library' && onRate ? (
          <div className="flex gap-2">
            <button
              className={cn(
                'rounded-full bg-white/20 p-2 text-xs transition hover:bg-white/30',
                rating === 'up' ? 'bg-white text-emerald-500 hover:bg-white' : ''
              )}
              onClick={(e) => {
                e.stopPropagation();
                onRate(rating === 'up' ? null : 'up');
              }}
            >
              <ThumbsUp className={cn('h-4 w-4', rating === 'up' ? 'text-emerald-500' : 'text-white')} />
            </button>
            <button
              className={cn(
                'rounded-full bg-white/20 p-2 text-xs transition hover:bg-white/30',
                rating === 'down' ? 'bg-white text-rose-500 hover:bg-white' : ''
              )}
              onClick={(e) => {
                e.stopPropagation();
                onRate(rating === 'down' ? null : 'down');
              }}
            >
              <ThumbsDown className={cn('h-4 w-4', rating === 'down' ? 'text-rose-500' : 'text-white')} />
            </button>
          </div>
        ) : view === 'recommendation' ? (
          <button
            className="flex-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-600 shadow-sm transition hover:shadow"
            onClick={(e) => {
              e.stopPropagation();
              onAddToLibrary?.();
            }}
          >
            <Plus className="mr-1 inline-block h-4 w-4" /> Plant It!
          </button>
        ) : (
          <div />
        )}

        {view !== 'recommendation' && (
          <div className="flex items-center gap-2">
            {inLibrary && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                Planted
              </span>
            )}
            {view === 'wishlist' && onAddToLibrary && (
              <button
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm transition hover:bg-white/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToLibrary();
                }}
              >
                Add
              </button>
            )}
            {view === 'library' && onRemoveFromLibrary && (
              <button
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromLibrary();
                }}
              >
                Remove
              </button>
            )}
            {view === 'wishlist' && onRemoveFromWishlist && (
              <button
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromWishlist();
                }}
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
