import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { MainLayout } from '@/components/main-layout';
import { ChildProfile } from '@/components/child-profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookCard } from '@/components/book-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recommendations } from '@/components/recommendations';
import { ReadingStats } from '@/components/reading-stats';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getBookById, BookDetailResult } from '@/lib/book-api';

export default function WishlistPage() {
  const { childId } = useParams();
  const parsedChildId = parseInt(childId);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('wishlist');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [bookDetail, setBookDetail] = useState<BookDetailResult | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const { data: child, isLoading: isChildLoading } = useQuery({
    queryKey: [`/api/children/${parsedChildId}`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/children/${parsedChildId}`);
        if (!res.ok) throw new Error("Failed to fetch child data");
        return await res.json();
      } catch (error) {
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

  const { data: wishlistBooks, isLoading: isWishlistLoading } = useQuery({
    queryKey: [`/api/children/${parsedChildId}/wishlist`],
    queryFn: async () => {
      const res = await fetch(`/api/children/${parsedChildId}/wishlist`);
      if (!res.ok) throw new Error("Failed to fetch wishlist books");
      return await res.json();
    },
    enabled: !!parsedChildId,
  });

  // Add to library mutation
  const addToLibraryMutation = useMutation({
    mutationFn: async (bookId: number) => {
      const book = wishlistBooks.find((b: Book) => b.id === bookId);
      if (!book) throw new Error("Book not found");
      
      await apiRequest('POST', `/api/children/${parsedChildId}/library`, {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        isbn: book.isbn,
        olid: book.olid,
        ageRange: book.ageRange,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${parsedChildId}/library`] });
      queryClient.invalidateQueries({ queryKey: [`/api/children/${parsedChildId}`] });
      toast({
        title: "Added to library",
        description: "The book has been added to your library.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add to library",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (bookId: number) => {
      await apiRequest('DELETE', `/api/children/${parsedChildId}/wishlist/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${parsedChildId}/wishlist`] });
      queryClient.invalidateQueries({ queryKey: [`/api/children/${parsedChildId}`] });
      toast({
        title: "Book removed",
        description: "The book has been removed from your wishlist.",
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

  // Filter books by search query
  const filteredBooks = wishlistBooks
    ? wishlistBooks.filter(
        book => searchQuery
          ? book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
    : [];

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
      <ChildProfile child={child} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="border-b border-neutral-200 mb-6">
          <TabsList className="flex space-x-8 bg-transparent border-0 p-0">
            <TabsTrigger 
              value="library" 
              className={`py-3 px-1 ${activeTab === 'library' ? 'tab-active' : 'text-neutral-700'}`}
              onClick={() => navigate(`/library/${parsedChildId}`)}
            >
              Library
            </TabsTrigger>
            <TabsTrigger 
              value="wishlist" 
              className={`py-3 px-1 ${activeTab === 'wishlist' ? 'tab-active' : 'text-neutral-700'}`}
            >
              Wishlist
            </TabsTrigger>
            <TabsTrigger 
              value="explore" 
              className={`py-3 px-1 ${activeTab === 'explore' ? 'tab-active' : 'text-neutral-700'}`}
              onClick={() => navigate('/explore')}
            >
              Explore
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="wishlist" className="mt-0">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-700 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search your wishlist..."
                className="w-full rounded-full border-none bg-white/90 pl-10 pr-4 py-3 shadow-sm focus-visible:ring-emerald-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isWishlistLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid auto-rows-[1fr] grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-10">
              {filteredBooks.map((book: Book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  view="wishlist"
                  onAddToLibrary={() => addToLibraryMutation.mutate(book.id)}
                  onRemoveFromWishlist={() => removeFromWishlistMutation.mutate(book.id)}
                  onClick={() => handleBookClick(book)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-heading font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-neutral-600 mb-4">
                Add books to your wishlist to save them for later.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&q=80&w=1974"
                alt="Empty wishlist"
                className="max-w-xs mx-auto rounded-lg mb-4"
              />
              <Button onClick={() => navigate(`/library/${parsedChildId}`)}>
                Go to Library
              </Button>
            </div>
          )}
          
          {child && (
            <ReadingStats child={child} />
          )}
        </TabsContent>
      </Tabs>
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
                  variant="secondary"
                  disabled={!!filteredBooks.find((b: Book) => b.id === bookDetail.id && b.inLibrary)}
                  onClick={async () => {
                    await addToLibraryMutation.mutateAsync(bookDetail.id);
                    setDetailOpen(false);
                  }}
                >
                  {filteredBooks.find((b: Book) => b.id === bookDetail.id && b.inLibrary) ? 'In Library' : 'Add to Library'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await removeFromWishlistMutation.mutateAsync(bookDetail.id);
                    setDetailOpen(false);
                  }}
                >
                  Remove from Wishlist
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-neutral-500">No details found.</div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
