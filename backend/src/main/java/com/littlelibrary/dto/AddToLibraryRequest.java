package com.littlelibrary.dto;

public class AddToLibraryRequest {
    private String genreShelf;
    private String ageShelf;
    
    public AddToLibraryRequest() {}
    
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
