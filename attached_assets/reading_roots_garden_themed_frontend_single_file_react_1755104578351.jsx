import React, { useEffect, useMemo, useState } from "react";

// Garden-themed Children's Home Library App
// Single-file React component using TailwindCSS
// Purpose: track which books are owned, with playful farm/garden visuals

// ---------- Types ----------
type Book = {
  id: string
  title: string
  author: string
  category: string
  age: string
  owned: boolean
  notes?: string
  color?: string // used for card accent
  tags?: string[]
};

type Filters = {
  q: string
  age: string
  category: string
  owned: "all" | "owned" | "not_owned"
};

// ---------- Utils ----------
const uid = () => Math.random().toString(36).slice(2, 9);

const SAMPLE_BOOKS: Book[] = [
  {
    id: uid(),
    title: "The Very Hungry Caterpillar",
    author: "Eric Carle",
    category: "Picture Book",
    age: "0-3",
    owned: true,
    color: "#86efac",
    tags: ["classic", "nature"],
  },
  {
    id: uid(),
    title: "Little Blue Truck",
    author: "Alice Schertle",
    category: "Picture Book",
    age: "0-3",
    owned: false,
    color: "#93c5fd",
    tags: ["farm", "rhymes"],
  },
  {
    id: uid(),
    title: "Charlotte's Web",
    author: "E. B. White",
    category: "Chapter Book",
    age: "6-9",
    owned: true,
    color: "#fde68a",
    tags: ["farm", "friendship"],
  },
  {
    id: uid(),
    title: "Up in the Garden and Down in the Dirt",
    author: "Kate Messner",
    category: "Nonfiction",
    age: "3-6",
    owned: false,
    color: "#a7f3d0",
    tags: ["garden", "STEM"],
  },
  {
    id: uid(),
    title: "Seeds and Trees",
    author: "Brandon Walden",
    category: "Picture Book",
    age: "3-6",
    owned: false,
    color: "#fca5a5",
    tags: ["kindness"],
  },
];

const STORAGE_KEY = "reading-roots-books";

// ---------- Decorative SVGs ----------
const Sun = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <circle cx="32" cy="32" r="12" fill="#fde047" />
    {[...Array(12)].map((_, i) => {
      const angle = (i * Math.PI * 2) / 12;
      const x1 = 32 + Math.cos(angle) * 18;
      const y1 = 32 + Math.sin(angle) * 18;
      const x2 = 32 + Math.cos(angle) * 28;
      const y2 = 32 + Math.sin(angle) * 28;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fde047" strokeWidth="4" strokeLinecap="round" />;
    })}
  </svg>
);

const Cloud = ({ className = "w-24 h-12", opacity = 0.7 }) => (
  <svg viewBox="0 0 120 60" className={className} style={{ opacity }} aria-hidden>
    <ellipse cx="40" cy="30" rx="20" ry="14" fill="white" />
    <ellipse cx="60" cy="26" rx="24" ry="18" fill="white" />
    <ellipse cx="80" cy="32" rx="22" ry="16" fill="white" />
  </svg>
);

const Sprout = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M12 22c-.6-5-1-9 0-12 1.5-4.5 5.5-6.5 10-7-1 4-3.5 8-8 9-1.1.2-2 .9-2 2v8z" fill="#16a34a" />
    <path d="M12 14c-.5-3-1.8-5.3-4.3-6.9C5 5.5 2.4 5.1 1 5c.9 2.9 2.4 5 4.7 6.4 1.9 1.1 4 1.6 6.3 2.6z" fill="#22c55e" />
  </svg>
);

const Barn = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <rect x="10" y="24" width="44" height="28" fill="#ef4444" rx="2" />
    <polygon points="32,10 8,26 56,26" fill="#b91c1c" />
    <rect x="28" y="34" width="8" height="18" fill="#7f1d1d" />
    <line x1="32" y1="34" x2="32" y2="52" stroke="#efefef" strokeWidth="2" />
    <line x1="28" y1="43" x2="36" y2="43" stroke="#efefef" strokeWidth="2" />
  </svg>
);

