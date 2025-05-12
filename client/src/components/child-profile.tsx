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

  // Calculate join date string
  const joinDateString = "January 2023"; // In a real app, this would be calculated from child creation date
  
  // Get birth month name
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const birthMonthName = monthNames[child.birthMonth - 1];

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-4 mb-8 bg-white rounded-xl p-4 shadow-sm", className)}>
      <div className="relative">
        <AvatarWithBadge
          variant="secondary"
          size="xl"
          initial={child.name.charAt(0).toUpperCase()}
          badgeText={age.toString()}
          badgeVariant="accent"
          badgeSize="lg"
        />
      </div>
      
      <div className="text-center sm:text-left">
        <h2 className="font-heading font-bold text-2xl text-neutral-800">{child.name}'s Reading Journey</h2>
        <p className="text-neutral-700">Building a library of adventures since {joinDateString}</p>
        
        <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {child.libraryCount} Books
          </Badge>
          <Badge variant="outline" className="bg-secondary/10 text-secondary">
            {child.wishlistCount} Wishlist
          </Badge>
          <Badge variant="outline" className="bg-accent/10 text-accent">
            Age: {age} {age <= 1 ? 'year' : 'years'}
          </Badge>
          <Badge variant="outline" className="bg-gray-100 text-neutral-700">
            Born: {birthMonthName} {child.birthYear}
          </Badge>
        </div>
      </div>
      
      <div className="ml-auto mt-4 sm:mt-0">
        <AddBookDialog 
          childId={child.id}
          childAge={age}
          onAddBook={handleAddBook}
        />
      </div>
    </div>
  );
}
