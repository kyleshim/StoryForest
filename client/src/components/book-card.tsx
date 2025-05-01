import React from 'react';
import { Card } from "@/components/ui/card";
import { BookWithDetails } from '@shared/schema';
import { Heart, ThumbsUp, ThumbsDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookSearchResult } from '@/lib/book-api';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    <Card 
      className={cn(
        "book-card overflow-hidden shadow-sm transition-all hover:shadow-md",
        onClick ? "cursor-pointer hover:-translate-y-1" : ""
      )}
      onClick={onClick}
    >
      <div className="relative pt-[140%]">
        <img 
          src={book.coverUrl || 'https://via.placeholder.com/200x300?text=No+Cover'} 
          className="absolute top-0 left-0 w-full h-full object-cover" 
          alt={book.title}
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/200x300?text=No+Cover';
          }}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className={cn(
                  "absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-2",
                  inWishlist ? "text-accent hover:text-accent/80" : "text-neutral-700 hover:text-accent"
                )}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  inWishlist ? onRemoveFromWishlist?.() : onAddToWishlist?.();
                }}
              >
                <Heart className={cn("h-4 w-4", inWishlist ? "fill-current" : "")} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-neutral-800 line-clamp-1">{book.title}</h3>
        <p className="text-neutral-700 text-sm mb-3">{book.author}</p>
        
        {view === 'recommendation' ? (
          <Button 
            variant="secondary" 
            className="w-full text-xs flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onAddToLibrary?.();
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> {actionLabel}
          </Button>
        ) : (
          <div className="flex justify-between items-center">
            {view === 'library' && onRate && (
              <div className="flex space-x-2">
                <button 
                  className={cn(
                    "rounded-full p-1.5",
                    rating === 'up' ? "bg-success/10 text-success" : "bg-neutral-100 text-neutral-700"
                  )}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    onRate(rating === 'up' ? null : 'up');
                  }}
                >
                  <ThumbsUp className="h-4 w-4" />
                </button>
                <button 
                  className={cn(
                    "rounded-full p-1.5",
                    rating === 'down' ? "bg-error/10 text-error" : "bg-neutral-100 text-neutral-700"
                  )}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    onRate(rating === 'down' ? null : 'down');
                  }}
                >
                  <ThumbsDown className="h-4 w-4" />
                </button>
              </div>
            )}
            {book.ageRange && (
              <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-full">
                {book.ageRange}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
