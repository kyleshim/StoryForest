import { useQuery } from "@tanstack/react-query";
import { BookCard } from "@/components/book-card";

interface DebugBook {
  id: number;
  title: string;
  author: string;
  coverUrl: string | null;
  ageRange: string | null;
  isbn: string | null;
  olid: string | null;
}

export default function DebugPage() {
  const { data: books, isLoading } = useQuery<DebugBook[]>({
    queryKey: ['/test-books'],
  });

  if (isLoading) {
    return <div className="p-8">Loading debug books...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug: Book Thumbnails Test</h1>
      <p className="mb-6 text-gray-600">
        Testing thumbnail display with object-contain vs object-cover
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books?.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            view="library"
          />
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Expected Behavior:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Full book covers visible without cropping</li>
          <li>Images maintain aspect ratio (no distortion)</li>
          <li>Container sizes stay consistent</li>
          <li>Images use constraining dimension to fit</li>
        </ul>
      </div>
    </div>
  );
}