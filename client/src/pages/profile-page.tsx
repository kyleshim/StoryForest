import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { MainLayout } from '@/components/main-layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { ChildCard } from '@/components/child-card';
import { useLocation } from 'wouter';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ChildForm } from '@/components/child-form';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, updatePrivacyMutation } = useAuth();
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

  const handlePrivacyToggle = (isPublic: boolean) => {
    updatePrivacyMutation.mutate({ isPublic });
  };

  if (!user) {
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
      <h1 className="text-2xl font-heading font-bold mb-6">Profile Settings</h1>
      
      <Tabs defaultValue="profile" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="children">Children</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Account Information</CardTitle>
                <CardDescription>
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={user.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={user.username} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email} disabled />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can see your libraries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="public-profile">Public Libraries</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to discover and view your children's libraries
                    </p>
                  </div>
                  <Switch 
                    id="public-profile" 
                    checked={user.isPublic}
                    onCheckedChange={handlePrivacyToggle}
                    disabled={updatePrivacyMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="children">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-heading font-semibold">Child Profiles</h2>
            <Button onClick={() => setAddChildOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Child
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : children?.length > 0 ? (
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
                Add a child profile to begin building their reading journey.
              </p>
              <Button onClick={() => setAddChildOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Child Profile
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

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
