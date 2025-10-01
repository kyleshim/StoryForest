import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertChildSchema,
  insertBookSchema,
  insertLibraryBookSchema, 
  insertWishlistBookSchema
} from "@shared/schema";
import { z } from "zod";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Public endpoint for featured books (no auth required)
  app.get("/api/books/featured", async (req, res) => {
    try {
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: 'subject:children',
          maxResults: 12,
          printType: 'books',
          orderBy: 'relevance'
        }
      });

      const books = response.data.items ? response.data.items.map((item: any) => {
        const volumeInfo = item.volumeInfo || {};
        
        let coverUrl = '';
        if (volumeInfo.imageLinks) {
          coverUrl = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail || '';
          coverUrl = coverUrl.replace('http://', 'https://');
        }
        
        let isbn = '';
        if (volumeInfo.industryIdentifiers && volumeInfo.industryIdentifiers.length > 0) {
          const isbnObj = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_13') || 
                        volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_10') ||
                        volumeInfo.industryIdentifiers[0];
          isbn = isbnObj.identifier;
        }
        
        return {
          googleId: item.id,
          title: volumeInfo.title || 'Unknown Title',
          author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
          coverUrl,
          isbn,
          ageRange: '',
          description: volumeInfo.description || '',
          publishedDate: volumeInfo.publishedDate || '',
          olid: item.id
        };
      }) : [];
      
      res.json(books);
    } catch (error) {
      console.error('Google Books API error:', error);
      res.status(500).json({ error: "Failed to fetch featured books" });
    }
  });

  // Public endpoint for book search (no auth required)
  app.get("/api/public/books/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: query,
          maxResults: 20,
          printType: 'books',
          orderBy: 'relevance'
        }
      });

      const books = response.data.items ? response.data.items.map((item: any) => {
        const volumeInfo = item.volumeInfo || {};
        
        let coverUrl = '';
        if (volumeInfo.imageLinks) {
          coverUrl = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail || '';
          coverUrl = coverUrl.replace('http://', 'https://');
        }
        
        let isbn = '';
        if (volumeInfo.industryIdentifiers && volumeInfo.industryIdentifiers.length > 0) {
          const isbnObj = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_13') || 
                        volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_10') ||
                        volumeInfo.industryIdentifiers[0];
          isbn = isbnObj.identifier;
        }
        
        return {
          googleId: item.id,
          title: volumeInfo.title || 'Unknown Title',
          author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
          coverUrl,
          isbn,
          ageRange: '',
          description: volumeInfo.description || '',
          publishedDate: volumeInfo.publishedDate || '',
          olid: item.id
        };
      }) : [];
      
      res.json(books);
    } catch (error) {
      console.error('Google Books API error:', error);
      res.status(500).json({ error: "Failed to search books" });
    }
  });

  // Public endpoint for ISBN search (no auth required)
  app.get("/api/public/books/isbn/:isbn", async (req, res) => {
    try {
      const isbn = req.params.isbn;
      
      if (!isbn) {
        return res.status(400).json({ error: "ISBN is required" });
      }
      
      const cleanedIsbn = isbn.replace(/[^0-9X]/gi, '');
      
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: `isbn:${cleanedIsbn}`,
          maxResults: 5,
          printType: 'books'
        }
      });

      const books = response.data.items ? response.data.items.map((item: any) => {
        const volumeInfo = item.volumeInfo || {};
        
        let coverUrl = '';
        if (volumeInfo.imageLinks) {
          coverUrl = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail || '';
          coverUrl = coverUrl.replace('http://', 'https://');
        }
        
        let bookIsbn = '';
        if (volumeInfo.industryIdentifiers && volumeInfo.industryIdentifiers.length > 0) {
          const isbnObj = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_13') || 
                        volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_10') ||
                        volumeInfo.industryIdentifiers[0];
          bookIsbn = isbnObj.identifier;
        }
        
        return {
          googleId: item.id,
          title: volumeInfo.title || 'Unknown Title',
          author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
          coverUrl,
          isbn: bookIsbn,
          ageRange: '',
          description: volumeInfo.description || '',
          publishedDate: volumeInfo.publishedDate || '',
          olid: item.id
        };
      }) : [];
      
      if (books.length === 0) {
        return res.status(404).json({ error: "No books found for this ISBN" });
      }
      
      res.json(books[0]);
    } catch (error) {
      console.error('Google Books API error:', error);
      res.status(500).json({ error: "Failed to search book by ISBN" });
    }
  });

  // Set up authentication routes
  setupAuth(app);
  
  // Child routes
  app.get("/api/children", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const children = await storage.getChildrenByClerkId(req.auth.userId);
    const childrenWithStats = await Promise.all(
      children.map(child => storage.getChildWithStats(child.id))
    );
    
    res.json(childrenWithStats.filter(Boolean));
  });
  
  app.post("/api/children", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    try {
      const validatedData = insertChildSchema.parse({
        ...req.body,
        clerkId: req.auth.userId
      });
      
      const child = await storage.createChild(validatedData);
      const childWithStats = await storage.getChildWithStats(child.id);
      
      res.status(201).json(childWithStats);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Server error" });
    }
  });
  
  app.get("/api/children/:id", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const childId = parseInt(req.params.id);
    if (isNaN(childId)) return res.status(400).json({ error: "Invalid child ID" });
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    
    // Check if the child belongs to the requesting user
    if (child.clerkId !== req.auth.userId) {
      const prefs = await storage.getUserPreferences(child.clerkId);
      if (!prefs || !prefs.isPublic) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    
    const childWithStats = await storage.getChildWithStats(childId);
    res.json(childWithStats);
  });
  
  // Library routes
  app.get("/api/children/:id/library", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const childId = parseInt(req.params.id);
    if (isNaN(childId)) return res.status(400).json({ error: "Invalid child ID" });
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    
    // Check if the child belongs to the requesting user or is public
    if (child.clerkId !== req.auth.userId) {
      const prefs = await storage.getUserPreferences(child.clerkId);
      if (!prefs || !prefs.isPublic) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    
    const libraryBooks = await storage.getLibraryBooks(childId);
    res.json(libraryBooks);
  });
  
  app.post("/api/children/:id/library", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const childId = parseInt(req.params.id);
    if (isNaN(childId)) return res.status(400).json({ error: "Invalid child ID" });
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    
    // Only the owner can add books to the library
    if (child.clerkId !== req.auth.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    try {
      // First, check if the book exists or needs to be created
      let book = await storage.getBookByOlid(req.body.olid);
      if (!book) {
        const validatedBookData = insertBookSchema.parse(req.body);
        book = await storage.createBook(validatedBookData);
      }
      
      // Then add the book to the library
      const validatedData = insertLibraryBookSchema.parse({
        childId,
        bookId: book.id,
        rating: req.body.rating || null
      });
      
      await storage.addBookToLibrary(validatedData);
      
      res.status(201).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Server error" });
    }
  });
  
  app.delete("/api/children/:childId/library/:bookId", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const childId = parseInt(req.params.childId);
    const bookId = parseInt(req.params.bookId);
    
    if (isNaN(childId) || isNaN(bookId)) {
      return res.status(400).json({ error: "Invalid IDs" });
    }
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    
    // Only the owner can remove books from the library
    if (child.clerkId !== req.auth.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    await storage.removeBookFromLibrary(childId, bookId);
    res.json({ success: true });
  });
  
  app.post("/api/children/:childId/library/:bookId/rate", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const childId = parseInt(req.params.childId);
    const bookId = parseInt(req.params.bookId);
    
    if (isNaN(childId) || isNaN(bookId)) {
      return res.status(400).json({ error: "Invalid IDs" });
    }
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    
    // Only the owner can rate books
    if (child.clerkId !== req.auth.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const rating = req.body.rating;
    if (rating !== 'up' && rating !== 'down' && rating !== null) {
      return res.status(400).json({ error: "Invalid rating" });
    }
    
    await storage.updateBookRating(childId, bookId, rating);
    res.json({ success: true });
  });
  
  // Wishlist routes
  app.get("/api/children/:id/wishlist", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const childId = parseInt(req.params.id);
    if (isNaN(childId)) return res.status(400).json({ error: "Invalid child ID" });
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    
    // Check if the child belongs to the requesting user or is public
    if (child.clerkId !== req.auth.userId) {
      const prefs = await storage.getUserPreferences(child.clerkId);
      if (!prefs || !prefs.isPublic) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    
    const wishlistBooks = await storage.getWishlistBooks(childId);
    res.json(wishlistBooks);
  });
  
  app.post("/api/children/:id/wishlist", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const childId = parseInt(req.params.id);
    if (isNaN(childId)) return res.status(400).json({ error: "Invalid child ID" });
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    
    // Only the owner can add books to the wishlist
    if (child.clerkId !== req.auth.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    try {
      // First, check if the book exists or needs to be created
      let book = await storage.getBookByOlid(req.body.olid);
      if (!book) {
        const validatedBookData = insertBookSchema.parse(req.body);
        book = await storage.createBook(validatedBookData);
      }
      
      // Then add the book to the wishlist
      const validatedData = insertWishlistBookSchema.parse({
        childId,
        bookId: book.id
      });
      
      await storage.addBookToWishlist(validatedData);
      
      res.status(201).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Server error" });
    }
  });
  
  app.delete("/api/children/:childId/wishlist/:bookId", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const childId = parseInt(req.params.childId);
    const bookId = parseInt(req.params.bookId);
    
    if (isNaN(childId) || isNaN(bookId)) {
      return res.status(400).json({ error: "Invalid IDs" });
    }
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    
    // Only the owner can remove books from the wishlist
    if (child.clerkId !== req.auth.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    await storage.removeBookFromWishlist(childId, bookId);
    res.json({ success: true });
  });
  
  // Discovery routes
  app.get("/api/discover/children", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const publicChildren = await storage.getPublicChildren();
    res.json(publicChildren);
  });
  
  app.get("/api/users/:clerkId/children", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const clerkId = req.params.clerkId;
    if (!clerkId) return res.status(400).json({ error: "Invalid user ID" });
    
    const publicChildren = await storage.getPublicChildrenByClerkId(clerkId);
    res.json(publicChildren);
  });
  
  // Google Books API integration
  app.get("/api/books/search", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    try {
      const query = req.query.q as string;
      
      console.log('Book search request:', { query });
      
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      let searchQuery = query;
      
      // Simple search without age filters
      console.log('Using simple search without age filters');
      
      console.log('Sending request to Google Books API with query:', searchQuery);
      
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: searchQuery,
          maxResults: 20,
          printType: 'books',
          orderBy: 'relevance'
        }
      });
      
      console.log('Google Books API response received. Items found:', response.data.items?.length || 0);

      // Transform the Google Books API response to match our app's format
      const books = response.data.items ? response.data.items.map((item: any) => {
        // Extract the book ID from the selfLink
        const googleId = item.id;
        
        // Get volume info
        const volumeInfo = item.volumeInfo || {};
        
        // Get cover image URL
        let coverUrl = '';
        if (volumeInfo.imageLinks) {
          coverUrl = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail || '';
          // Convert HTTP to HTTPS if needed
          coverUrl = coverUrl.replace('http://', 'https://');
        }
        
        // Get ISBN
        let isbn = '';
        if (volumeInfo.industryIdentifiers && volumeInfo.industryIdentifiers.length > 0) {
          const isbnObj = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_13') || 
                        volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_10') ||
                        volumeInfo.industryIdentifiers[0];
          isbn = isbnObj.identifier;
        }
        
        return {
          googleId,
          title: volumeInfo.title || 'Unknown Title',
          author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
          coverUrl,
          isbn,
          ageRange: '',
          description: volumeInfo.description || '',
          publishedDate: volumeInfo.publishedDate || '',
          olid: googleId // Using Google ID as our olid for consistency
        };
      }) : [];
      
      res.json(books);
    } catch (error) {
      console.error('Google Books API error:', error);
      res.status(500).json({ error: "Failed to search books" });
    }
  });
  
  // Get book details by Google Books ID
  app.get("/api/books/:id", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    try {
      const bookId = req.params.id;
      
      if (!bookId) {
        return res.status(400).json({ error: "Book ID is required" });
      }
      
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
      const item = response.data;
      
      // Get volume info
      const volumeInfo = item.volumeInfo || {};
      
      // Get cover image URL
      let coverUrl = '';
      if (volumeInfo.imageLinks) {
        coverUrl = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail || '';
        // Convert HTTP to HTTPS if needed
        coverUrl = coverUrl.replace('http://', 'https://');
      }
      
      // Get ISBN
      let isbn = '';
      if (volumeInfo.industryIdentifiers && volumeInfo.industryIdentifiers.length > 0) {
        const isbnObj = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_13') || 
                      volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_10') ||
                      volumeInfo.industryIdentifiers[0];
        isbn = isbnObj.identifier;
      }
      
      const book = {
        googleId: item.id,
        title: volumeInfo.title || 'Unknown Title',
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
        coverUrl,
        isbn,
        description: volumeInfo.description || '',
        publishedDate: volumeInfo.publishedDate || '',
        pageCount: volumeInfo.pageCount,
        categories: volumeInfo.categories || [],
        averageRating: volumeInfo.averageRating,
        ratingsCount: volumeInfo.ratingsCount,
        olid: item.id // Using Google ID as our olid for consistency
      };
      
      res.json(book);
    } catch (error) {
      console.error('Google Books API error:', error);
      res.status(500).json({ error: "Failed to get book details" });
    }
  });

  // Search book by ISBN
  app.get("/api/books/isbn/:isbn", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    try {
      const isbn = req.params.isbn;
      
      console.log('ISBN search request:', { isbn });
      
      if (!isbn) {
        return res.status(400).json({ error: "ISBN is required" });
      }
      
      // Clean the ISBN (remove any non-numeric characters except X)
      const cleanedIsbn = isbn.replace(/[^0-9X]/gi, '');
      
      console.log('Sending request to Google Books API with ISBN:', cleanedIsbn);
      
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: `isbn:${cleanedIsbn}`,
          maxResults: 5,
          printType: 'books'
        }
      });
      
      console.log('Google Books API response received. Items found:', response.data.items?.length || 0);

      // Transform the Google Books API response to match our app's format
      const books = response.data.items ? response.data.items.map((item: any) => {
        // Extract the book ID from the selfLink
        const googleId = item.id;
        
        // Get volume info
        const volumeInfo = item.volumeInfo || {};
        
        // Get cover image URL
        let coverUrl = '';
        if (volumeInfo.imageLinks) {
          coverUrl = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail || '';
          // Convert HTTP to HTTPS if needed
          coverUrl = coverUrl.replace('http://', 'https://');
        }
        
        // Get ISBN
        let bookIsbn = '';
        if (volumeInfo.industryIdentifiers && volumeInfo.industryIdentifiers.length > 0) {
          const isbnObj = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_13') || 
                        volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_10') ||
                        volumeInfo.industryIdentifiers[0];
          bookIsbn = isbnObj.identifier;
        }
        
        return {
          googleId,
          title: volumeInfo.title || 'Unknown Title',
          author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
          coverUrl,
          isbn: bookIsbn,
          ageRange: '',
          description: volumeInfo.description || '',
          publishedDate: volumeInfo.publishedDate || '',
          olid: googleId // Using Google ID as our olid for consistency
        };
      }) : [];
      
      if (books.length === 0) {
        return res.status(404).json({ error: "No books found for this ISBN" });
      }
      
      // Return the first (most relevant) book
      res.json(books[0]);
    } catch (error) {
      console.error('Google Books API error:', error);
      res.status(500).json({ error: "Failed to search book by ISBN" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}