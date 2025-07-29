import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { DemoMainLayout } from '@/components/demo-main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, BookOpen, Target, Clock, Trophy, Dice1 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ChildCard } from '@/components/child-card';
import { ChildForm } from '@/components/child-form';
import { StreakCard } from '@/components/streak-card';
import { StatsCard } from '@/components/stats-card';
import { CategoryCard } from '@/components/category-card';
import { FeaturedBookCard } from '@/components/featured-book-card';

export default function HomePage() {
  // Mock user for demo purposes
  const user = { firstName: 'Demo', username: 'demo' };
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [addChildOpen, setAddChildOpen] = useState(false);

  // Mock children data for demo
  const children: any[] = [];
  const isLoading = false;

  if (isLoading) {
    return (
      <DemoMainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DemoMainLayout>
    );
  }

  return (
    <DemoMainLayout>
      <div className="space-y-6">
        {/* Streak and Growth Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Streak Card */}
          <StreakCard days={1} />
          
          {/* Growth This Week Card */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Your growth this week</h3>
              <div className="grid grid-cols-3 gap-4">
                <StatsCard value="27" label="key points" color="blue" />
                <StatsCard value="44" label="minutes" color="green" />
                <StatsCard value="29" label="insights" color="orange" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Mission */}
        <Card className="bg-blue-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">YOUR DAILY MISSION</h3>
              </div>
              <div className="text-2xl">→</div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Categories you're interested in</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategoryCard 
              icon="⏳" 
              title="Age Appropriate" 
              onClick={() => navigate('/explore')}
            />
            <CategoryCard 
              icon="🏆" 
              title="Award Winners" 
              onClick={() => navigate('/explore')}
            />
          </div>
        </div>

        {/* Popular Content Section */}
        <div>
          <h2 className="text-xl font-bold mb-2">To get you started</h2>
          <p className="text-gray-600 mb-4">Popular books we picked just for you</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeaturedBookCard 
              title="THE MORNING CLUB"
              subtitle="Own your morning. Elevate your life"
              backgroundColor="bg-gradient-to-br from-yellow-400 to-orange-500"
            />
            <FeaturedBookCard 
              title="THINK AND GROW RICH"
              subtitle="The original version, restored and revised"
              backgroundColor="bg-gradient-to-br from-green-600 to-green-800"
            />
            <FeaturedBookCard 
              title="FOR KIDS"
              subtitle="The no-nonsense guide for optimal living"
              backgroundColor="bg-gradient-to-br from-teal-500 to-green-600"
            />
          </div>
        </div>

        {/* Random Book Suggestion */}
        <Card className="bg-white border-2 border-dashed border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Dice1 className="h-6 w-6 text-gray-400" />
              <div>
                <h3 className="font-semibold">Roll the dice</h3>
                <p className="text-sm text-gray-600">Get a random book recommendation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children Profiles Section */}
        {children && children.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Children</h2>
              <Button onClick={() => setAddChildOpen(true)} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Child
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child: any) => (
                <ChildCard 
                  key={child.id} 
                  child={child} 
                  onClick={() => navigate(`/library/${child.id}`)} 
                />
              ))}
            </div>
          </div>
        )}

        {/* No children state */}
        {(!children || children.length === 0) && (
          <Card className="bg-white">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to start your reading journey?</h3>
              <p className="text-gray-600 mb-4">
                Create a child profile to begin tracking books and building reading habits.
              </p>
              <Button onClick={() => setAddChildOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Child Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={addChildOpen} onOpenChange={setAddChildOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Add Child Profile</DialogTitle>
            <DialogDescription>
              Create a profile for your child to start tracking their reading journey.
            </DialogDescription>
          </DialogHeader>
          <ChildForm onSuccess={() => setAddChildOpen(false)} />
        </DialogContent>
      </Dialog>
    </DemoMainLayout>
  );
}
