import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookSearchResult } from '@/lib/book-api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import { BookCard } from './book-card';
import { SignUpButton } from '@clerk/clerk-react';

export function PublicBookSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const signUpButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/public/books/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const response = await fetch(`/api/public/books/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json() as Promise<BookSearchResult[]>;
    },
    enabled: !!searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };

  const handleAddBook = (bookId: string) => {
    signUpButtonRefs.current[bookId]?.click();
  };

  return (
    <div className="w-full">
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
        
        <Button type="submit" disabled={!searchTerm.trim() || isLoading} data-testid="button-search">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </Button>
      </form>

      <div className="hidden">
        {searchResults?.map((book) => (
          <SignUpButton key={book.googleId} mode="modal">
            <button ref={(el) => signUpButtonRefs.current[book.googleId] = el} />
          </SignUpButton>
        ))}
      </div>

      {isLoading ? (
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
              onAddToLibrary={() => handleAddBook(book.googleId)}
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
    </div>
  );
}
