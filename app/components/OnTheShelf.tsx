import Link from "next/link";

type ShelfBook = {
  title: string;
  author: string;
  note?: string;
  cover?: string;
};

interface OnTheShelfProps {
  books: ShelfBook[];
}

export default function OnTheShelf({ books }: OnTheShelfProps) {
  if (!books || books.length === 0) return null;

  return (
    <section className="shelf-section">
      <div className="shelf-inner">
        <div className="shelf-head">
          <div className="shelf-kicker">On the Shelf</div>
          <Link href="/about" className="shelf-see-more">About Irene →</Link>
        </div>

        <div className="shelf-grid">
          {books.map((book, i) => (
            <div key={i} className="shelf-book">
              {/* Cover image */}
              <div className="shelf-book-cover">
                {book.cover ? (
                  <img src={book.cover} alt={`Cover of ${book.title}`} />
                ) : (
                  <div className="shelf-book-cover-placeholder">
                    <span>{book.title.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Book info */}
              <div className="shelf-book-info">
                <div className="shelf-book-title">{book.title}</div>
                <div className="shelf-book-author">{book.author}</div>
                {book.note && (
                  <div className="shelf-book-note">{book.note}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}