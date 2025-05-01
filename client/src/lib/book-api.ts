import axios from "axios";

const OPEN_LIBRARY_API_URL = "https://openlibrary.org/api";
const OPEN_LIBRARY_COVERS_URL = "https://covers.openlibrary.org/b";

export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  isbn?: string[];
  first_publish_year?: number;
}

export interface BookSearchResult {
  olid: string;
  title: string;
  author: string;
  coverUrl: string;
  isbn: string;
  ageRange?: string;
}

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  if (!query.trim()) return [];

  try {
    const response = await axios.get(`https://openlibrary.org/search.json`, {
      params: {
        q: query,
        limit: 10,
        fields: 'key,title,author_name,cover_i,isbn,first_publish_year',
      }
    });

    if (!response.data.docs || !Array.isArray(response.data.docs)) {
      return [];
    }

    return response.data.docs.map((book: OpenLibraryBook) => {
      const olid = book.key.split('/').pop() || '';
      return {
        olid,
        title: book.title,
        author: book.author_name ? book.author_name[0] : 'Unknown Author',
        coverUrl: book.cover_i 
          ? `${OPEN_LIBRARY_COVERS_URL}/id/${book.cover_i}-M.jpg` 
          : `${OPEN_LIBRARY_COVERS_URL}/olid/${olid}-M.jpg`,
        isbn: book.isbn ? book.isbn[0] : '',
        // Age range is typically not provided by Open Library API
        // In a real app, this could be determined by other means or through a different API
        ageRange: determineAgeRange(book.title),
      };
    });
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

// Simple function to guess age range based on title keywords
// In a real application, this would be more sophisticated or use a dedicated API
function determineAgeRange(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('baby') || lowerTitle.includes('infant') || lowerTitle.includes('goodnight')) {
    return '0-2 yrs';
  } else if (lowerTitle.includes('toddler') || lowerTitle.includes('little')) {
    return '1-3 yrs';
  } else if (lowerTitle.includes('preschool') || lowerTitle.includes('abc') || lowerTitle.includes('alphabet')) {
    return '2-4 yrs';
  } else {
    return '0-3 yrs'; // Default for our target audience
  }
}

export async function getBookById(olid: string): Promise<BookSearchResult | null> {
  if (!olid) return null;

  try {
    const response = await axios.get(`https://openlibrary.org/works/${olid}.json`);
    
    if (!response.data) {
      return null;
    }

    const book = response.data;
    
    // Get author information
    let author = 'Unknown Author';
    if (book.authors && book.authors.length > 0) {
      try {
        const authorKey = book.authors[0].author.key.split('/').pop();
        const authorResponse = await axios.get(`https://openlibrary.org/authors/${authorKey}.json`);
        author = authorResponse.data.name;
      } catch (error) {
        console.error('Error fetching author:', error);
      }
    }

    return {
      olid,
      title: book.title,
      author,
      coverUrl: `${OPEN_LIBRARY_COVERS_URL}/olid/${olid}-M.jpg`,
      isbn: '',
      ageRange: determineAgeRange(book.title),
    };
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

// Function to get recommended books for a child
// In a real app, this would use a more sophisticated algorithm based on age, interests, etc.
export async function getRecommendedBooks(childAge: number): Promise<BookSearchResult[]> {
  try {
    // For simplicity, we'll just get popular children's books
    // In a real app, this would be more targeted based on the child's preferences
    const query = childAge <= 1 ? 'baby books' : childAge <= 3 ? 'toddler books' : 'children books';
    
    const response = await axios.get(`https://openlibrary.org/search.json`, {
      params: {
        q: query,
        limit: 5,
        fields: 'key,title,author_name,cover_i,isbn,first_publish_year',
      }
    });

    if (!response.data.docs || !Array.isArray(response.data.docs)) {
      return [];
    }

    return response.data.docs.map((book: OpenLibraryBook) => {
      const olid = book.key.split('/').pop() || '';
      return {
        olid,
        title: book.title,
        author: book.author_name ? book.author_name[0] : 'Unknown Author',
        coverUrl: book.cover_i 
          ? `${OPEN_LIBRARY_COVERS_URL}/id/${book.cover_i}-M.jpg` 
          : `${OPEN_LIBRARY_COVERS_URL}/olid/${olid}-M.jpg`,
        isbn: book.isbn ? book.isbn[0] : '',
        ageRange: determineAgeRange(book.title),
      };
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}
