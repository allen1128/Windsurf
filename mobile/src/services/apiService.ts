import axios, {AxiosInstance} from 'axios';

const BASE_URL = 'http://localhost:8080/api';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  description?: string;
  genre?: string;
  ageRangeMin?: number;
  ageRangeMax?: number;
  coverImageUrl?: string;
  publisher?: string;
  publicationYear?: number;
  pageCount?: number;
  dateAdded?: string;
  isFavorite?: boolean;
  personalRating?: number;
  personalNotes?: string;
  shelfPosition?: number;
  genreShelf?: string;
  ageShelf?: string;
}

interface ScanRequest {
  imageBase64: string;
  scanType: 'barcode' | 'cover';
  isbn?: string;
}

interface AIRecommendation {
  ageRecommendation: string;
  suggestedMinAge: number;
  suggestedMaxAge: number;
  reasoning: string;
  similarBooks: Book[];
  themes: string[];
  readingLevel: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post('/auth/login', {email, password});
    return response.data;
  }

  async register(firstName: string, lastName: string, email: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  // Book endpoints
  async getLibraryBooks(filter?: string): Promise<Book[]> {
    const params = filter ? {filter} : {};
    const response = await this.api.get('/books', {params});
    return response.data;
  }

  async scanBook(scanRequest: ScanRequest): Promise<Book> {
    const response = await this.api.post('/books/scan', scanRequest);
    return response.data;
  }

  async addBookToLibrary(bookId: number, genreShelf?: string, ageShelf?: string): Promise<Book> {
    const response = await this.api.post(`/books/${bookId}/add-to-library`, {
      genreShelf,
      ageShelf,
    });
    return response.data;
  }

  async checkDuplicate(isbn: string): Promise<{isDuplicate: boolean}> {
    const response = await this.api.post('/books/check-duplicate', {isbn});
    return response.data;
  }

  async getBookRecommendations(bookId: number): Promise<AIRecommendation> {
    const response = await this.api.get(`/books/${bookId}/recommendations`);
    return response.data;
  }

  async searchBooks(query: string): Promise<Book[]> {
    const response = await this.api.get('/books/search', {params: {query}});
    return response.data;
  }
}

export const apiService = new ApiService();
export type {Book, ScanRequest, AIRecommendation};
