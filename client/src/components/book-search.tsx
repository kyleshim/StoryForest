import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookSearchResult, searchBooks } from '@/lib/book-api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import { BookCard } from './book-card';

interface BookSearchProps {
  onSelectBook?: (book: BookSearchResult) => void;
  childAge?: number;
  view?: 'card' | 'list';
  showAction?: boolean;
  actionLabel?: string;
  onBookAction?: (book: BookSearchResult) => void;
}

export function BookSearch({
  onSelectBook,
  childAge,
  view = 'card',
  showAction = false,
  actionLabel = 'Add',
  onBookAction
}: BookSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ageRange, setAgeRange] = useState(
    childAge !== undefined 
      ? childAge <= 2 
        ? '0-2' 
        : childAge <= 5 
          ? '3-5' 
          : '6-8'
      : 'any'
  );

  // Query for book search
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['/api/books/search', searchQuery, ageRange],
    queryFn: async () => {
      if (!searchQuery) return [];
      console.log('Searching books with query:', searchQuery, 'and age range:', ageRange);
      const results = await searchBooks(searchQuery, ageRange);
      console.log('Search results:', results);
      return results;
    },
    enabled: !!searchQuery,
  });
  
  // Log any errors
  if (error) {
    console.error('Search error:', error);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search for books by title, author..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={ageRange} onValueChange={setAgeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Age Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Age</SelectItem>
            <SelectItem value="0-2">0-2 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="6-8">6-8 years</SelectItem>
          </SelectContent>
        </Select>
        
        <Button type="submit" disabled={!searchTerm.trim() || isLoading}>
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
              onClick={() => onSelectBook && onSelectBook(book)}
              onAddToLibrary={showAction ? () => onBookAction && onBookAction(book) : undefined}
              actionLabel={actionLabel}
            />
          ))}
        </div>
      ) : searchQuery ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-heading font-semibold mb-2">No books found</h3>
            <p className="text-neutral-600">
              Try adjusting your search or selecting a different age range.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}