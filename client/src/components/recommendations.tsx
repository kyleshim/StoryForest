import { useQuery, useMutation } from '@tanstack/react-query';
import { getRecommendedBooks, BookSearchResult } from '@/lib/book-api';
import { BookCard } from './book-card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface RecommendationsProps {
  childId: number;
  childAge: number;
}

export function Recommendations({ childId, childAge }: RecommendationsProps) {
  const { toast } = useToast();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/books/recommendations', childAge],
    queryFn: async () => {
      return await getRecommendedBooks(childAge);
    },
  });

  const addToLibraryMutation = useMutation({
    mutationFn: async (book: BookSearchResult) => {
      const response = await apiRequest('POST', `/api/children/${childId}/library`, {
        googleId: book.googleId,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        isbn: book.isbn,
        ageRange: book.ageRange,
        description: book.description,
        publishedDate: book.publishedDate,
        olid: book.olid
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/library`] });
      toast({
        title: 'Success',
        description: 'Book added to library',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add book to library',
        variant: 'destructive',
      });
    }
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (book: BookSearchResult) => {
      const response = await apiRequest('POST', `/api/children/${childId}/wishlist`, {
        googleId: book.googleId,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        isbn: book.isbn,
        ageRange: book.ageRange,
        description: book.description,
        publishedDate: book.publishedDate,
        olid: book.olid
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/wishlist`] });
      toast({
        title: 'Success',
        description: 'Book added to wishlist',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add book to wishlist',
        variant: 'destructive',
      });
    }
  });

  const handleAddToLibrary = (book: BookSearchResult) => {
    addToLibraryMutation.mutate(book);
  };

  const handleAddToWishlist = (book: BookSearchResult) => {
    addToWishlistMutation.mutate(book);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-600">No recommendations available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {recommendations.map((book) => (
        <BookCard
          key={book.googleId}
          book={book}
          view="recommendation"
          onAddToLibrary={() => handleAddToLibrary(book)}
          onAddToWishlist={() => handleAddToWishlist(book)}
        />
      ))}
    </div>
  );
}