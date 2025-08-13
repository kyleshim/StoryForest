import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
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
import { GardenHeader } from '@/components/garden-header';
import { StatPill, GardenButton } from '@/components/garden-components';
import { Sprout, Bee } from '@/components/garden-icons';
import type { ChildWithStats } from '@shared/schema';

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [addChildOpen, setAddChildOpen] = useState(false);

  const { data: children, isLoading } = useQuery({
    queryKey: ['/api/children'],
    queryFn: async () => {
      const res = await fetch('/api/children');
      if (!res.ok) throw new Error('Failed to fetch children');
      return await res.json();
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <GardenHeader />
        
        {/* Welcome section */}
        <div className="rounded-2xl border border-green-200 bg-white/70 backdrop-blur p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-heading font-bold text-green-900">
                Welcome, {user?.firstName || user?.username || 'Friend'}!
              </h2>
              <p className="text-green-700 mt-1">Let's tend to your little readers' garden</p>
            </div>
            <div className="flex items-center gap-3">
              <StatPill 
                label="Children" 
                value={children?.length || 0} 
                icon={<span>👶</span>} 
              />
              <GardenButton onClick={() => setAddChildOpen(true)}>
                <Plus className="w-4 h-4" /> Add Child
              </GardenButton>
            </div>
          </div>
        </div>

        {children?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child: ChildWithStats) => (
              <ChildCard 
                key={child.id} 
                child={child} 
                onClick={() => navigate(`/library/${child.id}`)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center rounded-2xl border border-green-200 bg-white/70 backdrop-blur p-12 shadow">
            <div className="max-w-md mx-auto">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Sprout className="w-16 h-16 text-green-500" />
                  <div className="absolute -top-2 -right-2">
                    <Bee className="w-8 h-8 animate-bounce" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-heading font-semibold text-green-900 mb-2">
                No little gardeners yet!
              </h3>
              <p className="text-green-700 mb-6">
                Plant the first seed by adding a child profile to begin cultivating their reading garden.
              </p>
              <GardenButton onClick={() => setAddChildOpen(true)}>
                <Plus className="w-4 h-4" /> Plant Your First Seed
              </GardenButton>
            </div>
          </div>
        )}

        {/* Garden footer tip */}
        <div className="relative rounded-2xl border border-amber-200 bg-amber-50/80 backdrop-blur p-4 shadow">
          <div className="flex items-center gap-2 text-amber-900 text-sm">
            <span>🌾</span>
            <p>
              <span className="font-semibold">Garden Tip:</span> Each child's reading garden grows unique. 
              Watch their literary roots flourish with every book planted!
            </p>
          </div>
        </div>
      </div>

      <Dialog open={addChildOpen} onOpenChange={setAddChildOpen}>
        <DialogContent className="border-green-200">
          <DialogHeader>
            <DialogTitle className="font-heading text-green-900 flex items-center gap-2">
              <Sprout className="w-5 h-5" />
              Add Little Gardener
            </DialogTitle>
            <DialogDescription className="text-green-700">
              Create a profile for your child to start planting their reading garden.
            </DialogDescription>
          </DialogHeader>
          <ChildForm onSuccess={() => setAddChildOpen(false)} />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
