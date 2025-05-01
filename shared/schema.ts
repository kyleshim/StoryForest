import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
});

export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  userId: integer("user_id").notNull(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  coverUrl: text("cover_url"),
  isbn: text("isbn"),
  olid: text("olid"), // Open Library ID
  ageRange: text("age_range"),
});

export const libraryBooks = pgTable("library_books", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  bookId: integer("book_id").notNull(),
  rating: text("rating"), // 'up', 'down', or null
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const wishlistBooks = pgTable("wishlist_books", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  bookId: integer("book_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  isPublic: true,
});

export const insertChildSchema = createInsertSchema(children).pick({
  name: true,
  age: true,
  userId: true,
});

export const insertBookSchema = createInsertSchema(books).pick({
  title: true,
  author: true,
  coverUrl: true,
  isbn: true,
  olid: true,
  ageRange: true,
});

export const insertLibraryBookSchema = createInsertSchema(libraryBooks).pick({
  childId: true,
  bookId: true,
  rating: true,
});

export const insertWishlistBookSchema = createInsertSchema(wishlistBooks).pick({
  childId: true,
  bookId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof children.$inferSelect;

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

export type InsertLibraryBook = z.infer<typeof insertLibraryBookSchema>;
export type LibraryBook = typeof libraryBooks.$inferSelect;

export type InsertWishlistBook = z.infer<typeof insertWishlistBookSchema>;
export type WishlistBook = typeof wishlistBooks.$inferSelect;

// Extended types for API responses
export type ChildWithStats = Child & {
  libraryCount: number;
  wishlistCount: number;
};

export type BookWithDetails = Book & {
  inLibrary?: boolean;
  inWishlist?: boolean;
  rating?: string | null;
};
