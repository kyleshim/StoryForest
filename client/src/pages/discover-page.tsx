import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { MainLayout } from "@/components/main-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Camera, Sparkles } from "lucide-react";
import { searchBooks, searchBookByIsbn, BookSearchResult } from "@/lib/book-api";
import { BookCard } from "@/components/book-card";
import { IsbnScanner } from "@/components/isbn-scanner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Child = {
  id: number;
  name: string;
  age: number;
  avatarUrl?: string;
};

export default function DiscoverPage() {
  const { childId } = useParams<{ childId: string }>();
  const parsedChildId = parseInt(childId || "0", 10);
  const { toast } = useToast();
  
  const [searchTab, setSearchTab] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch child data
  const { data: child, isLoading: isChildLoading } = useQuery<Child>({
    queryKey: [`/api/children/${parsedChildId}`],
    enabled: !!parsedChildId,
  });

  // Search books query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/books/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      return searchBooks(searchQuery);
    },
    enabled: !!searchQuery,
  });

  // Add to library mutation
  const addToLibraryMutation = useMutation({
    mutationFn: async (book: BookSearchResult) => {
      await apiRequest("POST", `/api/children/${parsedChildId}/library`, {
        googleId: book.googleId,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        isbn: book.isbn,
        ageRange: book.ageRange || "",
        description: book.description || "",
        publishedDate: book.publishedDate || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${parsedChildId}/library`] });
      toast({
        title: "Book added",
        description: "The book has been added to your library.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add book",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (book: BookSearchResult) => {
      await apiRequest("POST", `/api/children/${parsedChildId}/wishlist`, {
        googleId: book.googleId,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        isbn: book.isbn,
        ageRange: book.ageRange || "",
        description: book.description || "",
        publishedDate: book.publishedDate || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${parsedChildId}/wishlist`] });
      toast({
        title: "Book added",
        description: "The book has been added to your wishlist.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add book",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };

  const handleAddToLibrary = (book: BookSearchResult) => {
    addToLibraryMutation.mutate(book);
  };

  const handleAddToWishlist = (book: BookSearchResult) => {
    addToWishlistMutation.mutate(book);
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

  return (
    <MainLayout childId={parsedChildId}>
      <div>
        <h1 className="text-3xl font-heading font-bold text-neutral-800 mb-6">
          Discover Books
        </h1>

        {/* Search Interface */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <Tabs value={searchTab} onValueChange={setSearchTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="search" className="gap-2" data-testid="tab-search">
                  <Search className="h-4 w-4" />
                  Search Books
                </TabsTrigger>
                <TabsTrigger value="scanner" className="gap-2" data-testid="tab-scanner">
                  <Camera className="h-4 w-4" />
                  Scan ISBN
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search for books by title, author, or ISBN..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-search"
                    />
                  </div>

                  <Button type="submit" disabled={!searchTerm.trim() || isSearching} data-testid="button-search">
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Search'
                    )}
                  </Button>
                </form>

                {/* Search Results */}
                {isSearching ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {searchResults.map((book) => (
                      <BookCard
                        key={book.googleId || book.olid}
                        book={book}
                        view="recommendation"
                        onAddToLibrary={() => handleAddToLibrary(book)}
                        onAddToWishlist={() => handleAddToWishlist(book)}
                      />
                    ))}
                  </div>
                ) : searchQuery ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-heading font-semibold mb-2">No books found</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Try adjusting your search term or try a different query.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <h3 className="text-lg font-heading font-semibold mb-2">Search for Books</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Enter a book title, author name, or ISBN to get started
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="scanner">
                <IsbnScanner
                  onAddToLibrary={handleAddToLibrary}
                  onAddToWishlist={handleAddToWishlist}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recommendations Section - Placeholder for Future */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold mb-2">Personalized Recommendations</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Coming soon! We'll suggest books based on {child?.name}'s age and interests.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
