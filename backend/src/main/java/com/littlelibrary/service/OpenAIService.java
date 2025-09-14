package com.littlelibrary.service;

import com.littlelibrary.dto.AIRecommendationResponse;
import com.littlelibrary.dto.BookDTO;
import com.littlelibrary.model.Book;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class OpenAIService {
    
    @Value("${openai.api.key:}")
    private String apiKey;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public OpenAIService() {
        this.webClient = WebClient.builder()
            .baseUrl("https://api.openai.com/v1")
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    public AIRecommendationResponse getBookRecommendations(Book book) {
        try {
            String prompt = buildPrompt(book);
            
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", "gpt-3.5-turbo");
            requestBody.put("max_tokens", 500);
            requestBody.put("temperature", 0.7);
            
            ObjectNode message = objectMapper.createObjectNode();
            message.put("role", "user");
            message.put("content", prompt);
            requestBody.set("messages", objectMapper.createArrayNode().add(message));
            
            Mono<String> response = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class);
            
            String responseBody = response.block();
            return parseOpenAIResponse(responseBody, book);
            
        } catch (Exception e) {
            // Return a fallback response if OpenAI is not available
            return createFallbackResponse(book);
        }
    }
    
    private String buildPrompt(Book book) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Analyze this children's book and provide age recommendations:\n\n");
        prompt.append("Title: ").append(book.getTitle()).append("\n");
        prompt.append("Author: ").append(book.getAuthor()).append("\n");
        
        if (book.getDescription() != null) {
            prompt.append("Description: ").append(book.getDescription()).append("\n");
        }
        
        if (book.getGenre() != null) {
            prompt.append("Genre: ").append(book.getGenre()).append("\n");
        }
        
        prompt.append("\nPlease provide:\n");
        prompt.append("1. Recommended age range (min and max age in years)\n");
        prompt.append("2. Brief reasoning for the age recommendation\n");
        prompt.append("3. Reading level (Early Reader, Beginning, Intermediate, Advanced)\n");
        prompt.append("4. Main themes (up to 3)\n");
        prompt.append("\nFormat your response as JSON with keys: suggestedMinAge, suggestedMaxAge, reasoning, readingLevel, themes");
        
        return prompt.toString();
    }
    
    private AIRecommendationResponse parseOpenAIResponse(String responseBody, Book book) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.get("choices").get(0).get("message").get("content").asText();
            
            // Try to parse JSON from the response
            JsonNode aiResponse = objectMapper.readTree(content);
            
            AIRecommendationResponse response = new AIRecommendationResponse();
            response.setSuggestedMinAge(aiResponse.get("suggestedMinAge").asInt());
            response.setSuggestedMaxAge(aiResponse.get("suggestedMaxAge").asInt());
            response.setReasoning(aiResponse.get("reasoning").asText());
            response.setReadingLevel(aiResponse.get("readingLevel").asText());
            
            // Parse themes
            JsonNode themes = aiResponse.get("themes");
            List<String> themeList = new ArrayList<>();
            if (themes.isArray()) {
                for (JsonNode theme : themes) {
                    themeList.add(theme.asText());
                }
            }
            response.setThemes(themeList);
            
            response.setAgeRecommendation(
                "Recommended for ages " + response.getSuggestedMinAge() + 
                "-" + response.getSuggestedMaxAge()
            );
            
            // For now, return empty similar books list
            response.setSimilarBooks(new ArrayList<>());
            
            return response;
            
        } catch (Exception e) {
            return createFallbackResponse(book);
        }
    }
    
    private AIRecommendationResponse createFallbackResponse(Book book) {
        AIRecommendationResponse response = new AIRecommendationResponse();
        
        // Provide basic age recommendations based on genre and page count
        if (book.getPageCount() != null && book.getPageCount() < 32) {
            response.setSuggestedMinAge(2);
            response.setSuggestedMaxAge(5);
            response.setReadingLevel("Early Reader");
        } else if (book.getPageCount() != null && book.getPageCount() < 64) {
            response.setSuggestedMinAge(4);
            response.setSuggestedMaxAge(8);
            response.setReadingLevel("Beginning");
        } else {
            response.setSuggestedMinAge(6);
            response.setSuggestedMaxAge(12);
            response.setReadingLevel("Intermediate");
        }
        
        response.setAgeRecommendation(
            "Recommended for ages " + response.getSuggestedMinAge() + 
            "-" + response.getSuggestedMaxAge()
        );
        
        response.setReasoning("Age recommendation based on book length and typical reading patterns.");
        response.setThemes(Arrays.asList("Adventure", "Learning", "Fun"));
        response.setSimilarBooks(new ArrayList<>());
        
        return response;
    }
}
