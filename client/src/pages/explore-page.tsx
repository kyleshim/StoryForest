import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { AvatarWithBadge } from '@/components/ui/avatar-with-badge';

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get public children profiles
  const { data: publicChildren, isLoading: isChildrenLoading } = useQuery({
    queryKey: ['/api/discover/children'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/discover/children');
        if (!res.ok) throw new Error("Failed to fetch public children");
        return await res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load public libraries",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  // Search users
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: [`/api/users/search`, userSearchQuery],
    queryFn: async () => {
      if (!userSearchQuery) return [];
      
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(userSearchQuery)}`);
      if (!res.ok) throw new Error("Failed to search users");
      return await res.json();
    },
    enabled: !!userSearchQuery,
  });

  // Get children for a specific user when clicked
  const handleUserClick = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  // Filter public children by search query
  const filteredChildren = publicChildren
    ? publicChildren.filter(
        child => searchQuery
          ? child.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
    : [];

  return (
    <MainLayout>
      <h1 className="text-2xl font-heading font-bold mb-6">Explore Reading Journeys</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="border-b border-neutral-200 mb-6">
          <TabsList className="flex space-x-8 bg-transparent border-0 p-0">
            <TabsTrigger 
              value="explore" 
              className={`py-3 px-1 ${activeTab === 'explore' ? 'tab-active' : 'text-neutral-700'}`}
            >
              Explore Libraries
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className={`py-3 px-1 ${activeTab === 'users' ? 'tab-active' : 'text-neutral-700'}`}
            >
              Find Users
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="explore" className="mt-0">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-700 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search public libraries..." 
                className="w-full pl-10 pr-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isChildrenLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredChildren && filteredChildren.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredChildren.map((child) => (
                <Card 
                  key={child.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/library/${child.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <AvatarWithBadge
                        variant="secondary"
                        size="lg"
                        initial={child.name.charAt(0).toUpperCase()}
                        badgeText={child.age.toString()}
                        badgeVariant="accent"
                        badgeSize="md"
                      />
                      <div>
                        <h3 className="font-heading font-semibold text-lg">{child.name}'s Library</h3>
                        <p className="text-sm text-neutral-600">Age: {child.age} {child.age <= 1 ? 'year' : 'years'}</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="bg-primary/10 rounded-lg px-3 py-2 text-center">
                        <span className="block text-primary text-xl font-heading font-bold">{child.libraryCount}</span>
                        <span className="text-xs text-neutral-700">Books</span>
                      </div>
                      <div className="bg-secondary/10 rounded-lg px-3 py-2 text-center">
                        <span className="block text-secondary text-xl font-heading font-bold">{child.wishlistCount}</span>
                        <span className="text-xs text-neutral-700">Wishlist</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-heading font-semibold mb-2">No public libraries found</h3>
              <p className="text-neutral-600 mb-4">
                There are no public libraries to explore at the moment.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&q=80&w=1974"
                alt="Empty shelves"
                className="max-w-xs mx-auto rounded-lg mb-4"
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="users" className="mt-0">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-700 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search for users..." 
                className="w-full pl-10 pr-4 py-2"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setUserSearchQuery(userSearchQuery)}
              disabled={!userSearchQuery.trim() || isSearchLoading}
            >
              {isSearchLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Search
            </Button>
          </div>
          
          {isSearchLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : userSearchQuery && searchResults && searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.map((user) => (
                <Card 
                  key={user.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleUserClick(user.id)}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">{user.name}</h3>
                      <p className="text-sm text-neutral-600">@{user.username}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userSearchQuery ? (
            <div className="text-center p-12 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-heading font-semibold mb-2">No users found</h3>
              <p className="text-neutral-600 mb-4">
                Try searching with a different name or username.
              </p>
              <User className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-heading font-semibold mb-2">Search for users</h3>
              <p className="text-neutral-600 mb-4">
                Enter a name or username to find other users to connect with.
              </p>
              <Search className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