const Bee = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <ellipse cx="32" cy="36" rx="12" ry="8" fill="#f59e0b" />
    <rect x="22" y="32" width="20" height="8" fill="#111827" rx="2" />
    <rect x="26" y="32" width="3" height="8" fill="#f59e0b" />
    <rect x="35" y="32" width="3" height="8" fill="#f59e0b" />
    <ellipse cx="22" cy="36" rx="5" ry="4" fill="#111827" />
    <ellipse cx="42" cy="36" rx="5" ry="4" fill="#111827" />
    <ellipse cx="25" cy="28" rx="6" ry="4" fill="#93c5fd" />
    <ellipse cx="39" cy="28" rx="6" ry="4" fill="#93c5fd" />
  </svg>
);

// ---------- Components ----------
function Header() {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      {/* Sky gradient */}
      <div className="bg-gradient-to-b from-sky-200 via-sky-100 to-green-100">
        <div className="relative px-6 pt-6 pb-24 md:pb-28">
          <div className="flex items-center gap-3">
            <Barn />
            <h1 className="text-2xl md:text-3xl font-extrabold text-green-900 tracking-tight">
              Reading Roots
            </h1>
          </div>
          <p className="mt-1 text-green-800/90 max-w-xl">
            A garden-themed library for little readers — plant your bookshelf, track what you own, and watch your collection grow.
          </p>

          {/* Sun & clouds */}
          <div className="absolute right-6 top-6 animate-[spin_40s_linear_infinite]">
            <Sun className="w-14 h-14 md:w-16 md:h-16" />
          </div>
          <div className="absolute -right-8 top-16 animate-[float_16s_ease-in-out_infinite]">
            <Cloud />
          </div>
          <div className="absolute left-4 top-8 animate-[float_20s_ease-in-out_infinite]">
            <Cloud className="w-20" opacity={0.5} />
          </div>
        </div>

        {/* Hills */}
        <svg viewBox="0 0 800 120" className="w-full h-24 md:h-28" aria-hidden>
          <path d="M0 60 C 150 0, 350 120, 500 60 C 650 0, 750 120, 800 60 L800 120 L0 120 Z" fill="#86efac" />
          <path d="M0 80 C 120 20, 320 140, 520 80 C 680 30, 760 120, 800 100 L800 120 L0 120 Z" fill="#4ade80" />
        </svg>
      </div>
    </div>
  );
}

