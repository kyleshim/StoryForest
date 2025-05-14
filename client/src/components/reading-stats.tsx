import { ChildWithStats } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReadingStatsProps {
  child: ChildWithStats;
}

export function ReadingStats({ child }: ReadingStatsProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading font-bold text-xl text-neutral-800">Reading Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-primary/10 rounded-lg p-4 flex flex-col items-center justify-center">
            <span className="text-primary text-3xl font-heading font-bold">{child.libraryCount}</span>
            <span className="text-neutral-700 text-sm">Books in Library</span>
          </div>
          <div className="bg-secondary/10 rounded-lg p-4 flex flex-col items-center justify-center">
            <span className="text-secondary text-3xl font-heading font-bold">{child.wishlistCount}</span>
            <span className="text-neutral-700 text-sm">Wishlist Items</span>
          </div>
        </div>
        <div className="flex justify-center">
          <img 
            src="https://images.unsplash.com/photo-1572297373790-8043cb8ed5a6?q=80&w=3537&auto=format&fit=crop&ixlib=rb-4.0.3" 
            alt="Child reading" 
            className="rounded-lg w-full max-w-lg h-48 object-cover" 
          />
        </div>
      </CardContent>
    </Card>
  );
}
