package com.littlelibrary.dto;

public class RecommendationQuery {
    private Long bookId;
    private String isbn;
    private String title;
    private String description;
    private String author;
    private String genre;
    private String publisher;
    private Integer publicationYear;
    private Integer pageCount;
    private String genreShelf;
    private String ageShelf;

    public RecommendationQuery() {}

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public Integer getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(Integer publicationYear) {
        this.publicationYear = publicationYear;
    }

    public Integer getPageCount() {
        return pageCount;
    }

    public void setPageCount(Integer pageCount) {
        this.pageCount = pageCount;
    }

    public String getGenreShelf() {
        return genreShelf;
    }

    public void setGenreShelf(String genreShelf) {
        this.genreShelf = genreShelf;
    }

    public String getAgeShelf() {
        return ageShelf;
    }

    public void setAgeShelf(String ageShelf) {
        this.ageShelf = ageShelf;
    }
}
