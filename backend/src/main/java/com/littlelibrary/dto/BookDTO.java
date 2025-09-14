package com.littlelibrary.dto;

import java.time.LocalDateTime;

public class BookDTO {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String description;
    private String genre;
    private Integer ageRangeMin;
    private Integer ageRangeMax;
    private String coverImageUrl;
    private String publisher;
    private Integer publicationYear;
    private Integer pageCount;
    private String googleBooksId;
    private LocalDateTime dateAdded;
    private Boolean isFavorite;
    private Integer personalRating;
    private String personalNotes;
    private Integer shelfPosition;
    private String genreShelf;
    private String ageShelf;
    
    // Constructors
    public BookDTO() {}
    
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
    
    public LocalDateTime getDateAdded() { return dateAdded; }
    public void setDateAdded(LocalDateTime dateAdded) { this.dateAdded = dateAdded; }
    
    public Boolean getIsFavorite() { return isFavorite; }
    public void setIsFavorite(Boolean isFavorite) { this.isFavorite = isFavorite; }
    
    public Integer getPersonalRating() { return personalRating; }
    public void setPersonalRating(Integer personalRating) { this.personalRating = personalRating; }
    
    public String getPersonalNotes() { return personalNotes; }
    public void setPersonalNotes(String personalNotes) { this.personalNotes = personalNotes; }
    
    public Integer getShelfPosition() { return shelfPosition; }
    public void setShelfPosition(Integer shelfPosition) { this.shelfPosition = shelfPosition; }
    
    public String getGenreShelf() { return genreShelf; }
    public void setGenreShelf(String genreShelf) { this.genreShelf = genreShelf; }
    
    public String getAgeShelf() { return ageShelf; }
    public void setAgeShelf(String ageShelf) { this.ageShelf = ageShelf; }
}
