import { ChildWithStats } from '@shared/schema';
import { AvatarWithBadge } from '@/components/ui/avatar-with-badge';
import { cn, calculateAge } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AddBookDialog } from './add-book-dialog';
import { BookSearchResult } from '@/lib/book-api';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ChildProfileProps {
  child: ChildWithStats;
  className?: string;
}

export function ChildProfile({ child, className }: ChildProfileProps) {
  const { toast } = useToast();
  
  // Calculate age from birth month and year
  const age = calculateAge(child.birthMonth, child.birthYear);
  
  const addToLibraryMutation = useMutation({
    mutationFn: async (book: BookSearchResult) => {
      await apiRequest('POST', `/api/children/${child.id}/library`, {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        isbn: book.isbn,
        olid: book.olid,
        ageRange: book.ageRange,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/children/${child.id}/library`] });
      queryClient.invalidateQueries({ queryKey: [`/api/children/${child.id}`] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add book',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAddBook = async (book: BookSearchResult) => {
    await addToLibraryMutation.mutateAsync(book);
  };

  // Get birth month name
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const birthMonthName = monthNames[child.birthMonth - 1];

  // Calculate birth date string
  const joinDateString = `${birthMonthName} ${child.birthYear}`;
  
  return (
    <div className={cn("relative mb-8 bg-white rounded-xl p-6 shadow-sm", className)}>
      <div className="text-center">
        <h2 className="font-heading font-bold text-3xl text-neutral-800 mb-2">{child.name}'s Reading Journey</h2>
        <p className="text-neutral-600 mb-4">Building a library of adventures since {joinDateString}</p>
        
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-1.5">
            {child.libraryCount} Books
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-4 py-1.5">
            {child.wishlistCount} Wishlist
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-1.5">
            Age: {age} {age <= 1 ? 'year' : 'years'}
          </Badge>
          <Badge variant="outline" className="bg-gray-100 text-neutral-700 border-gray-200 px-4 py-1.5">
            Born: {birthMonthName} {child.birthYear}
          </Badge>
        </div>
      </div>
      
      <div className="absolute right-6 bottom-6">
        <AddBookDialog 
          childId={child.id}
          childAge={age}
          onAddBook={handleAddBook}
        />
      </div>
    </div>
  );
}
