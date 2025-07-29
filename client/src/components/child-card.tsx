import { ChildWithStats } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { AvatarWithBadge } from '@/components/ui/avatar-with-badge';
import { Badge } from '@/components/ui/badge';
import { calculateAge } from '@/lib/utils';

interface ChildCardProps {
  child: ChildWithStats;
  onClick?: () => void;
}

export function ChildCard({ child, onClick }: ChildCardProps) {
  // Calculate age from birth month and year
  const age = calculateAge(child.birthMonth, child.birthYear);
  
  // Get birth month name
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const birthMonthName = monthNames[child.birthMonth - 1];
  
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <AvatarWithBadge
            variant="secondary"
            size="lg"
            initial={child.name.charAt(0).toUpperCase()}
            badgeText={age.toString()}
            badgeVariant="accent"
            badgeSize="md"
          />
          <div>
            <h3 className="font-heading font-semibold text-lg">{child.name}'s Reading Journey</h3>
            <p className="text-sm text-neutral-600">
              Age: {age} {age <= 1 ? 'year' : 'years'} • Born: {birthMonthName} {child.birthYear}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {child.libraryCount} Books
          </Badge>
          <Badge variant="outline" className="bg-secondary/10 text-secondary">
            {child.wishlistCount} Wishlist
          </Badge>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between">
          <div className="text-center">
            <span className="block text-primary font-heading font-bold text-xl">{child.libraryCount}</span>
            <span className="text-xs text-neutral-600">Books in Library</span>
          </div>
          <div className="text-center">
            <span className="block text-secondary font-heading font-bold text-xl">{child.wishlistCount}</span>
            <span className="text-xs text-neutral-600">Wishlist Items</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
