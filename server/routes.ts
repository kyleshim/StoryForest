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

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Child routes
  app.get("/api/children", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const children = await storage.getChildrenByUserId(req.user!.id);
    const childrenWithStats = await Promise.all(
      children.map(child => storage.getChildWithStats(child.id))
    );
    
    res.json(childrenWithStats.filter(Boolean));
  });
  
  app.post("/api/children", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const validatedData = insertChildSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const child = await storage.createChild(validatedData);
      const childWithStats = await storage.getChildWithStats(child.id);
      
      res.status(201).json(childWithStats);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).send("Server error");
    }
  });
  
  app.get("/api/children/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const childId = parseInt(req.params.id);
    if (isNaN(childId)) return res.status(400).send("Invalid child ID");
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).send("Child not found");
    
    // Check if the child belongs to the requesting user
    if (child.userId !== req.user!.id) {
      const childOwner = await storage.getUser(child.userId);
      if (!childOwner || !childOwner.isPublic) {
        return res.status(403).send("Access denied");
      }
    }
    
    const childWithStats = await storage.getChildWithStats(childId);
    res.json(childWithStats);
  });
  
  // Library routes
  app.get("/api/children/:id/library", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const childId = parseInt(req.params.id);
    if (isNaN(childId)) return res.status(400).send("Invalid child ID");
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).send("Child not found");
    
    // Check if the child belongs to the requesting user or is public
    if (child.userId !== req.user!.id) {
      const childOwner = await storage.getUser(child.userId);
      if (!childOwner || !childOwner.isPublic) {
        return res.status(403).send("Access denied");
      }
    }
    
    const libraryBooks = await storage.getLibraryBooks(childId);
    res.json(libraryBooks);
  });
  
  app.post("/api/children/:id/library", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const childId = parseInt(req.params.id);
    if (isNaN(childId)) return res.status(400).send("Invalid child ID");
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).send("Child not found");
    
    // Only the owner can add books to the library
    if (child.userId !== req.user!.id) {
      return res.status(403).send("Access denied");
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
      res.status(500).send("Server error");
    }
  });
  
  app.delete("/api/children/:childId/library/:bookId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const childId = parseInt(req.params.childId);
    const bookId = parseInt(req.params.bookId);
    
    if (isNaN(childId) || isNaN(bookId)) {
      return res.status(400).send("Invalid IDs");
    }
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).send("Child not found");
    
    // Only the owner can remove books from the library
    if (child.userId !== req.user!.id) {
      return res.status(403).send("Access denied");
    }
    
    await storage.removeBookFromLibrary(childId, bookId);
    res.json({ success: true });
  });
  
  app.post("/api/children/:childId/library/:bookId/rate", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const childId = parseInt(req.params.childId);
    const bookId = parseInt(req.params.bookId);
    
    if (isNaN(childId) || isNaN(bookId)) {
      return res.status(400).send("Invalid IDs");
    }
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).send("Child not found");
    
    // Only the owner can rate books
    if (child.userId !== req.user!.id) {
      return res.status(403).send("Access denied");
    }
    
    const rating = req.body.rating;
    if (rating !== 'up' && rating !== 'down' && rating !== null) {
      return res.status(400).send("Invalid rating");
    }
    
    await storage.updateBookRating(childId, bookId, rating);
    res.json({ success: true });
  });
  
  // Wishlist routes
  app.get("/api/children/:id/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const childId = parseInt(req.params.id);
    if (isNaN(childId)) return res.status(400).send("Invalid child ID");
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).send("Child not found");
    
    // Check if the child belongs to the requesting user or is public
    if (child.userId !== req.user!.id) {
      const childOwner = await storage.getUser(child.userId);
      if (!childOwner || !childOwner.isPublic) {
        return res.status(403).send("Access denied");
      }
    }
    
    const wishlistBooks = await storage.getWishlistBooks(childId);
    res.json(wishlistBooks);
  });
  
  app.post("/api/children/:id/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const childId = parseInt(req.params.id);
    if (isNaN(childId)) return res.status(400).send("Invalid child ID");
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).send("Child not found");
    
    // Only the owner can add books to the wishlist
    if (child.userId !== req.user!.id) {
      return res.status(403).send("Access denied");
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
      res.status(500).send("Server error");
    }
  });
  
  app.delete("/api/children/:childId/wishlist/:bookId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const childId = parseInt(req.params.childId);
    const bookId = parseInt(req.params.bookId);
    
    if (isNaN(childId) || isNaN(bookId)) {
      return res.status(400).send("Invalid IDs");
    }
    
    const child = await storage.getChild(childId);
    if (!child) return res.status(404).send("Child not found");
    
    // Only the owner can remove books from the wishlist
    if (child.userId !== req.user!.id) {
      return res.status(403).send("Access denied");
    }
    
    await storage.removeBookFromWishlist(childId, bookId);
    res.json({ success: true });
  });
  
  // Discovery routes
  app.get("/api/discover/children", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const publicChildren = await storage.getPublicChildren();
    res.json(publicChildren);
  });
  
  app.get("/api/users/:id/children", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).send("Invalid user ID");
    
    const publicChildren = await storage.getPublicChildrenByUserId(userId);
    res.json(publicChildren);
  });
  
  app.get("/api/users/search", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const query = req.query.q as string;
    const users = await storage.searchPublicUsers(query);
    res.json(users);
  });

  const httpServer = createServer(app);

  return httpServer;
}
