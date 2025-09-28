export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  ageMin?: number;
  ageMax?: number;
  coverUrl?: string;
  // Optional fields for details
  isbn?: string;
  description?: string;
  publisher?: string;
  publicationYear?: number;
  pageCount?: number;
  genreShelf?: string;
  ageShelf?: string;
};
