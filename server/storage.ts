import { 
  User, InsertUser, 
  Child, InsertChild, ChildWithStats,
  Book, InsertBook, BookWithDetails,
  LibraryBook, InsertLibraryBook,
  WishlistBook, InsertWishlistBook,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Child methods
  getChild(id: number): Promise<Child | undefined>;
  getChildrenByUserId(userId: number): Promise<Child[]>;
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
  getPublicChildrenByUserId(userId: number): Promise<ChildWithStats[]>;
  searchPublicUsers(query: string): Promise<User[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private children: Map<number, Child>;
  private books: Map<number, Book>;
  private libraryBooks: Map<number, LibraryBook>;
  private wishlistBooks: Map<number, WishlistBook>;
  
  sessionStore: session.SessionStore;
  
  currentUserId: number;
  currentChildId: number;
  currentBookId: number;
  currentLibraryBookId: number;
  currentWishlistBookId: number;

  constructor() {
    this.users = new Map();
    this.children = new Map();
    this.books = new Map();
    this.libraryBooks = new Map();
    this.wishlistBooks = new Map();
    
    this.currentUserId = 1;
    this.currentChildId = 1;
    this.currentBookId = 1;
    this.currentLibraryBookId = 1;
    this.currentWishlistBookId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Child methods
  async getChild(id: number): Promise<Child | undefined> {
    return this.children.get(id);
  }

  async getChildrenByUserId(userId: number): Promise<Child[]> {
    return Array.from(this.children.values()).filter(
      (child) => child.userId === userId,
    );
  }

  async getChildWithStats(id: number): Promise<ChildWithStats | undefined> {
    const child = this.children.get(id);
    if (!child) return undefined;

    const libraryCount = Array.from(this.libraryBooks.values()).filter(
      (lb) => lb.childId === id
    ).length;

    const wishlistCount = Array.from(this.wishlistBooks.values()).filter(
      (wb) => wb.childId === id
    ).length;

    return {
      ...child,
      libraryCount,
      wishlistCount,
    };
  }

  async createChild(insertChild: InsertChild): Promise<Child> {
    const id = this.currentChildId++;
    const child: Child = { ...insertChild, id };
    this.children.set(id, child);
    return child;
  }

  // Book methods
  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBookByOlid(olid: string): Promise<Book | undefined> {
    return Array.from(this.books.values()).find(
      (book) => book.olid === olid,
    );
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.currentBookId++;
    const book: Book = { ...insertBook, id };
    this.books.set(id, book);
    return book;
  }

  // Library methods
  async addBookToLibrary(insertLibraryBook: InsertLibraryBook): Promise<LibraryBook> {
    const id = this.currentLibraryBookId++;
    const libraryBook: LibraryBook = { 
      ...insertLibraryBook, 
      id, 
      addedAt: new Date() 
    };
    this.libraryBooks.set(id, libraryBook);
    return libraryBook;
  }

  async removeBookFromLibrary(childId: number, bookId: number): Promise<void> {
    for (const [id, libraryBook] of this.libraryBooks.entries()) {
      if (libraryBook.childId === childId && libraryBook.bookId === bookId) {
        this.libraryBooks.delete(id);
        return;
      }
    }
  }

  async getLibraryBooks(childId: number): Promise<BookWithDetails[]> {
    const libraryBooksForChild = Array.from(this.libraryBooks.values()).filter(
      (lb) => lb.childId === childId
    );

    const result: BookWithDetails[] = [];
    for (const lb of libraryBooksForChild) {
      const book = this.books.get(lb.bookId);
      if (book) {
        result.push({
          ...book,
          inLibrary: true,
          inWishlist: this.isBookInWishlist(childId, book.id),
          rating: lb.rating || null,
        });
      }
    }
    return result;
  }

  async updateBookRating(childId: number, bookId: number, rating: string | null): Promise<void> {
    for (const [id, libraryBook] of this.libraryBooks.entries()) {
      if (libraryBook.childId === childId && libraryBook.bookId === bookId) {
        this.libraryBooks.set(id, { ...libraryBook, rating });
        return;
      }
    }
  }

  // Wishlist methods
  async addBookToWishlist(insertWishlistBook: InsertWishlistBook): Promise<WishlistBook> {
    const id = this.currentWishlistBookId++;
    const wishlistBook: WishlistBook = { 
      ...insertWishlistBook, 
      id, 
      addedAt: new Date() 
    };
    this.wishlistBooks.set(id, wishlistBook);
    return wishlistBook;
  }

  async removeBookFromWishlist(childId: number, bookId: number): Promise<void> {
    for (const [id, wishlistBook] of this.wishlistBooks.entries()) {
      if (wishlistBook.childId === childId && wishlistBook.bookId === bookId) {
        this.wishlistBooks.delete(id);
        return;
      }
    }
  }

  async getWishlistBooks(childId: number): Promise<BookWithDetails[]> {
    const wishlistBooksForChild = Array.from(this.wishlistBooks.values()).filter(
      (wb) => wb.childId === childId
    );

    const result: BookWithDetails[] = [];
    for (const wb of wishlistBooksForChild) {
      const book = this.books.get(wb.bookId);
      if (book) {
        result.push({
          ...book,
          inLibrary: this.isBookInLibrary(childId, book.id),
          inWishlist: true,
          rating: this.getBookRating(childId, book.id),
        });
      }
    }
    return result;
  }

  // Discovery methods
  async getPublicChildren(): Promise<ChildWithStats[]> {
    const publicUserIds = Array.from(this.users.values())
      .filter(user => user.isPublic)
      .map(user => user.id);
    
    const result: ChildWithStats[] = [];
    for (const userId of publicUserIds) {
      const children = await this.getChildrenByUserId(userId);
      for (const child of children) {
        const childWithStats = await this.getChildWithStats(child.id);
        if (childWithStats) {
          result.push(childWithStats);
        }
      }
    }
    return result;
  }

  async getPublicChildrenByUserId(userId: number): Promise<ChildWithStats[]> {
    const user = await this.getUser(userId);
    if (!user || !user.isPublic) return [];

    const children = await this.getChildrenByUserId(userId);
    const result: ChildWithStats[] = [];

    for (const child of children) {
      const childWithStats = await this.getChildWithStats(child.id);
      if (childWithStats) {
        result.push(childWithStats);
      }
    }

    return result;
  }

  async searchPublicUsers(query: string): Promise<User[]> {
    if (!query) return [];
    
    return Array.from(this.users.values()).filter(
      (user) => user.isPublic && 
        (user.username.toLowerCase().includes(query.toLowerCase()) ||
         user.name.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Helper methods
  private isBookInWishlist(childId: number, bookId: number): boolean {
    return Array.from(this.wishlistBooks.values()).some(
      (wb) => wb.childId === childId && wb.bookId === bookId
    );
  }

  private isBookInLibrary(childId: number, bookId: number): boolean {
    return Array.from(this.libraryBooks.values()).some(
      (lb) => lb.childId === childId && lb.bookId === bookId
    );
  }

  private getBookRating(childId: number, bookId: number): string | null {
    for (const libraryBook of this.libraryBooks.values()) {
      if (libraryBook.childId === childId && libraryBook.bookId === bookId) {
        return libraryBook.rating || null;
      }
    }
    return null;
  }
}

export const storage = new MemStorage();
