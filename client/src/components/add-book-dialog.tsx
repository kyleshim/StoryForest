import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookSearchResult, searchBooks } from '@/lib/book-api';
import { X, Plus, Book, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AddBookDialogProps {
  childId: number;
  onAddBook: (book: BookSearchResult) => Promise<void>;
  trigger?: React.ReactNode;
}

export function AddBookDialog({ childId, onAddBook, trigger }: AddBookDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchBooks(searchQuery);
      setSearchResults(results);
      setSelectedBook(null);
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not search for books. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addBookMutation = useMutation({
    mutationFn: async (book: BookSearchResult) => {
      await onAddBook(book);
    },
    onSuccess: () => {
      toast({
        title: "Book added",
        description: "The book has been added to the library.",
      });
      setOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedBook(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to add book",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddBook = () => {
    if (selectedBook) {
      addBookMutation.mutate(selectedBook);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Book
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Add Book to Library</DialogTitle>
          <DialogDescription>
            Search for a book by title, author, or ISBN to add to your library.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="search">Search Book</Label>
              <Input
                id="search"
                placeholder="Title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-8"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {isSearching ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((book) => (
                <div
                  key={book.olid}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                    selectedBook?.olid === book.olid ? 'border-primary bg-primary/5' : 'border-neutral-200'
                  }`}
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="flex-shrink-0 w-12 h-16 bg-neutral-100 rounded overflow-hidden">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/100x150?text=No+Cover';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Book className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{book.title}</h4>
                    <p className="text-xs text-neutral-600 truncate">{book.author}</p>
                    {book.ageRange && (
                      <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                        {book.ageRange}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="text-center p-4 text-neutral-600">
              No books found. Try a different search term.
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg">
              <div className="flex-shrink-0 w-12 h-16 bg-neutral-100 rounded overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <Book className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-400">Search for a book to see details</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAddBook}
            disabled={!selectedBook || addBookMutation.isPending}
          >
            {addBookMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add to Library
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
