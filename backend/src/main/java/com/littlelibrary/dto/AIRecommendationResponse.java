package com.littlelibrary.dto;

import java.util.List;

public class AIRecommendationResponse {
    private String ageRecommendation;
    private Integer suggestedMinAge;
    private Integer suggestedMaxAge;
    private String reasoning;
    private List<BookDTO> similarBooks;
    private List<String> themes;
    private String readingLevel;
    
    // Constructors
    public AIRecommendationResponse() {}
    
    // Getters and Setters
    public String getAgeRecommendation() { return ageRecommendation; }
    public void setAgeRecommendation(String ageRecommendation) { this.ageRecommendation = ageRecommendation; }
    
    public Integer getSuggestedMinAge() { return suggestedMinAge; }
    public void setSuggestedMinAge(Integer suggestedMinAge) { this.suggestedMinAge = suggestedMinAge; }
    
    public Integer getSuggestedMaxAge() { return suggestedMaxAge; }
    public void setSuggestedMaxAge(Integer suggestedMaxAge) { this.suggestedMaxAge = suggestedMaxAge; }
    
    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }
    
    public List<BookDTO> getSimilarBooks() { return similarBooks; }
    public void setSimilarBooks(List<BookDTO> similarBooks) { this.similarBooks = similarBooks; }
    
    public List<String> getThemes() { return themes; }
    public void setThemes(List<String> themes) { this.themes = themes; }
    
    public String getReadingLevel() { return readingLevel; }
    public void setReadingLevel(String readingLevel) { this.readingLevel = readingLevel; }
}
