import React from 'react';
import { BookWithDetails } from '@shared/schema';
import { Heart, ThumbsUp, ThumbsDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookSearchResult } from '@/lib/book-api';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sprout, Bee } from './garden-icons';

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

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-green-200 bg-white/80 backdrop-blur shadow hover:shadow-md transition book-card",
        onClick ? "cursor-pointer hover:-translate-y-1" : ""
      )}
      onClick={onClick}
      style={{
        backgroundImage:
          "radial-gradient(circle at 10% 10%, rgba(134,239,172,0.15) 0 20%, transparent 20%), radial-gradient(circle at 90% 30%, rgba(252,211,77,0.15) 0 20%, transparent 20%)",
      }}
    >
      {/* Seed packet header */}
      <div className="flex items-start gap-3 p-3">
        <div className="h-12 w-8 shrink-0 rounded-md border-2 border-green-400 bg-white flex items-center justify-center shadow-inner">
          <Sprout className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-green-900 text-sm" title={book.title}>
            {book.title}
          </h3>
          <p className="text-green-700 text-xs truncate" title={book.author}>{book.author}</p>
          {book.ageRange && (
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-800">
                <Sprout className="w-3 h-3" />
                {book.ageRange}
              </span>
            </div>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className={cn(
                  "rounded-full p-1.5 transition",
                  inWishlist ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "bg-green-100 text-green-600 hover:bg-green-200"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  inWishlist ? onRemoveFromWishlist?.() : onAddToWishlist?.();
                }}
              >
                <Heart className={cn("h-3 w-3", inWishlist ? "fill-current" : "")} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Book cover */}
      <div className="relative mx-3 mb-3">
        <div className="relative pt-[140%] rounded-lg overflow-hidden border border-green-200">
          <img 
            src={book.coverUrl || 'https://via.placeholder.com/200x300?text=No+Cover'} 
            className="absolute top-0 left-0 w-full h-full object-contain bg-white" 
            alt={book.title}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/200x300?text=No+Cover';
            }}
          />
        </div>
      </div>
      <div className="p-3 pt-0">
        
        {view === 'recommendation' ? (
          <div className="flex gap-2 items-center">
            <button
              className="flex-1 rounded-xl bg-emerald-500 text-white px-3 py-2 text-xs font-semibold shadow hover:bg-emerald-600 transition flex items-center justify-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onAddToLibrary?.();
              }}
            >
              <Plus className="h-3 w-3" /> Plant It!
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            {view === 'library' && onRate && (
              <div className="flex space-x-1">
                <button 
                  className={cn(
                    "rounded-full p-1.5 text-xs transition",
                    rating === 'up' ? "bg-emerald-100 text-emerald-700" : "bg-green-100 text-green-600 hover:bg-emerald-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRate(rating === 'up' ? null : 'up');
                  }}
                >
                  <ThumbsUp className="h-3 w-3" />
                </button>
                <button 
                  className={cn(
                    "rounded-full p-1.5 text-xs transition",
                    rating === 'down' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-600 hover:bg-red-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRate(rating === 'down' ? null : 'down');
                  }}
                >
                  <ThumbsDown className="h-3 w-3" />
                </button>
              </div>
            )}
            {inLibrary && (
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full border border-emerald-200 font-semibold">
                PLANTED
              </span>
            )}
          </div>
        )}
      </div>

      {/* Accent strip */}
      <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-green-400 to-emerald-500" />

      {/* Hover bee */}
      <div className="pointer-events-none absolute -right-4 -top-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Bee />
      </div>
    </div>
  );
}
