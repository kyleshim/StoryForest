import { 
  User, InsertUserPreferences, UpsertUserPreferences, UserPreferences,
  Child, InsertChild, ChildWithStats,
  Book, InsertBook, BookWithDetails,
  LibraryBook, InsertLibraryBook,
  WishlistBook, InsertWishlistBook,
  userPreferences, children, books, libraryBooks, wishlistBooks
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User preferences methods
  getUserPreferences(clerkId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(prefs: UpsertUserPreferences): Promise<UserPreferences>;
  
  // Child methods
  getChild(id: number): Promise<Child | undefined>;
  getChildrenByClerkId(clerkId: string): Promise<Child[]>;
  getChildWithStats(id: number): Promise<ChildWithStats | undefined>;
  createChild(child: InsertChild): Promise<Child>;
  
  // Book methods
  getBook(id: number): Promise<Book | undefined>;
  getBookByOlid(olid: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  
  // Library methods
  addBookToLibrary(libraryBook: InsertLibraryBook): Promise<LibraryBook>;
  removeBookFromLibrary(childId: number, bookId: number): Promise<void>;
  getLibraryBooks(childId: number): Promise<BookWithDetails[]>;
  updateBookRating(childId: number, bookId: number, rating: string | null): Promise<void>;
  
  // Wishlist methods
  addBookToWishlist(wishlistBook: InsertWishlistBook): Promise<WishlistBook>;
  removeBookFromWishlist(childId: number, bookId: number): Promise<void>;
  getWishlistBooks(childId: number): Promise<BookWithDetails[]>;
  
  // Discovery methods
  getPublicChildren(): Promise<ChildWithStats[]>;
  getPublicChildrenByClerkId(clerkId: string): Promise<ChildWithStats[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      tableName: "sessions",
      ttl: 7 * 24 * 60 * 60 // 1 week
    });
  }

  // User preferences methods
  async getUserPreferences(clerkId: string): Promise<UserPreferences | undefined> {
    try {
      const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.clerkId, clerkId));
      return prefs;
    } catch (error) {
      console.error("Error getting user preferences:", error);
      return undefined;
    }
  }

  async createUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences> {
    try {
      const [newPrefs] = await db.insert(userPreferences).values(prefs).returning();
      return newPrefs;
    } catch (error) {
      console.error("Error creating user preferences:", error);
      throw error;
    }
  }

  async updateUserPreferences(prefs: UpsertUserPreferences): Promise<UserPreferences> {
    try {
      // Check if preferences exist for this clerk user
      const existingPrefs = await this.getUserPreferences(prefs.clerkId);
      
      if (existingPrefs) {
        // Update existing preferences
        const [updatedPrefs] = await db
          .update(userPreferences)
          .set(prefs)
          .where(eq(userPreferences.clerkId, prefs.clerkId))
          .returning();
        return updatedPrefs;
      } else {
        // Create new preferences
        return this.createUserPreferences(prefs);
      }
    } catch (error) {
      console.error("Error updating user preferences:", error);
      throw error;
    }
  }

  // Child methods
  async getChild(id: number): Promise<Child | undefined> {
    try {
      const [child] = await db.select().from(children).where(eq(children.id, id));
      return child;
    } catch (error) {
      console.error("Error getting child:", error);
      return undefined;
    }
  }

  async getChildrenByClerkId(clerkId: string): Promise<Child[]> {
    try {
      const result = await db.select().from(children).where(eq(children.clerkId, clerkId));
      return result;
    } catch (error) {
      console.error("Error getting children by Clerk ID:", error);
      return [];
    }
  }

  async getChildWithStats(id: number): Promise<ChildWithStats | undefined> {
    try {
      const child = await this.getChild(id);
      if (!child) return undefined;

      // Count library books
      const libraryBooksQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(libraryBooks)
        .where(eq(libraryBooks.childId, id));

      // Count wishlist books
      const wishlistBooksQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(wishlistBooks)
        .where(eq(wishlistBooks.childId, id));

      const [libraryResult, wishlistResult] = await Promise.all([
        libraryBooksQuery,
        wishlistBooksQuery
      ]);

      const libraryCount = Number(libraryResult[0]?.count) || 0;
      const wishlistCount = Number(wishlistResult[0]?.count) || 0;

      return {
        ...child,
        libraryCount,
        wishlistCount,
      };
    } catch (error) {
      console.error("Error getting child stats:", error);
      return undefined;
    }
  }

  async createChild(insertChild: InsertChild): Promise<Child> {
    try {
      const [child] = await db.insert(children).values(insertChild).returning();
      return child;
    } catch (error) {
      console.error("Error creating child:", error);
      throw error;
    }
  }

  // Book methods
  async getBook(id: number): Promise<Book | undefined> {
    try {
      const [book] = await db.select().from(books).where(eq(books.id, id));
      return book;
    } catch (error) {
      console.error("Error getting book:", error);
      return undefined;
    }
  }

  async getBookByOlid(olid: string): Promise<Book | undefined> {
    try {
      const [book] = await db.select().from(books).where(eq(books.olid, olid));
      return book;
    } catch (error) {
      console.error("Error getting book by OLID:", error);
      return undefined;
    }
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    try {
      const [book] = await db.insert(books).values(insertBook).returning();
      return book;
    } catch (error) {
      console.error("Error creating book:", error);
      throw error;
    }
  }

  // Library methods
  async addBookToLibrary(insertLibraryBook: InsertLibraryBook): Promise<LibraryBook> {
    try {
      const libraryBookWithDate = {
        ...insertLibraryBook,
        addedAt: new Date()
      };
      const [libraryBook] = await db.insert(libraryBooks).values(libraryBookWithDate).returning();
      return libraryBook;
    } catch (error) {
      console.error("Error adding book to library:", error);
      throw error;
    }
  }

  async removeBookFromLibrary(childId: number, bookId: number): Promise<void> {
    try {
      await db.delete(libraryBooks)
        .where(and(
          eq(libraryBooks.childId, childId),
          eq(libraryBooks.bookId, bookId)
        ));
    } catch (error) {
      console.error("Error removing book from library:", error);
      throw error;
    }
  }

  async getLibraryBooks(childId: number): Promise<BookWithDetails[]> {
    try {
      // Get all library books for the child with their details
      const query = db
        .select({
          book: books,
          inLibrary: sql<boolean>`true`,
          rating: libraryBooks.rating
        })
        .from(libraryBooks)
        .innerJoin(books, eq(libraryBooks.bookId, books.id))
        .where(eq(libraryBooks.childId, childId));

      const libraryBooksResult = await query;

      // Check wishlist status for each book
      const result: BookWithDetails[] = [];
      for (const item of libraryBooksResult) {
        // Check if this book is in the wishlist
        const [wishlistBook] = await db
          .select()
          .from(wishlistBooks)
          .where(and(
            eq(wishlistBooks.childId, childId),
            eq(wishlistBooks.bookId, item.book.id)
          ))
          .limit(1);

        result.push({
          ...item.book,
          inLibrary: true,
          inWishlist: !!wishlistBook,
          rating: item.rating
        });
      }

      return result;
    } catch (error) {
      console.error("Error getting library books:", error);
      return [];
    }
  }

  async updateBookRating(childId: number, bookId: number, rating: string | null): Promise<void> {
    try {
      await db.update(libraryBooks)
        .set({ rating })
        .where(and(
          eq(libraryBooks.childId, childId),
          eq(libraryBooks.bookId, bookId)
        ));
    } catch (error) {
      console.error("Error updating book rating:", error);
      throw error;
    }
  }

  // Wishlist methods
  async addBookToWishlist(insertWishlistBook: InsertWishlistBook): Promise<WishlistBook> {
    try {
      const wishlistBookWithDate = {
        ...insertWishlistBook,
        addedAt: new Date()
      };
      const [wishlistBook] = await db.insert(wishlistBooks).values(wishlistBookWithDate).returning();
      return wishlistBook;
    } catch (error) {
      console.error("Error adding book to wishlist:", error);
      throw error;
    }
  }

  async removeBookFromWishlist(childId: number, bookId: number): Promise<void> {
    try {
      await db.delete(wishlistBooks)
        .where(and(
          eq(wishlistBooks.childId, childId),
          eq(wishlistBooks.bookId, bookId)
        ));
    } catch (error) {
      console.error("Error removing book from wishlist:", error);
      throw error;
    }
  }

  async getWishlistBooks(childId: number): Promise<BookWithDetails[]> {
    try {
      // Get all wishlist books for the child with their details
      const query = db
        .select({
          book: books,
          inWishlist: sql<boolean>`true`,
        })
        .from(wishlistBooks)
        .innerJoin(books, eq(wishlistBooks.bookId, books.id))
        .where(eq(wishlistBooks.childId, childId));

      const wishlistBooksResult = await query;

      // For each wishlist book, check if it's in the library and its rating
      const result: BookWithDetails[] = [];
      for (const item of wishlistBooksResult) {
        // Check if book is in library
        const inLibraryQuery = db
          .select()
          .from(libraryBooks)
          .where(and(
            eq(libraryBooks.childId, childId),
            eq(libraryBooks.bookId, item.book.id)
          ))
          .limit(1);
          
        const [libraryBook] = await inLibraryQuery;
        
        result.push({
          ...item.book,
          inLibrary: !!libraryBook,
          inWishlist: true,
          rating: libraryBook?.rating || null,
        });
      }

      return result;
    } catch (error) {
      console.error("Error getting wishlist books:", error);
      return [];
    }
  }

  // Discovery methods
  async getPublicChildren(): Promise<ChildWithStats[]> {
    try {
      // Get all preferences for users that are public
      const publicUserPrefs = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.isPublic, true));
        
      const result: ChildWithStats[] = [];
      
      // Get children for each public user
      for (const pref of publicUserPrefs) {
        const childrenWithStats = await this.getPublicChildrenByClerkId(pref.clerkId);
        result.push(...childrenWithStats);
      }
      
      return result;
    } catch (error) {
      console.error("Error getting public children:", error);
      return [];
    }
  }

  async getPublicChildrenByClerkId(clerkId: string): Promise<ChildWithStats[]> {
    try {
      const prefs = await this.getUserPreferences(clerkId);
      if (!prefs || !prefs.isPublic) return [];

      const userChildren = await this.getChildrenByClerkId(clerkId);
      const result: ChildWithStats[] = [];

      for (const child of userChildren) {
        const childWithStats = await this.getChildWithStats(child.id);
        if (childWithStats) {
          result.push(childWithStats);
        }
      }

      return result;
    } catch (error) {
      console.error("Error getting public children by Clerk ID:", error);
      return [];
    }
  }

  // Helper methods
  private async isBookInWishlist(childId: number, bookId: number): Promise<boolean> {
    try {
      const [wishlistBook] = await db
        .select()
        .from(wishlistBooks)
        .where(and(
          eq(wishlistBooks.childId, childId),
          eq(wishlistBooks.bookId, bookId)
        ))
        .limit(1);
        
      return !!wishlistBook;
    } catch (error) {
      console.error("Error checking if book is in wishlist:", error);
      return false;
    }
  }

  private async isBookInLibrary(childId: number, bookId: number): Promise<boolean> {
    try {
      const [libraryBook] = await db
        .select()
        .from(libraryBooks)
        .where(and(
          eq(libraryBooks.childId, childId),
          eq(libraryBooks.bookId, bookId)
        ))
        .limit(1);
        
      return !!libraryBook;
    } catch (error) {
      console.error("Error checking if book is in library:", error);
      return false;
    }
  }

  private async getBookRating(childId: number, bookId: number): Promise<string | null> {
    try {
      const [libraryBook] = await db
        .select({ rating: libraryBooks.rating })
        .from(libraryBooks)
        .where(and(
          eq(libraryBooks.childId, childId),
          eq(libraryBooks.bookId, bookId)
        ))
        .limit(1);
        
      return libraryBook?.rating || null;
    } catch (error) {
      console.error("Error getting book rating:", error);
      return null;
    }
  }
}

export const storage = new DatabaseStorage();