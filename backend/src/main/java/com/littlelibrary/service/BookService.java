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
import java.util.ArrayList;
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
        // Mock implementation - return empty list for testing
        return new ArrayList<>();
    }
    
    public BookDTO scanAndIdentifyBook(ScanRequest scanRequest, Long userId) {
        try {
            String extractedText = "";
            
            // Handle both new format (type/data) and legacy format (scanType/isbn)
            if ("isbn".equals(scanRequest.getType()) || "isbn".equals(scanRequest.getScanType())) {
                extractedText = scanRequest.getData() != null ? scanRequest.getData() : 
                               (scanRequest.getIsbn() != null ? scanRequest.getIsbn() : "9780439708180");
            } else if ("cover".equals(scanRequest.getType()) || "cover".equals(scanRequest.getScanType())) {
                // Mock OCR extraction for demo
                extractedText = "9780439708180"; // Default to Harry Potter ISBN
            }
            
            // Create mock book data for testing
            BookDTO book = new BookDTO();
            book.setTitle("Harry Potter and the Sorcerer's Stone");
            book.setAuthor("J.K. Rowling");
            book.setIsbn(extractedText);
            book.setPublisher("Scholastic");
            book.setPublicationYear(1997);
            book.setPageCount(309);
            book.setGenre("Fantasy");
            book.setDescription("A young wizard's journey begins at Hogwarts School of Witchcraft and Wizardry.");
            book.setCoverImageUrl("https://covers.openlibrary.org/b/isbn/" + extractedText + "-L.jpg");
            book.setAgeRangeMin(8);
            book.setAgeRangeMax(12);
            
            // Check for duplicates
            boolean isDuplicate = checkForDuplicate(book.getIsbn(), userId);
            book.setIsDuplicate(isDuplicate);
            
            return book;
        } catch (Exception e) {
            throw new RuntimeException("Failed to scan and identify book", e);
        }
    }
    
    public BookDTO addBookToLibrary(Long bookId, Long userId, String genreShelf, String ageShelf) {
        // Create mock book for testing since we don't have books in database yet
        BookDTO book = new BookDTO();
        book.setId(bookId);
        book.setTitle("Harry Potter and the Sorcerer's Stone");
        book.setAuthor("J.K. Rowling");
        book.setIsbn("9780439708180");
        book.setGenre("Fantasy");
        book.setGenreShelf(genreShelf);
        book.setAgeShelf(ageShelf);
        book.setDescription("A young wizard's journey begins at Hogwarts School of Witchcraft and Wizardry.");
        book.setCoverImageUrl("https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg");
        book.setPublisher("Scholastic");
        book.setPublicationYear(1997);
        book.setPageCount(309);
        book.setAgeRangeMin(8);
        book.setAgeRangeMax(12);
        book.setIsFavorite(false);
        book.setPersonalRating(0);
        
        return book;
    }
    
    public boolean checkForDuplicate(String isbn, Long userId) {
        // Mock implementation - always return false for testing
        return false;
    }
    
    public List<BookDTO> searchBooks(String query) {
        // Use Google Books to search by title/text
        List<com.littlelibrary.model.Book> results = googleBooksService.searchBooksByTitle(query);
        return results.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Lookup books by either ISBN (preferred) or title.
     * If ISBN is provided, at most one result is returned.
     */
    public List<BookDTO> lookupBooks(String isbn, String title) {
        List<BookDTO> out = new ArrayList<>();
        if (isbn != null && !isbn.trim().isEmpty()) {
            com.littlelibrary.model.Book b = googleBooksService.getBookByIsbn(isbn.trim());
            if (b != null) {
                out.add(toDTO(b));
            }
            return out;
        }
        if (title != null && !title.trim().isEmpty()) {
            List<com.littlelibrary.model.Book> results = googleBooksService.searchBooksByTitle(title.trim());
            for (com.littlelibrary.model.Book model : results) {
                out.add(toDTO(model));
            }
        }
        return out;
    }

    private BookDTO toDTO(com.littlelibrary.model.Book b) {
        BookDTO dto = new BookDTO();
        dto.setTitle(b.getTitle());
        dto.setAuthor(b.getAuthor());
        dto.setIsbn(b.getIsbn());
        dto.setDescription(b.getDescription());
        dto.setGenre(b.getGenre());
        dto.setCoverImageUrl(b.getCoverImageUrl());
        dto.setPublisher(b.getPublisher());
        dto.setPublicationYear(b.getPublicationYear());
        dto.setPageCount(b.getPageCount());
        dto.setGoogleBooksId(b.getGoogleBooksId());
        return dto;
    }
    
    public AIRecommendationResponse getAIRecommendations(Long bookId) {
        // Mock AI recommendation for testing
        AIRecommendationResponse response = new AIRecommendationResponse();
        response.setAgeRecommendation("8-12 years");
        response.setSuggestedMinAge(8);
        response.setSuggestedMaxAge(12);
        response.setReadingLevel("Elementary");
        response.setReasoning("Great introduction to fantasy literature for children. Teaches about friendship, courage, and perseverance.");
        return response;
    }
    
}
