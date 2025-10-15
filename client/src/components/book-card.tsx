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
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl p-4 text-white transition-shadow book-card',
        `bg-gradient-to-br ${gradient}`,
        onClick ? 'cursor-pointer hover:shadow-xl' : 'hover:shadow-md'
      )}
      onClick={onClick}
      data-testid={`book-card-${book.title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Cover Image with 3:4 aspect ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-white/10">
        <img
          src={book.coverUrl || 'https://via.placeholder.com/300x400?text=No+Cover'}
          alt={book.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Cover';
          }}
        />
        {/* Wishlist heart icon - positioned absolutely on cover */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  'absolute right-2 top-2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50',
                  inWishlist && view !== 'wishlist' ? 'bg-white/90 text-amber-500 hover:bg-white' : ''
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  inWishlist ? onRemoveFromWishlist?.() : onAddToWishlist?.();
                }}
                data-testid={`button-wishlist-${book.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Heart className={cn('h-4 w-4', inWishlist ? 'fill-current text-amber-500' : '')} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* Bee animation on hover */}
        <div className="pointer-events-none absolute -right-4 -top-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
          <Bee />
        </div>
      </div>

      {/* Book Information */}
      <div className="mt-3 flex-1">
        <h3 className="font-heading text-base font-semibold leading-tight line-clamp-2" title={book.title}>
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-white/80 line-clamp-1" title={book.author}>
          {book.author}
        </p>
        {book.ageRange && (
          <p className="mt-0.5 text-xs text-white/60">{book.ageRange}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 space-y-2">
        {view === 'library' && onRate ? (
          <>
            <button
              className="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              data-testid={`button-view-details-${book.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              View details
            </button>
            <div className="flex gap-2">
              <button
                className={cn(
                  'flex-1 rounded-xl border border-white/30 bg-white/10 p-2 text-xs transition hover:bg-white/20',
                  rating === 'up' ? 'border-emerald-400 bg-white/90 text-emerald-600' : 'text-white'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onRate(rating === 'up' ? null : 'up');
                }}
                data-testid={`button-rate-up-${book.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <ThumbsUp className={cn('mx-auto h-4 w-4', rating === 'up' ? 'text-emerald-600' : 'text-white')} />
              </button>
              <button
                className={cn(
                  'flex-1 rounded-xl border border-white/30 bg-white/10 p-2 text-xs transition hover:bg-white/20',
                  rating === 'down' ? 'border-rose-400 bg-white/90 text-rose-600' : 'text-white'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onRate(rating === 'down' ? null : 'down');
                }}
                data-testid={`button-rate-down-${book.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <ThumbsDown className={cn('mx-auto h-4 w-4', rating === 'down' ? 'text-rose-600' : 'text-white')} />
              </button>
            </div>
          </>
        ) : view === 'recommendation' ? (
          <button
            className="w-full rounded-xl border border-white/30 bg-white px-3 py-2 text-sm font-semibold text-emerald-600 shadow-sm transition hover:shadow"
            onClick={(e) => {
              e.stopPropagation();
              onAddToLibrary?.();
            }}
            data-testid={`button-add-${book.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Plus className="mr-1 inline-block h-4 w-4" /> Plant It!
          </button>
        ) : view === 'wishlist' ? (
          <div className="space-y-2">
            {onAddToLibrary && (
              <button
                className="w-full rounded-xl border border-white/30 bg-white px-3 py-2 text-sm font-semibold text-emerald-600 shadow-sm transition hover:bg-white/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToLibrary();
                }}
                data-testid={`button-add-library-${book.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                Add to Library
              </button>
            )}
            {onRemoveFromWishlist && (
              <button
                className="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromWishlist();
                }}
                data-testid={`button-remove-wishlist-${book.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                Remove from Wishlist
              </button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
