import { eq, inArray } from "drizzle-orm";
import { db, pool } from "../db";
import {
  books,
  children,
  libraryBooks,
  userPreferences,
  wishlistBooks,
} from "@shared/schema";

async function main() {
  const clerkId = process.env.SEED_CLERK_ID || process.env.CLERK_USER_ID;

  if (!clerkId) {
    throw new Error(
      "Provide a Clerk user id via SEED_CLERK_ID (recommended) or CLERK_USER_ID before running the seeder.",
    );
  }

  console.log(`Seeding StoryForest sample data for Clerk user: ${clerkId}`);

  await db.transaction(async (tx) => {
    const existingChildren = await tx
      .select({ id: children.id })
      .from(children)
      .where(eq(children.clerkId, clerkId));

    if (existingChildren.length > 0) {
      const childIds = existingChildren.map((child) => child.id);
      await tx.delete(libraryBooks).where(inArray(libraryBooks.childId, childIds));
      await tx.delete(wishlistBooks).where(inArray(wishlistBooks.childId, childIds));
      await tx.delete(children).where(eq(children.clerkId, clerkId));
    }

    await tx
      .insert(userPreferences)
      .values({ clerkId, isPublic: true })
      .onConflictDoUpdate({
        target: userPreferences.clerkId,
        set: { isPublic: true },
      });

    const insertedChildren = await tx
      .insert(children)
      .values([
        {
          name: "Hazel",
          birthMonth: 5,
          birthYear: 2016,
          clerkId,
        },
        {
          name: "Theo",
          birthMonth: 11,
          birthYear: 2019,
          clerkId,
        },
      ])
      .returning({ id: children.id, name: children.name });

    const sampleBooks = [
      {
        title: "The Girl Who Drank the Moon",
        author: "Kelly Barnhill",
        coverUrl:
          "https://books.googleusercontent.com/books/content?id=KqJdDAAAQBAJ&printsec=frontcover&img=1&zoom=2",
        isbn: "9781616206567",
        olid: "OL26331957M",
        ageRange: "9-12",
      },
      {
        title: "Last Stop on Market Street",
        author: "Matt de la Peña",
        coverUrl:
          "https://books.googleusercontent.com/books/content?id=5R3OBgAAQBAJ&printsec=frontcover&img=1&zoom=2",
        isbn: "9780698173346",
        olid: "OL25749373M",
        ageRange: "5-8",
      },
      {
        title: "Dragon Hoops",
        author: "Gene Luen Yang",
        coverUrl:
          "https://books.googleusercontent.com/books/content?id=FWr_DwAAQBAJ&printsec=frontcover&img=1&zoom=2",
        isbn: "9781626721807",
        olid: "OL27327132M",
        ageRange: "10-14",
      },
      {
        title: "The Rabbit Listened",
        author: "Cori Doerrfeld",
        coverUrl:
          "https://books.googleusercontent.com/books/content?id=Vt1XDwAAQBAJ&printsec=frontcover&img=1&zoom=2",
        isbn: "9780735231154",
        olid: "OL26331958M",
        ageRange: "3-6",
      },
    ];

    const insertedBooks = [] as { id: number; olid: string }[];

    for (const book of sampleBooks) {
      const [existing] = await tx
        .select({ id: books.id })
        .from(books)
        .where(eq(books.olid, book.olid ?? ""));

      if (existing) {
        insertedBooks.push({ id: existing.id, olid: book.olid });
        await tx
          .update(books)
          .set(book)
          .where(eq(books.id, existing.id));
      } else {
        const [created] = await tx.insert(books).values(book).returning({
          id: books.id,
          olid: books.olid,
        });
        insertedBooks.push(created);
      }
    }

    const hazel = insertedChildren.find((child) => child.name === "Hazel");
    const theo = insertedChildren.find((child) => child.name === "Theo");

    if (!hazel || !theo) {
      throw new Error("Failed to create sample children");
    }

    const girlWhoDrankTheMoon = insertedBooks.find((book) => book.olid === "OL26331957M");
    const lastStopOnMarketStreet = insertedBooks.find((book) => book.olid === "OL25749373M");
    const dragonHoops = insertedBooks.find((book) => book.olid === "OL27327132M");
    const rabbitListened = insertedBooks.find((book) => book.olid === "OL26331958M");

    if (!girlWhoDrankTheMoon || !lastStopOnMarketStreet || !dragonHoops || !rabbitListened) {
      throw new Error("Failed to create sample books");
    }

    await tx.insert(libraryBooks).values([
      {
        childId: hazel.id,
        bookId: girlWhoDrankTheMoon.id,
        rating: "up",
      },
      {
        childId: hazel.id,
        bookId: dragonHoops.id,
        rating: null,
      },
      {
        childId: theo.id,
        bookId: rabbitListened.id,
        rating: null,
      },
    ]);

    await tx.insert(wishlistBooks).values([
      {
        childId: hazel.id,
        bookId: lastStopOnMarketStreet.id,
      },
      {
        childId: theo.id,
        bookId: girlWhoDrankTheMoon.id,
      },
    ]);
  });

  console.log("Sample data seeded successfully. You can now log in with the matching Clerk user to view the demo library and wishlist.");
}

main()
  .catch((error) => {
    console.error("Failed to seed sample data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
