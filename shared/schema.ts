import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User preferences (for Clerk users)
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerk_id", { length: 64 }).notNull().unique(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  birthMonth: integer("birth_month").notNull(), // Month (1-12)
  birthYear: integer("birth_year").notNull(), // Year (e.g., 2020)
  clerkId: varchar("clerk_id", { length: 64 }).notNull(),
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
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  clerkId: true,
  isPublic: true,
});

export const upsertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  id: true,
  clerkId: true,
  isPublic: true,
});

export const insertChildSchema = createInsertSchema(children).pick({
  name: true,
  birthMonth: true,
  birthYear: true,
  clerkId: true,
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
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UpsertUserPreferences = z.infer<typeof upsertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// Interface for Clerk user data mapped to our app
export interface User {
  id: string; // Clerk user ID
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
