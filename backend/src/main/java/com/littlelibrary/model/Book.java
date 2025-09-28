package com.littlelibrary.model;

import jakarta.persistence.*;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "books")
public class Book {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 200)
    private String title;
    
    @Size(max = 100)
    private String author;
    
    @Column(unique = true)
    private String isbn;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Size(max = 50)
    private String genre;
    
    @Column(name = "age_range_min")
    private Integer ageRangeMin;
    
    @Column(name = "age_range_max")
    private Integer ageRangeMax;
    
    @Column(name = "cover_image_url")
    private String coverImageUrl;
    
    @Column(name = "publisher")
    private String publisher;
    
    @Column(name = "publication_year")
    private Integer publicationYear;
    
    @Column(name = "page_count")
    private Integer pageCount;
    
    @Column(name = "google_books_id")
    private String googleBooksId;
    
    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LibraryBook> libraryBooks = new ArrayList<>();
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public Book() {}
    
    public Book(String title, String author, String isbn) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    
    public Integer getAgeRangeMin() { return ageRangeMin; }
    public void setAgeRangeMin(Integer ageRangeMin) { this.ageRangeMin = ageRangeMin; }
    
    public Integer getAgeRangeMax() { return ageRangeMax; }
    public void setAgeRangeMax(Integer ageRangeMax) { this.ageRangeMax = ageRangeMax; }
    
    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    
    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }
    
    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }
    
    public String getGoogleBooksId() { return googleBooksId; }
    public void setGoogleBooksId(String googleBooksId) { this.googleBooksId = googleBooksId; }
    
    public List<LibraryBook> getLibraryBooks() { return libraryBooks; }
    public void setLibraryBooks(List<LibraryBook> libraryBooks) { this.libraryBooks = libraryBooks; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
