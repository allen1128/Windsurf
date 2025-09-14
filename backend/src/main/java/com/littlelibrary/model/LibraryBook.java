package com.littlelibrary.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "library_books")
public class LibraryBook {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_id")
    private Library library;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book;
    
    @Column(name = "shelf_position")
    private Integer shelfPosition;
    
    @Column(name = "genre_shelf")
    private String genreShelf;
    
    @Column(name = "age_shelf")
    private String ageShelf;
    
    @Column(name = "is_favorite")
    private Boolean isFavorite = false;
    
    @Column(name = "personal_rating")
    private Integer personalRating;
    
    @Column(name = "personal_notes")
    private String personalNotes;
    
    @Column(name = "date_added")
    private LocalDateTime dateAdded;
    
    @Column(name = "last_read_date")
    private LocalDateTime lastReadDate;
    
    @PrePersist
    protected void onCreate() {
        dateAdded = LocalDateTime.now();
    }
    
    // Constructors
    public LibraryBook() {}
    
    public LibraryBook(Library library, Book book) {
        this.library = library;
        this.book = book;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Library getLibrary() { return library; }
    public void setLibrary(Library library) { this.library = library; }
    
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    
    public Integer getShelfPosition() { return shelfPosition; }
    public void setShelfPosition(Integer shelfPosition) { this.shelfPosition = shelfPosition; }
    
    public String getGenreShelf() { return genreShelf; }
    public void setGenreShelf(String genreShelf) { this.genreShelf = genreShelf; }
    
    public String getAgeShelf() { return ageShelf; }
    public void setAgeShelf(String ageShelf) { this.ageShelf = ageShelf; }
    
    public Boolean getIsFavorite() { return isFavorite; }
    public void setIsFavorite(Boolean isFavorite) { this.isFavorite = isFavorite; }
    
    public Integer getPersonalRating() { return personalRating; }
    public void setPersonalRating(Integer personalRating) { this.personalRating = personalRating; }
    
    public String getPersonalNotes() { return personalNotes; }
    public void setPersonalNotes(String personalNotes) { this.personalNotes = personalNotes; }
    
    public LocalDateTime getDateAdded() { return dateAdded; }
    public void setDateAdded(LocalDateTime dateAdded) { this.dateAdded = dateAdded; }
    
    public LocalDateTime getLastReadDate() { return lastReadDate; }
    public void setLastReadDate(LocalDateTime lastReadDate) { this.lastReadDate = lastReadDate; }
}
