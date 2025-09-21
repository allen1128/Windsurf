export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  ageMin?: number;
  ageMax?: number;
  coverUrl?: string;
};
