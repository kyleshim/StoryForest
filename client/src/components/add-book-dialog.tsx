import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { BookSearch } from './book-search';
import { BookSearchResult } from '@/lib/book-api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recommendations } from './recommendations';
import { IsbnScanner } from './isbn-scanner';

interface AddBookDialogProps {
  childId: number;
  childAge?: number;
  onAddBook: (book: BookSearchResult) => Promise<void>;
  trigger?: React.ReactNode;
}

export function AddBookDialog({ childId, childAge = 3, onAddBook, trigger }: AddBookDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('search');

  const addBookMutation = useMutation({
    mutationFn: async (book: BookSearchResult) => {
      await onAddBook(book);
    },
    onSuccess: () => {
      setOpen(false);
      toast({
        title: 'Success',
        description: 'Book added to collection',
        variant: 'default',
      });
      
      // Invalidate queries to refresh the book list
      queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/library`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add book',
        variant: 'destructive',
      });
    },
  });
  
  // Add to wishlist mutation
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
      toast({
        title: 'Success',
        description: 'Book added to wishlist',
        variant: 'default',
      });
      
      // Invalidate queries to refresh the wishlist
      queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/wishlist`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add book to wishlist',
        variant: 'destructive',
      });
    },
  });

  const handleAddBook = (book: BookSearchResult) => {
    addBookMutation.mutate(book);
  };
  
  const handleAddToWishlist = (book: BookSearchResult) => {
    addToWishlistMutation.mutate(book);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Add Book
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a Book</DialogTitle>
          <DialogDescription>
            Search for books to add to your child's collection.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search Books</TabsTrigger>
            <TabsTrigger value="scanner">Scan ISBN</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-4">
            <BookSearch 
              childAge={childAge}
              showAction={true}
              actionLabel="Add to Library"
              onBookAction={handleAddBook}
              onAddToWishlist={handleAddToWishlist}
            />
          </TabsContent>
          
          <TabsContent value="scanner" className="mt-4">
            {activeTab === 'scanner' && (
              <IsbnScanner 
                onAddToLibrary={handleAddBook}
                onAddToWishlist={handleAddToWishlist}
              />
            )}
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-4">
            <p className="mb-4 text-neutral-600">
              Age-appropriate book recommendations for your child.
            </p>
            <Recommendations childId={childId} childAge={childAge} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}