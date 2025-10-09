import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { BookOpen, Library, Heart, Star, Search, Camera } from "lucide-react";
import { BookSearchResult } from "@/lib/book-api";
import { PublicBookSearch } from "@/components/public-book-search";
import { PublicIsbnScanner } from "@/components/public-isbn-scanner";

export default function LandingPage() {
  const [searchTab, setSearchTab] = useState("search");

  const { data: featuredBooks, isLoading } = useQuery<BookSearchResult[]>({
    queryKey: ["/api/books/featured"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-16">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 px-4 py-1 text-sm font-medium mb-3">
              Welcome to Story Forest
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              A playful library for little readers
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
              Discover, organize, and share the stories your family loves with a cozy garden-inspired experience.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <SignInButton mode="modal">
              <Button size="lg" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" data-testid="button-login-header">
                Log In
              </Button>
            </SignInButton>
          </div>
        </header>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <Library className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                Organize Your Library
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Keep track of all your children's books in one beautiful, organized place
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <Heart className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                Create Wishlists
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Save books you want to read and share wishlists with family and friends
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <Star className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                Get Recommendations
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Discover age-appropriate books tailored to your child's interests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Try It Out
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Search for books or scan an ISBN to see what you can do
          </p>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <Tabs value={searchTab} onValueChange={setSearchTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="search" className="gap-2" data-testid="tab-search">
                    <Search className="h-4 w-4" />
                    Search Books
                  </TabsTrigger>
                  <TabsTrigger value="scanner" className="gap-2" data-testid="tab-scanner">
                    <Camera className="h-4 w-4" />
                    Scan ISBN
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="search">
                  <PublicBookSearch />
                </TabsContent>
                
                <TabsContent value="scanner">
                  <PublicIsbnScanner />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Featured Books Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Featured Children's Books
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 aspect-[2/3] rounded-lg mb-2" />
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-1" />
                  <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featuredBooks?.map((book) => (
                <div
                  key={book.googleId}
                  className="group cursor-pointer"
                  data-testid={`book-${book.googleId}`}
                >
                  <div className="relative overflow-hidden rounded-lg mb-2 bg-gray-100 dark:bg-gray-800 aspect-[2/3] flex items-center justify-center">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {book.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                    {book.author}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 dark:bg-blue-800 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of parents creating magical reading experiences for their children
          </p>
          <SignUpButton mode="modal">
            <Button size="lg" variant="secondary" className="gap-2" data-testid="button-signup-bottom">
              <Star className="h-5 w-5" />
              Create Free Account
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
