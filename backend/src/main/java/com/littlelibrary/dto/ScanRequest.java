package com.littlelibrary.dto;

public class ScanRequest {
    private String imageBase64;
    private String isbn;
    private String scanType; // "barcode" or "cover"
    
    // Constructors
    public ScanRequest() {}
    
    public ScanRequest(String imageBase64, String scanType) {
        this.imageBase64 = imageBase64;
        this.scanType = scanType;
    }
    
    // Getters and Setters
    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
    
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    
    public String getScanType() { return scanType; }
    public void setScanType(String scanType) { this.scanType = scanType; }
}
