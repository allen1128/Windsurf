package com.littlelibrary.dto;

public class ScanRequest {
    private String type; // "isbn" or "cover"
    private String data; // ISBN string or base64 image data
    
    // Legacy fields for backward compatibility
    private String imageBase64;
    private String isbn;
    private String scanType;
    
    // Constructors
    public ScanRequest() {}
    
    public ScanRequest(String type, String data) {
        this.type = type;
        this.data = data;
    }
    
    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
    
    // Legacy getters/setters
    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
    
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    
    public String getScanType() { return scanType != null ? scanType : type; }
    public void setScanType(String scanType) { this.scanType = scanType; }
}