function StatPill({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-2 shadow border border-green-100">
      {icon}
      <span className="text-sm font-medium text-green-800">{label}</span>
      <span className="text-sm text-green-700">{value}</span>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-green-900">Garden row progress</span>
        <span className="text-green-800">{pct}% owned</span>
      </div>
      <div className="h-3 w-full rounded-full bg-green-100 border border-green-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[10px] text-green-700 flex items-center gap-1"><Sprout />
        <span>Plant more books to fill the row!</span>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-emerald-500" : "bg-gray-300"
      }`}
      aria-pressed={checked}
      aria-label={label || "toggle"}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-800">
      <Sprout className="w-3 h-3" />
      {text}
    </span>
  );
}

function Controls({ filters, setFilters, onAdd }: { filters: Filters; setFilters: (f: Filters) => void; onAdd: () => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
      <div className="md:col-span-5">
        <label className="text-xs text-green-800">Search</label>
        <input
          className="mt-1 w-full rounded-xl border border-green-200 bg-white/80 px-3 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Find by title, author, or tag…"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs text-green-800">Age</label>
        <select
          className="mt-1 w-full rounded-xl border border-green-200 bg-white/80 px-3 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={filters.age}
          onChange={(e) => setFilters({ ...filters, age: e.target.value })}
        >
          <option value="">All</option>
          <option>0-3</option>
          <option>3-6</option>
          <option>6-9</option>
          <option>9-12</option>
        </select>
      </div>
      <div className="md:col-span-3">
        <label className="text-xs text-green-800">Category</label>
        <select
          className="mt-1 w-full rounded-xl border border-green-200 bg-white/80 px-3 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All</option>
          <option>Picture Book</option>
          <option>Chapter Book</option>
          <option>Nonfiction</option>
          <option>Board Book</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs text-green-800">Owned</label>
        <select
          className="mt-1 w-full rounded-xl border border-green-200 bg-white/80 px-3 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={filters.owned}
          onChange={(e) => setFilters({ ...filters, owned: e.target.value as Filters["owned"] })}
        >
          <option value="all">All</option>
          <option value="owned">Owned</option>
          <option value="not_owned">Not owned</option>
        </select>
      </div>
      <div className="md:col-span-12 flex items-center justify-between mt-1">
        <div className="flex items-center gap-2 text-xs text-green-700">
          <Bee className="w-4 h-4 animate-[ping_3s_linear_infinite]" />
          Tip: Click the seed packet to toggle Owned.
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <span className="inline-block -mt-[2px]">➕</span> Add Book
        </button>
      </div>
    </div>
  );
}

function BookCard({ book, onToggleOwned, onEdit, onDelete }: {
  book: Book
  onToggleOwned: (id: string) => void
  onEdit: (b: Book) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-green-200 bg-white/80 backdrop-blur p-3 shadow hover:shadow-md transition"
      style={{
        backgroundImage:
          "radial-gradient(circle at 10% 10%, rgba(134,239,172,0.15) 0 20%, transparent 20%), radial-gradient(circle at 90% 30%, rgba(252,211,77,0.15) 0 20%, transparent 20%)",
      }}
    >
      {/* Seed-packet style top */}
      <div className="flex items-start gap-3">
        <div className="h-14 w-10 shrink-0 rounded-md border-2 border-green-400 bg-white flex items-center justify-center shadow-inner">
          <Sprout className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-bold text-green-900" title={book.title}>
              {book.title}
            </h3>
            {book.owned ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">OWNED</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">WISHLIST</span>
            )}
          </div>
          <p className="text-sm text-green-700 truncate" title={book.author}>{book.author}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {book.tags?.slice(0, 3).map((t) => (
              <Tag key={t} text={t} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-green-800">
        <div className="rounded-lg bg-green-50 px-2 py-1 border border-green-200">Age: {book.age}</div>
        <div className="rounded-lg bg-green-50 px-2 py-1 border border-green-200">{book.category}</div>
        <div className="rounded-lg bg-green-50 px-2 py-1 border border-green-200 truncate">Color: {book.color || "seed"}</div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => onToggleOwned(book.id)}
          className={`rounded-xl px-3 py-1.5 text-sm font-semibold shadow border transition ${
            book.owned
              ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600"
              : "bg-amber-400 text-amber-950 border-amber-500 hover:bg-amber-500"
          }`}
        >
          {book.owned ? "Planted!" : "Plant it"}
        </button>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-green-200 bg-white px-2 py-1 text-xs text-green-800 hover:bg-green-50"
            onClick={() => onEdit(book)}
          >
            Edit
          </button>
          <button
            className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50"
            onClick={() => onDelete(book.id)}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Accent strip */}
      <div className="absolute right-0 top-0 h-full w-1" style={{ backgroundColor: book.color || "#bbf7d0" }} />

      {/* Hover bee */}
      <div className="pointer-events-none absolute -right-4 -top-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Bee />
      </div>
    </div>
  );
}

function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-green-200 bg-white p-4 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-green-900">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-green-700 hover:bg-green-50">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddOrEditForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<Book>
  onSubmit: (b: Omit<Book, "id">) => void
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [author, setAuthor] = useState(initial?.author || "");
  const [category, setCategory] = useState(initial?.category || "Picture Book");
  const [age, setAge] = useState(initial?.age || "0-3");
  const [owned, setOwned] = useState<boolean>(initial?.owned ?? true);
  const [color, setColor] = useState(initial?.color || "#bbf7d0");
  const [tags, setTags] = useState<string>((initial?.tags || []).join(", "));
  const [notes, setNotes] = useState(initial?.notes || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const payload: Omit<Book, "id"> = {
          title: title.trim(),
          author: author.trim(),
          category,
          age,
          owned,
          color,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          notes: notes.trim(),
        };
        onSubmit(payload);
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-green-800">Title</label>
          <input className="mt-1 w-full rounded-xl border border-green-200 px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs text-green-800">Author</label>
          <input className="mt-1 w-full rounded-xl border border-green-200 px-3 py-2 text-sm" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs text-green-800">Category</label>
          <select className="mt-1 w-full rounded-xl border border-green-200 px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Picture Book</option>
            <option>Board Book</option>
            <option>Chapter Book</option>
            <option>Nonfiction</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-green-800">Age</label>
          <select className="mt-1 w-full rounded-xl border border-green-200 px-3 py-2 text-sm" value={age} onChange={(e) => setAge(e.target.value)}>
            <option>0-3</option>
            <option>3-6</option>
            <option>6-9</option>
            <option>9-12</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div>
          <label className="text-xs text-green-800">Accent color</label>
          <input type="color" className="mt-1 h-10 w-full rounded-xl border border-green-200" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-green-800">Tags (comma-separated)</label>
          <input className="mt-1 w-full rounded-xl border border-green-200 px-3 py-2 text-sm" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="farm, animals, bedtime" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-green-800">Owned</label>
          <Toggle checked={owned} onChange={setOwned} />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-green-800">Notes</label>
          <input className="mt-1 w-full rounded-xl border border-green-200 px-3 py-2 text-sm" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gift from Grandma, 2023" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600">Save</button>
      </div>
    </form>
  );
}

export default function ReadingRootsGardenApp() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filters, setFilters] = useState<Filters>({ q: "", age: "", category: "", owned: "all" });
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);

  // Load from storage on first mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Book[];
        setBooks(parsed);
      } catch {
        setBooks(SAMPLE_BOOKS);
      }
    } else {
      setBooks(SAMPLE_BOOKS);
    }
  }, []);

  // Persist to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const ownedCount = useMemo(() => books.filter((b) => b.owned).length, [books]);
  const pct = useMemo(() => (books.length ? Math.round((ownedCount / books.length) * 100) : 0), [books.length, ownedCount]);

  const visible = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return books.filter((b) => {
      if (filters.age && b.age !== filters.age) return false;
      if (filters.category && b.category !== filters.category) return false;
      if (filters.owned === "owned" && !b.owned) return false;
      if (filters.owned === "not_owned" && b.owned) return false;
      if (!q) return true;
      const hay = [b.title, b.author, b.category, b.age, ...(b.tags || [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [books, filters]);

  const addBook = (payload: Omit<Book, "id">) => {
    setBooks((prev) => [{ id: uid(), ...payload }, ...prev]);
    setOpenModal(false);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBook = (id: string) => setBooks((prev) => prev.filter((b) => b.id !== id));

  const startEdit = (b: Book) => {
    setEditing(b);
    setOpenModal(true);
  };

  const submitEdit = (payload: Omit<Book, "id">) => {
    if (!editing) return;
    updateBook(editing.id, payload as Book);
    setEditing(null);
    setOpenModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 text-green-950">
      <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-4 md:space-y-6">
        <Header />

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-green-200 bg-white/70 backdrop-blur p-4 shadow">
            <div className="flex items-center justify-between">
              <StatPill label="Books" value={books.length} icon={<span>📚</span>} />
              <StatPill label="Owned" value={ownedCount} icon={<span>🌱</span>} />
              <StatPill label="Wishlist" value={books.length - ownedCount} icon={<span>🫘</span>} />
            </div>
            <div className="mt-3">
              <ProgressBar pct={pct} />
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-green-200 bg-white/70 backdrop-blur p-4 shadow">
            <Controls
              filters={filters}
              setFilters={setFilters}
              onAdd={() => {
                setEditing(null);
                setOpenModal(true);
              }}
            />
          </div>
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {visible.map((b) => (
            <BookCard
              key={b.id}
              book={b}
              onToggleOwned={(id) => updateBook(id, { owned: !books.find((x) => x.id === id)?.owned })}
              onEdit={startEdit}
              onDelete={deleteBook}
            />
          ))}
          {visible.length === 0 && (
            <div className="col-span-full rounded-2xl border border-green-200 bg-white/70 p-8 text-center text-green-800">
              No books match. Try clearing filters or adding a new book.
            </div>
          )}
        </div>

        {/* Soil footer */}
        <div className="relative mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow">
          <div className="flex items-center gap-2 text-amber-900 text-sm">
            <span>🌾</span>
            <p>
              Tip: Use <span className="font-semibold">Local Storage</span> keeps your garden persistent in this browser. Export/Import will be added later.
            </p>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
        title={editing ? "Edit book" : "Add a new book"}
      >
        <AddOrEditForm
          initial={editing || undefined}
          onSubmit={(payload) => (editing ? submitEdit(payload) : addBook(payload))}
        />
      </Modal>

      {/* Subtle global animations */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </div>
  );
}
