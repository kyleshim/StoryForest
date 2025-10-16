import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { MainLayout } from '@/components/main-layout';
import { BookCard } from '@/components/book-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, Filter, SortDesc, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recommendations } from '@/components/recommendations';
import { ReadingStats } from '@/components/reading-stats';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getBookById, BookDetailResult } from '@/lib/book-api';
import React, { ReactNode } from 'react';

export default function LibraryPage() {
  const { childId } = useParams();
  const parsedChildId = parseInt(childId || '');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [bookDetail, setBookDetail] = useState<BookDetailResult | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  type Book = {
    id: number;
    googleId?: string;
    olid?: string;
    title: string;
    author: string;
    coverUrl?: string;
    isbn?: string;
    ageRange?: string;
    inLibrary?: boolean;
    inWishlist?: boolean;
    rating?: string | null;
  };

  const { data: child, isLoading: isChildLoading } = useQuery({
    queryKey: [`/api/children/${parsedChildId}`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/children/${parsedChildId}`);
        if (!res.ok) throw new Error("Failed to fetch child data");
        return await res.json();
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Could not load child profile",
          variant: "destructive",
        });
        navigate('/');
        throw error;
      }
    },
  });

  const { data: libraryBooks, isLoading: isLibraryLoading } = useQuery({
    queryKey: [`/api/children/${parsedChildId}/library`],
    queryFn: async () => {
      const res = await fetch(`/api/children/${parsedChildId}/library`);
      if (!res.ok) throw new Error("Failed to fetch library books");
      return await res.json();
    },
    enabled: !!parsedChildId,
  });

  // Rate a book mutation
  const rateMutation = useMutation({
    mutationFn: async ({ bookId, rating }: { bookId: number, rating: string | null }) => {
      await apiRequest('POST', `/api/children/${parsedChildId}/library/${bookId}/rate`, { rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${parsedChildId}/library`] });
      toast({
        title: "Rating updated",
        description: "Your rating has been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rating failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (bookId: number) => {
      const book = libraryBooks.find((b: Book) => b.id === bookId);
      if (!book) throw new Error("Book not found");
      
      await apiRequest('POST', `/api/children/${parsedChildId}/wishlist`, {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        isbn: book.isbn,
        olid: book.olid,
        ageRange: book.ageRange,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${parsedChildId}/wishlist`] });
      queryClient.invalidateQueries({ queryKey: [`/api/children/${parsedChildId}`] });
      toast({
        title: "Added to wishlist",
        description: "The book has been added to your wishlist.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add to wishlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove from library mutation
  const removeFromLibraryMutation = useMutation({
    mutationFn: async (bookId: number) => {
      await apiRequest('DELETE', `/api/children/${parsedChildId}/library/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${parsedChildId}/library`] });
      queryClient.invalidateQueries({ queryKey: [`/api/children/${parsedChildId}`] });
      toast({
        title: "Book removed",
        description: "The book has been removed from your library.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove book",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter and sort books
  const filterAndSortBooks = () => {
    if (!libraryBooks) return [];
    
    let filtered = libraryBooks as Book[];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book: Book) => 
          book.title.toLowerCase().includes(query) || 
          book.author.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'title':
        filtered = [...filtered].sort((a: Book, b: Book) => a.title.localeCompare(b.title));
        break;
      case 'author':
        filtered = [...filtered].sort((a: Book, b: Book) => a.author.localeCompare(b.author));
        break;
      case 'recent':
      default:
        // No sorting needed as we assume the API returns items in recency order
        break;
    }
    
    return filtered;
  };

  const filteredBooks = libraryBooks ? filterAndSortBooks() : [];

  const handleBookClick = async (book: Book) => {
    setSelectedBookId(book.googleId || book.olid || book.id.toString());
    setLoadingDetail(true);
    setDetailOpen(true);
    const id = book.googleId || book.olid || book.id.toString();
    const detail = await getBookById(id);
    setBookDetail(detail);
    setLoadingDetail(false);
  };

  if (isChildLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!child) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <h2 className="text-2xl font-heading font-bold mb-2">Child Not Found</h2>
          <p className="mb-4">The child profile you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout childId={parsedChildId}>
      <div>
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-700 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for books, authors..."
                className="w-full rounded-full border-none bg-white/90 pl-10 pr-4 py-3 shadow-sm focus-visible:ring-emerald-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="min-w-[160px] rounded-full border-none bg-white/90 px-4 py-3 text-sm shadow-sm">
                  <div className="flex items-center gap-2">
                    <SortDesc className="h-4 w-4 text-neutral-700" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLibraryLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid auto-rows-[1fr] grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-10">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  view="library"
                  onRate={(rating) => rateMutation.mutate({ bookId: book.id, rating })}
                  onAddToWishlist={() => addToWishlistMutation.mutate(book.id)}
                  onRemoveFromLibrary={() => removeFromLibraryMutation.mutate(book.id)}
                  onClick={() => handleBookClick(book)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-heading font-semibold mb-2">Your library is empty</h3>
              <p className="text-neutral-600 mb-4">
                Start adding books to build your child's personal library.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1974"
                alt="Empty bookshelf"
                className="max-w-xs mx-auto rounded-lg mb-4"
              />
            </div>
          )}
          
          {child && (
            <>
              <Recommendations childId={parsedChildId} childAge={child.age} />
              <ReadingStats child={child} />
            </>
          )}
          {/* Book Detail Dialog */}
          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{bookDetail?.title || 'Book Details'}</DialogTitle>
                <DialogDescription>{bookDetail?.author}</DialogDescription>
              </DialogHeader>
              {loadingDetail ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : bookDetail ? (
                <div className="space-y-2">
                  <img src={bookDetail.coverUrl} alt={bookDetail.title} className="w-32 h-48 object-cover mx-auto rounded" />
                  <p className="text-sm text-neutral-700">{bookDetail.description}</p>
                  <div className="text-xs text-neutral-500 mt-2">
                    <div>Published: {bookDetail.publishedDate}</div>
                    <div>Pages: {bookDetail.pageCount}</div>
                    <div>Categories: {bookDetail.categories?.join(', ')}</div>
                    <div>ISBN: {bookDetail.isbn}</div>
                    <div>Average Rating: {bookDetail.averageRating} ({bookDetail.ratingsCount} ratings)</div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        const currentBook = filteredBooks.find((b: Book) => 
                          (b.googleId && b.googleId === bookDetail.googleId) || 
                          (b.olid && b.olid === bookDetail.olid)
                        );
                        if (currentBook) {
                          await removeFromLibraryMutation.mutateAsync(currentBook.id);
                          setDetailOpen(false);
                        }
                      }}
                      data-testid="button-remove-library-detail"
                    >
                      Remove from Library
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-neutral-500">No details found.</div>
              )}
            </DialogContent>
          </Dialog>
      </div>
    </MainLayout>
  );
}
