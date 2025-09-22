package com.littlelibrary.controller;

import com.littlelibrary.dto.BookDTO;
import com.littlelibrary.dto.ScanRequest;
import com.littlelibrary.dto.AIRecommendationResponse;
import com.littlelibrary.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {
    
    @Autowired
    private BookService bookService;
    
    @GetMapping
    public ResponseEntity<List<BookDTO>> getUserLibrary(
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) String search) {
        
        // In a real app, get userId from JWT token
        Long userId = 1L; // Placeholder
        
        List<BookDTO> books;
        if (search != null && !search.trim().isEmpty()) {
            books = bookService.searchBooks(search);
        } else {
            books = bookService.getUserLibraryBooks(userId, filter);
        }
        
        return ResponseEntity.ok(books);
    }
    
    @PostMapping("/scan")
    public ResponseEntity<BookDTO> scanBook(@RequestBody ScanRequest scanRequest) {
        // In a real app, get userId from JWT token
        Long userId = 1L; // Placeholder
        
        BookDTO book = bookService.scanAndIdentifyBook(scanRequest, userId);
        return ResponseEntity.ok(book);
    }
    
    @PostMapping("/{bookId}/add-to-library")
    public ResponseEntity<BookDTO> addToLibrary(
            @PathVariable Long bookId,
            @RequestBody Map<String, String> request) {
        
        // In a real app, get userId from JWT token
        Long userId = 1L; // Placeholder
        
        String genreShelf = request.get("genreShelf");
        String ageShelf = request.get("ageShelf");
        
        BookDTO book = bookService.addBookToLibrary(bookId, userId, genreShelf, ageShelf);
        return ResponseEntity.ok(book);
    }
    
    @PostMapping("/check-duplicate")
    public ResponseEntity<Map<String, Boolean>> checkDuplicate(@RequestBody Map<String, String> request) {
        // In a real app, get userId from JWT token
        Long userId = 1L; // Placeholder
        
        String isbn = request.get("isbn");
        boolean isDuplicate = bookService.checkForDuplicate(isbn, userId);
        
        return ResponseEntity.ok(Map.of("isDuplicate", isDuplicate));
    }
    
    @GetMapping("/{bookId}/recommendations")
    public ResponseEntity<AIRecommendationResponse> getRecommendations(@PathVariable Long bookId) {
        AIRecommendationResponse recommendations = bookService.getAIRecommendations(bookId);
        return ResponseEntity.ok(recommendations);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<BookDTO>> searchBooks(@RequestParam String query) {
        List<BookDTO> books = bookService.searchBooks(query);
        return ResponseEntity.ok(books);
    }
    
    @GetMapping("/lookup")
    public ResponseEntity<List<BookDTO>> lookupBooks(
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false, name = "title") String title) {
        if ((isbn == null || isbn.isBlank()) && (title == null || title.isBlank())) {
            return ResponseEntity.badRequest().build();
        }
        List<BookDTO> books = bookService.lookupBooks(isbn, title);
        return ResponseEntity.ok(books);
    }
}
