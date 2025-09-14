package com.littlelibrary.service;

import com.littlelibrary.dto.BookDTO;
import com.littlelibrary.dto.ScanRequest;
import com.littlelibrary.dto.AIRecommendationResponse;
import com.littlelibrary.model.Book;
import com.littlelibrary.model.Library;
import com.littlelibrary.model.LibraryBook;
import com.littlelibrary.repository.BookRepository;
import com.littlelibrary.repository.LibraryRepository;
import com.littlelibrary.repository.LibraryBookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookService {
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private LibraryRepository libraryRepository;
    
    @Autowired
    private LibraryBookRepository libraryBookRepository;
    
    @Autowired
    private GoogleBooksService googleBooksService;
    
    @Autowired
    private OpenAIService openAIService;
    
    @Autowired
    private OCRService ocrService;
    
    public List<BookDTO> getUserLibraryBooks(Long userId, String filter) {
        List<Library> libraries = libraryRepository.findByUserId(userId);
        
        return libraries.stream()
            .flatMap(library -> {
                List<LibraryBook> libraryBooks;
                if ("favorites".equals(filter)) {
                    libraryBooks = libraryBookRepository.findByLibraryIdAndIsFavorite(library.getId(), true);
                } else if (filter != null && filter.startsWith("genre:")) {
                    String genre = filter.substring(6);
                    libraryBooks = libraryBookRepository.findByLibraryIdAndGenreShelf(library.getId(), genre);
                } else if (filter != null && filter.startsWith("age:")) {
                    String age = filter.substring(4);
                    libraryBooks = libraryBookRepository.findByLibraryIdAndAgeShelf(library.getId(), age);
                } else {
                    libraryBooks = libraryBookRepository.findByLibraryIdOrderByShelfPosition(library.getId());
                }
                return libraryBooks.stream();
            })
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public BookDTO scanAndIdentifyBook(ScanRequest scanRequest, Long userId) {
        String isbn = null;
        
        if ("barcode".equals(scanRequest.getScanType())) {
            isbn = ocrService.extractBarcodeFromImage(scanRequest.getImageBase64());
        } else if ("cover".equals(scanRequest.getScanType())) {
            String extractedText = ocrService.extractTextFromImage(scanRequest.getImageBase64());
            isbn = googleBooksService.searchByText(extractedText);
        } else if (scanRequest.getIsbn() != null) {
            isbn = scanRequest.getIsbn();
        }
        
        if (isbn == null) {
            throw new RuntimeException("Could not identify book from scan");
        }
        
        // Check if book already exists in database
        Optional<Book> existingBook = bookRepository.findByIsbn(isbn);
        Book book;
        
        if (existingBook.isPresent()) {
            book = existingBook.get();
        } else {
            // Fetch book details from Google Books API
            book = googleBooksService.getBookByIsbn(isbn);
            if (book == null) {
                throw new RuntimeException("Book not found in Google Books");
            }
            book = bookRepository.save(book);
        }
        
        return convertToDTO(book);
    }
    
    public BookDTO addBookToLibrary(Long bookId, Long userId, String genreShelf, String ageShelf) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        // Get user's default library (create if doesn't exist)
        List<Library> libraries = libraryRepository.findByUserId(userId);
        Library library;
        if (libraries.isEmpty()) {
            library = new Library("My Library", null); // User will be set by security context
            library = libraryRepository.save(library);
        } else {
            library = libraries.get(0);
        }
        
        // Check if book already exists in library
        Optional<LibraryBook> existing = libraryBookRepository.findByLibraryIdAndBookId(library.getId(), bookId);
        if (existing.isPresent()) {
            throw new RuntimeException("Book already exists in library");
        }
        
        // Add book to library
        LibraryBook libraryBook = new LibraryBook(library, book);
        libraryBook.setGenreShelf(genreShelf != null ? genreShelf : book.getGenre());
        libraryBook.setAgeShelf(ageShelf);
        
        // Set shelf position (last position + 1)
        List<LibraryBook> existingBooks = libraryBookRepository.findByLibraryIdOrderByShelfPosition(library.getId());
        int nextPosition = existingBooks.size() + 1;
        libraryBook.setShelfPosition(nextPosition);
        
        libraryBook = libraryBookRepository.save(libraryBook);
        
        return convertToDTO(libraryBook);
    }
    
    public boolean checkForDuplicate(String isbn, Long userId) {
        return libraryBookRepository.existsByUserIdAndBookIsbn(userId, isbn);
    }
    
    public AIRecommendationResponse getAIRecommendations(Long bookId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        return openAIService.getBookRecommendations(book);
    }
    
    public List<BookDTO> searchBooks(String query) {
        List<Book> books = bookRepository.searchBooks(query);
        return books.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private BookDTO convertToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setIsbn(book.getIsbn());
        dto.setDescription(book.getDescription());
        dto.setGenre(book.getGenre());
        dto.setAgeRangeMin(book.getAgeRangeMin());
        dto.setAgeRangeMax(book.getAgeRangeMax());
        dto.setCoverImageUrl(book.getCoverImageUrl());
        dto.setPublisher(book.getPublisher());
        dto.setPublicationYear(book.getPublicationYear());
        dto.setPageCount(book.getPageCount());
        dto.setGoogleBooksId(book.getGoogleBooksId());
        return dto;
    }
    
    private BookDTO convertToDTO(LibraryBook libraryBook) {
        BookDTO dto = convertToDTO(libraryBook.getBook());
        dto.setDateAdded(libraryBook.getDateAdded());
        dto.setIsFavorite(libraryBook.getIsFavorite());
        dto.setPersonalRating(libraryBook.getPersonalRating());
        dto.setPersonalNotes(libraryBook.getPersonalNotes());
        dto.setShelfPosition(libraryBook.getShelfPosition());
        dto.setGenreShelf(libraryBook.getGenreShelf());
        dto.setAgeShelf(libraryBook.getAgeShelf());
        return dto;
    }
}
