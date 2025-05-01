import { apiRequest } from "./queryClient";

/**
 * Interface for Google Books information
 */
export interface GoogleBookInfo {
  googleId: string;
  title: string;
  author: string;
  coverUrl: string;
  isbn: string;
  description?: string;
  publishedDate?: string;
  ageRange?: string;
  olid: string;
}

/**
 * Interface for book search results
 */
export interface BookSearchResult extends GoogleBookInfo {
  // Additional fields can be added here if needed
}

/**
 * Interface for detailed book information
 */
export interface BookDetailResult extends GoogleBookInfo {
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
}

/**
 * Search for books using Google Books API
 * @param query Search query
 * @param ageRange Optional age range filter
 */
export async function searchBooks(query: string, ageRange?: string): Promise<BookSearchResult[]> {
  if (!query) return [];
  
  try {
    const response = await apiRequest(
      "GET", 
      `/api/books/search?q=${encodeURIComponent(query)}${ageRange ? `&ageRange=${encodeURIComponent(ageRange)}` : ''}`,
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching books:", error);
    return [];
  }
}

/**
 * Get book details by ID
 * @param id Google Books ID
 */
export async function getBookById(id: string): Promise<BookDetailResult | null> {
  if (!id) return null;
  
  try {
    const response = await apiRequest("GET", `/api/books/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting book details:", error);
    return null;
  }
}

/**
 * Get recommended books for a child based on age
 * @param childAge Child's age
 */
export async function getRecommendedBooks(childAge: number): Promise<BookSearchResult[]> {
  if (childAge === undefined) return [];
  
  // Determine age range for recommendations
  let ageRange = '';
  if (childAge <= 2) {
    ageRange = '0-2';
  } else if (childAge <= 5) {
    ageRange = '3-5';
  } else {
    ageRange = '6-8';
  }
  
  // Prepare appropriate search terms based on age
  let searchTerm = '';
  if (ageRange === '0-2') {
    searchTerm = 'board books for babies toddlers';
  } else if (ageRange === '3-5') {
    searchTerm = 'picture books for preschoolers';
  } else {
    searchTerm = 'early reader books';
  }
  
  return searchBooks(searchTerm, ageRange);
}