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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-heading font-bold">Welcome, {user?.name}</h1>
        <Button onClick={() => setAddChildOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Child
        </Button>
      </div>

      {children?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <ChildCard 
              key={child.id} 
              child={child} 
              onClick={() => navigate(`/library/${child.id}`)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-xl shadow-sm">
          <h3 className="text-xl font-heading font-semibold mb-2">No children profiles yet</h3>
          <p className="text-neutral-600 mb-4">
            Start by adding a child profile to begin building their reading journey.
          </p>
          <img 
            src="https://images.unsplash.com/photo-1572297373790-8043cb8ed5a6?q=80&w=1500&auto=format&fit=crop"
            alt="Child reading"
            className="max-w-xs mx-auto rounded-lg mb-4"
          />
          <Button onClick={() => setAddChildOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Child Profile
          </Button>
        </div>
      )}

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
    </MainLayout>
  );
}
