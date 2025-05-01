import { useQuery } from '@tanstack/react-query';
import { getRecommendedBooks, BookSearchResult } from '@/lib/book-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface RecommendationsProps {
  childId: number;
  childAge: number;
}

export function Recommendations({ childId, childAge }: RecommendationsProps) {
  const { toast } = useToast();
  const [inWishlist, setInWishlist] = useState<Record<string, boolean>>({});

  const { data: recommendations, isLoading } = useQuery({
    queryKey: [`recommendations-${childId}`],
    queryFn: () => getRecommendedBooks(childAge),
  });

  const addToLibraryMutation = useMutation({
    mutationFn: async (book: BookSearchResult) => {
      await apiRequest('POST', `/api/children/${childId}/library`, {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        isbn: book.isbn,
        olid: book.olid,
        ageRange: book.ageRange,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/library`] });
      queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}`] });
      
      toast({
        title: 'Book added',
        description: 'The book has been added to the library.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add book',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (book: BookSearchResult) => {
      await apiRequest('POST', `/api/children/${childId}/wishlist`, {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        isbn: book.isbn,
        olid: book.olid,
        ageRange: book.ageRange,
      });
      return book.olid;
    },
    onSuccess: (olid) => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/wishlist`] });
      queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}`] });
      
      setInWishlist(prev => ({ ...prev, [olid]: true }));
      
      toast({
        title: 'Book added to wishlist',
        description: 'The book has been added to your wishlist.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add to wishlist',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAddToLibrary = (book: BookSearchResult) => {
    addToLibraryMutation.mutate(book);
  };

  const handleAddToWishlist = (book: BookSearchResult) => {
    addToWishlistMutation.mutate(book);
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="font-heading font-bold text-xl text-neutral-800 mb-4">Recommended Books</h2>
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="font-heading font-bold text-xl text-neutral-800 mb-4">Recommended for {childAge <= 1 ? 'Baby' : 'Toddler'} Books</h2>
      <div className="flex overflow-x-auto pb-4 space-x-4 -mx-4 px-4">
        {recommendations.map((book) => (
          <Card key={book.olid} className="book-card flex-shrink-0 w-36 overflow-hidden shadow-sm">
            <div className="relative pt-[140%]">
              <img 
                src={book.coverUrl || 'https://via.placeholder.com/200x300?text=No+Cover'} 
                className="absolute top-0 left-0 w-full h-full object-cover" 
                alt={book.title}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/200x300?text=No+Cover';
                }}
              />
              <button 
                className={cn(
                  "absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-2",
                  inWishlist[book.olid] ? "text-accent hover:text-accent/80" : "text-neutral-700 hover:text-accent"
                )}
                onClick={() => handleAddToWishlist(book)}
              >
                <Heart className={cn("h-3 w-3", inWishlist[book.olid] ? "fill-current" : "")} />
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-heading font-semibold text-neutral-800 text-sm line-clamp-1">{book.title}</h3>
              <p className="text-neutral-700 text-xs mb-2">{book.author}</p>
              <Button 
                variant="secondary" 
                size="sm"
                className="w-full text-xs justify-center py-1.5"
                onClick={() => handleAddToLibrary(book)}
                disabled={addToLibraryMutation.isPending}
              >
                {addToLibraryMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    <span>Add to Library</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
