package com.littlelibrary.service;

import com.littlelibrary.model.Book;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoogleBooksService {
    
    @Value("${google.books.api.key:}")
    private String apiKey;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public GoogleBooksService() {
        this.webClient = WebClient.builder()
            .baseUrl("https://www.googleapis.com/books/v1")
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Search Google Books by title/text and return a list of parsed Book models.
     */
    public List<Book> searchBooksByTitle(String titleQuery) {
        try {
            String q = titleQuery.replace("\n", " ").trim();
            if (q.length() > 200) {
                q = q.substring(0, 200);
            }
            String url = "/volumes?q=intitle:" + q.replace(" ", "+");
            if (!apiKey.isEmpty()) {
                url += "&key=" + apiKey;
            }
            Mono<String> response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class);
            String responseBody = response.block();
            JsonNode root = objectMapper.readTree(responseBody);
            List<Book> results = new ArrayList<>();
            if (root.has("items") && root.get("items").isArray()) {
                for (JsonNode item : root.get("items")) {
                    results.add(parseBookFromGoogleBooks(item));
                }
            }
            return results;
        } catch (Exception e) {
            throw new RuntimeException("Error searching books by title from Google Books API", e);
        }
    }
    
    public Book getBookByIsbn(String isbn) {
        try {
            String url = "/volumes?q=isbn:" + isbn;
            if (!apiKey.isEmpty()) {
                url += "&key=" + apiKey;
            }
            
            Mono<String> response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class);
            
            String responseBody = response.block();
            JsonNode root = objectMapper.readTree(responseBody);
            
            if (root.get("totalItems").asInt() > 0) {
                JsonNode item = root.get("items").get(0);
                return parseBookFromGoogleBooks(item);
            }
            
            return null;
        } catch (Exception e) {
            throw new RuntimeException("Error fetching book from Google Books API", e);
        }
    }
    
    public String searchByText(String extractedText) {
        try {
            // Extract potential title and author from OCR text
            String searchQuery = extractedText.replaceAll("\\n", " ").trim();
            if (searchQuery.length() > 100) {
                searchQuery = searchQuery.substring(0, 100);
            }
            
            String url = "/volumes?q=" + searchQuery.replace(" ", "+");
            if (!apiKey.isEmpty()) {
                url += "&key=" + apiKey;
            }
            
            Mono<String> response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class);
            
            String responseBody = response.block();
            JsonNode root = objectMapper.readTree(responseBody);
            
            if (root.get("totalItems").asInt() > 0) {
                JsonNode item = root.get("items").get(0);
                JsonNode volumeInfo = item.get("volumeInfo");
                
                // Try to get ISBN from the first result
                JsonNode industryIdentifiers = volumeInfo.get("industryIdentifiers");
                if (industryIdentifiers != null && industryIdentifiers.isArray()) {
                    for (JsonNode identifier : industryIdentifiers) {
                        String type = identifier.get("type").asText();
                        if ("ISBN_13".equals(type) || "ISBN_10".equals(type)) {
                            return identifier.get("identifier").asText();
                        }
                    }
                }
            }
            
            return null;
        } catch (Exception e) {
            throw new RuntimeException("Error searching book by text", e);
        }
    }
    
    private Book parseBookFromGoogleBooks(JsonNode item) {
        JsonNode volumeInfo = item.get("volumeInfo");
        
        Book book = new Book();
        book.setGoogleBooksId(item.get("id").asText());
        book.setTitle(volumeInfo.get("title").asText());
        
        // Author
        JsonNode authors = volumeInfo.get("authors");
        if (authors != null && authors.isArray() && authors.size() > 0) {
            book.setAuthor(authors.get(0).asText());
        }
        
        // ISBN
        JsonNode industryIdentifiers = volumeInfo.get("industryIdentifiers");
        if (industryIdentifiers != null && industryIdentifiers.isArray()) {
            for (JsonNode identifier : industryIdentifiers) {
                String type = identifier.get("type").asText();
                if ("ISBN_13".equals(type)) {
                    book.setIsbn(identifier.get("identifier").asText());
                    break;
                } else if ("ISBN_10".equals(type) && book.getIsbn() == null) {
                    book.setIsbn(identifier.get("identifier").asText());
                }
            }
        }
        
        // Description
        if (volumeInfo.has("description")) {
            book.setDescription(volumeInfo.get("description").asText());
        }
        
        // Publisher
        if (volumeInfo.has("publisher")) {
            book.setPublisher(volumeInfo.get("publisher").asText());
        }
        
        // Publication Year
        if (volumeInfo.has("publishedDate")) {
            String publishedDate = volumeInfo.get("publishedDate").asText();
            try {
                book.setPublicationYear(Integer.parseInt(publishedDate.substring(0, 4)));
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }
        
        // Page Count
        if (volumeInfo.has("pageCount")) {
            book.setPageCount(volumeInfo.get("pageCount").asInt());
        }
        
        // Cover Image
        JsonNode imageLinks = volumeInfo.get("imageLinks");
        if (imageLinks != null) {
            if (imageLinks.has("thumbnail")) {
                book.setCoverImageUrl(imageLinks.get("thumbnail").asText());
            } else if (imageLinks.has("smallThumbnail")) {
                book.setCoverImageUrl(imageLinks.get("smallThumbnail").asText());
            }
        }
        
        // Categories (Genre)
        JsonNode categories = volumeInfo.get("categories");
        if (categories != null && categories.isArray() && categories.size() > 0) {
            book.setGenre(categories.get(0).asText());
        }
        
        return book;
    }
}
