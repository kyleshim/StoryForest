import axios from "axios";
import { apiRequest } from "./queryClient";

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

export interface BookSearchResult extends GoogleBookInfo {
  // Additional fields can be added here if needed
}

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
  if (!query.trim()) return [];

  try {
    const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}${ageRange ? `&ageRange=${ageRange}` : ''}`);
    
    if (!res.ok) {
      throw new Error(`Search request failed with status ${res.status}`);
    }
    
    const books = await res.json();
    return books;
  } catch (error) {
    console.error('Error searching books:', error);
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
    const res = await fetch(`/api/books/${encodeURIComponent(id)}`);
    
    if (!res.ok) {
      throw new Error(`Book request failed with status ${res.status}`);
    }
    
    const book = await res.json();
    return book;
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

/**
 * Get recommended books for a child based on age
 * @param childAge Child's age
 */
export async function getRecommendedBooks(childAge: number): Promise<BookSearchResult[]> {
  try {
    // Determine appropriate query based on child's age
    let query = 'children books';
    let ageRange = '';
    
    if (childAge <= 1) {
      query = 'baby books';
      ageRange = '0-2';
    } else if (childAge <= 3) {
      query = 'toddler books';
      ageRange = '0-2';
    } else if (childAge <= 5) {
      query = 'picture books';
      ageRange = '3-5';
    } else {
      query = 'early readers';
      ageRange = '6-8';
    }
    
    // Use our own API endpoint which proxies Google Books API
    const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}&ageRange=${ageRange}`);
    
    if (!res.ok) {
      throw new Error(`Recommendations request failed with status ${res.status}`);
    }
    
    const books = await res.json();
    return books;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}
