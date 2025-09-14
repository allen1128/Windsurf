package com.littlelibrary.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.DetectTextRequest;
import software.amazon.awssdk.services.rekognition.model.DetectTextResponse;
import software.amazon.awssdk.services.rekognition.model.Image;
import software.amazon.awssdk.services.rekognition.model.TextDetection;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OCRService {
    
    @Value("${aws.access.key.id:}")
    private String awsAccessKeyId;
    
    @Value("${aws.secret.access.key:}")
    private String awsSecretAccessKey;
    
    @Value("${aws.region:us-east-1}")
    private String awsRegion;
    
    private RekognitionClient rekognitionClient;
    
    private RekognitionClient getRekognitionClient() {
        if (rekognitionClient == null) {
            if (!awsAccessKeyId.isEmpty() && !awsSecretAccessKey.isEmpty()) {
                AwsBasicCredentials awsCreds = AwsBasicCredentials.create(awsAccessKeyId, awsSecretAccessKey);
                rekognitionClient = RekognitionClient.builder()
                    .region(Region.of(awsRegion))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                    .build();
            }
        }
        return rekognitionClient;
    }
    
    public String extractTextFromImage(String base64Image) {
        try {
            RekognitionClient client = getRekognitionClient();
            if (client == null) {
                throw new RuntimeException("AWS Rekognition not configured");
            }
            
            // Remove data URL prefix if present
            String imageData = base64Image;
            if (imageData.contains(",")) {
                imageData = imageData.split(",")[1];
            }
            
            byte[] imageBytes = Base64.getDecoder().decode(imageData);
            SdkBytes sourceBytes = SdkBytes.fromByteArray(imageBytes);
            
            Image image = Image.builder()
                .bytes(sourceBytes)
                .build();
            
            DetectTextRequest request = DetectTextRequest.builder()
                .image(image)
                .build();
            
            DetectTextResponse response = client.detectText(request);
            
            StringBuilder extractedText = new StringBuilder();
            for (TextDetection text : response.textDetections()) {
                if ("LINE".equals(text.type().toString())) {
                    extractedText.append(text.detectedText()).append("\n");
                }
            }
            
            return extractedText.toString().trim();
            
        } catch (Exception e) {
            throw new RuntimeException("Error extracting text from image", e);
        }
    }
    
    public String extractBarcodeFromImage(String base64Image) {
        try {
            String extractedText = extractTextFromImage(base64Image);
            
            // Look for ISBN patterns in the extracted text
            Pattern isbnPattern = Pattern.compile("(?:ISBN[\\s-]*(?:13|10)?[\\s-]*:?[\\s-]*)?(\\d{1,5}[\\s-]?\\d{1,7}[\\s-]?\\d{1,7}[\\s-]?[\\dX])");
            Matcher matcher = isbnPattern.matcher(extractedText);
            
            if (matcher.find()) {
                String isbn = matcher.group(1).replaceAll("[\\s-]", "");
                
                // Validate ISBN length
                if (isbn.length() == 10 || isbn.length() == 13) {
                    return isbn;
                }
            }
            
            // Also look for pure numeric sequences that could be ISBNs
            Pattern numericPattern = Pattern.compile("(\\d{10,13})");
            Matcher numericMatcher = numericPattern.matcher(extractedText);
            
            while (numericMatcher.find()) {
                String candidate = numericMatcher.group(1);
                if (candidate.length() == 10 || candidate.length() == 13) {
                    // Basic validation - ISBN-13 should start with 978 or 979
                    if (candidate.length() == 13 && (candidate.startsWith("978") || candidate.startsWith("979"))) {
                        return candidate;
                    } else if (candidate.length() == 10) {
                        return candidate;
                    }
                }
            }
            
            return null;
            
        } catch (Exception e) {
            throw new RuntimeException("Error extracting barcode from image", e);
        }
    }
}
