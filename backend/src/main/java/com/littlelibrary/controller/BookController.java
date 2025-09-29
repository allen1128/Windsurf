package com.littlelibrary.controller;

import com.littlelibrary.dto.BookDTO;
import com.littlelibrary.dto.AddToLibraryRequest;
import com.littlelibrary.dto.ScanRequest;
import com.littlelibrary.dto.AIRecommendationResponse;
import com.littlelibrary.dto.RecommendationQuery;
import com.littlelibrary.service.BookService;
import java.util.stream.Collectors;
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

    @PostMapping("/add-to-library")
    public ResponseEntity<BookDTO> addToLibraryByPayload(@RequestBody AddToLibraryRequest request) {
        // In a real app, get userId from JWT token
        Long userId = 1L; // Placeholder
        BookDTO result = bookService.addBookToLibrary(request, userId);
        return ResponseEntity.ok(result);
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

    /**
     * Query-param variant to disambiguate id vs isbn.
     * Example:
     *   /api/books/recommendations?by=id&value=123
     *   /api/books/recommendations?by=isbn&value=9780439708180
     */
    @GetMapping("/recommendations")
    public ResponseEntity<AIRecommendationResponse> getRecommendationsBy(
            @RequestParam(name = "by", required = false) String by,
            @RequestParam(name = "value", required = false) String value,
            @RequestParam(name = "title", required = false) String title) {
        // Prefer explicit id/isbn routing when provided
        if (by != null && !by.isBlank() && value != null && !value.isBlank()) {
            if ("id".equalsIgnoreCase(by)) {
                try {
                    Long id = Long.parseLong(value);
                    return ResponseEntity.ok(bookService.getAIRecommendations(id));
                } catch (NumberFormatException ex) {
                    // fall through to title if present
                }
            } else if ("isbn".equalsIgnoreCase(by)) {
                return ResponseEntity.ok(bookService.getAIRecommendationsByIsbn(value));
            }
        }

        // Backend-side fallback by title (optional)
        if (title != null && !title.isBlank()) {
            List<BookDTO> found = bookService.lookupBooks(null, title);
            if (found != null && !found.isEmpty() && found.get(0).getIsbn() != null) {
                return ResponseEntity.ok(bookService.getAIRecommendationsByIsbn(found.get(0).getIsbn()));
            }
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.badRequest().build();
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

    /**
     * Remove a book from the user's library by internal book id.
     * Idempotent: returns 204 whether or not a link existed.
     */
    @DeleteMapping("/{bookId}/remove-from-library")
    public ResponseEntity<Void> removeFromLibrary(@PathVariable Long bookId) {
        Long userId = 1L; // Placeholder until JWT auth is added
        bookService.removeBookFromLibrary(userId, bookId);
        return ResponseEntity.noContent().build();
    }

    

    /**
     * Object-based variant: frontend sends an object with optional fields (bookId, isbn, title),
     * and backend decides how to compute recommendations.
     */
    @PostMapping("/recommendations/query")
    public ResponseEntity<AIRecommendationResponse> getRecommendationsQuery(@RequestBody RecommendationQuery query) {
        if (query == null) {
            return ResponseEntity.badRequest().build();
        }
        AIRecommendationResponse resp = null;

        // 1) Compute AI signals via id or isbn if available
        if (query.getBookId() != null) {
            resp = bookService.getAIRecommendations(query.getBookId());
        } else if (query.getIsbn() != null && !query.getIsbn().isBlank()) {
            resp = bookService.getAIRecommendationsByIsbn(query.getIsbn());
        } else {
            resp = new AIRecommendationResponse();
        }

        // Resolve source ISBN for deduplication (prefer explicit ISBN, else lookup by id)
        // 2) Populate similarBooks using title (server-side fallback)
        if (query.getTitle() != null && !query.getTitle().isBlank()) {
            List<BookDTO> found = bookService.lookupBooks(null, query.getTitle());
            if (found != null && !found.isEmpty()) {
                final String srcIsbnFinal = query.getIsbn() != null ? query.getIsbn().replaceAll("[-\\s]", "") : null;

                java.util.Set<String> seenIsbn = new java.util.HashSet<>();
                java.util.List<BookDTO> out = new java.util.ArrayList<>();
                for (BookDTO b : found) {
                    // Must have a valid image
                    if (!hasValidImage(b.getCoverImageUrl())) continue;

                    // Normalize ISBN for dedupe and source exclusion
                    String bIsbn = b.getIsbn() != null ? b.getIsbn().replaceAll("[-\\s]", "") : null;
                    if (bIsbn != null) {
                        if (srcIsbnFinal != null && srcIsbnFinal.equals(bIsbn)) continue; // exclude source
                        if (seenIsbn.contains(bIsbn)) continue; // dedupe by isbn only
                        seenIsbn.add(bIsbn);
                    }

                    out.add(b);
                    if (out.size() >= 12) break;
                }
                resp.setSimilarBooks(out);
            }
        }

        return ResponseEntity.ok(resp);
    }
    
    private boolean hasValidImage(String url) {
        if (url == null || url.isBlank()) return false;
        String u = url.trim().toLowerCase();
        return u.startsWith("http://") || u.startsWith("https://");
    }

    
}