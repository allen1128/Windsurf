import { Platform } from 'react-native';

export type BackendBookDTO = {
  id?: number | string | null;
  title?: string;
  author?: string;
  genre?: string;
  description?: string;
  coverUrl?: string;
  isbn10?: string;
  isbn13?: string;
};

// In a real app, point this to your backend base URL via env or config
const BASE_URL = Platform.select({ ios: 'http://localhost:8080', android: 'http://10.0.2.2:8080', default: 'http://localhost:8080' });

export async function lookupByIsbn(isbn: string): Promise<BackendBookDTO[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/books/search?isbn=${encodeURIComponent(isbn)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as BackendBookDTO[];
  } catch (e) {
    console.warn('lookupByIsbn failed, returning empty list', e);
    return [];
  }
}

export async function lookupByTitle(title: string): Promise<BackendBookDTO[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/books/search?title=${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as BackendBookDTO[];
  } catch (e) {
    console.warn('lookupByTitle failed, returning empty list', e);
    return [];
  }
}

export async function importBook(book: BackendBookDTO): Promise<BackendBookDTO> {
  try {
    const res = await fetch(`${BASE_URL}/api/books/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as BackendBookDTO;
  } catch (e) {
    console.warn('importBook failed, returning book with mock id', e);
    return { ...book, id: book.id ?? Date.now() };
  }
}

export async function addToLibrary(book: BackendBookDTO, shelves: string[]): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/api/library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book, shelves }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.warn('addToLibrary failed (mock no-op)', e);
  }
}

/**
 * Remove a book from the user's library by internal book id.
 */
export async function removeFromLibraryById(bookId: number | string): Promise<void> {
  const url = `${BASE_URL}/api/books/${encodeURIComponent(String(bookId))}/remove-from-library`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    let msg = '';
    try { msg = await res.text(); } catch {}
    throw new Error(msg || `Remove by id failed (${res.status})`);
  }
}

 
