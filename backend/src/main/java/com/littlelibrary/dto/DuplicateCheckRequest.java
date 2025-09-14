package com.littlelibrary.dto;

public class DuplicateCheckRequest {
    private String isbn;
    
    public DuplicateCheckRequest() {}
    
    public String getIsbn() {
        return isbn;
    }
    
    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }
}
