# LittleLibrary Setup Guide

This guide will help you set up and run the LittleLibrary app locally.

## Prerequisites

### Backend Requirements
- Java 17 or higher
- PostgreSQL 15+ (or use H2 for development)
- Maven 3.6+ (or use included Maven wrapper)

### Mobile Requirements
- Node.js 16+
- React Native CLI
- iOS: Xcode 12+ and iOS Simulator
- Android: Android Studio and Android SDK

### API Keys (Optional but Recommended)
- Google Books API key
- OpenAI API key
- AWS credentials (for OCR functionality)

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your API keys (optional for basic functionality)
# vim .env

# Run with H2 in-memory database (development)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Or run with PostgreSQL (production-like)
# First start PostgreSQL and create database 'littlelibrary'
./mvnw spring-boot:run
OR
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The backend will start on http://localhost:8080

### 2. Mobile Setup

```bash
cd mobile

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Run on iOS
npx react-native run-ios

# Run on iOS simulator with a specific simulator
npx react-native run-ios --simulator "iPhone 15"

# Or run on Android
npx react-native run-android
```

## Detailed Setup

### Backend Configuration

1. **Database Setup (PostgreSQL)**
   ```sql
   CREATE DATABASE littlelibrary;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE littlelibrary TO postgres;
   ```

2. **Environment Variables**
   Create `.env` file in backend directory:
   ```env
   GOOGLE_BOOKS_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   AWS_ACCESS_KEY_ID=your_key_here
   AWS_SECRET_ACCESS_KEY=your_key_here
   ```

3. **API Endpoints**
   - Health check: `GET http://localhost:8080/actuator/health`
   - Books API: `GET http://localhost:8080/api/books`
   - Auth API: `POST http://localhost:8080/api/auth/login`

### Mobile Configuration

1. **Update API Base URL**
   Edit `mobile/src/services/apiService.ts`:
   ```typescript
   const BASE_URL = 'http://YOUR_IP:8080/api'; // Replace YOUR_IP
   ```

2. **iOS Permissions**
   Camera and photo library permissions are already configured in Info.plist

3. **Android Permissions**
   Camera and storage permissions are already configured in AndroidManifest.xml

## Docker Setup (Alternative)

```bash
# From project root
cd deployment

# Set environment variables
export GOOGLE_BOOKS_API_KEY=your_key
export OPENAI_API_KEY=your_key
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_key

# Start services
docker-compose up -d
```

## Testing the App

### 1. Backend Testing
```bash
cd backend

# Run tests
./mvnw test

# Test API endpoints
curl http://localhost:8080/api/books
```

### 2. Mobile Testing
1. Start the backend server
2. Launch the mobile app
3. Create an account or login
4. Try scanning a book (use any book cover image)
5. View your library in bookshelf mode

## Features Available

### MVP Features ✅
- User authentication (simplified)
- Book scanning (barcode/cover recognition)
- Library management with bookshelf UI
- Duplicate detection
- Google Books API integration
- Basic AI age recommendations

### Upcoming Features 🚧
- Real JWT authentication
- Family sharing
- Advanced AI recommendations
- Library export
- Push notifications

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check Java version: `java -version`
   - Verify database connection
   - Check port 8080 availability

2. **Mobile app can't connect to backend**
   - Update API base URL to your computer's IP
   - Ensure backend is running
   - Check firewall settings

3. **Camera not working**
   - Grant camera permissions
   - Test on physical device (camera doesn't work in simulator)

4. **Book scanning fails**
   - Ensure good lighting
   - Try with clear book cover images
   - Check API keys are configured

### Development Tips

1. **Hot Reload**
   - Backend: Use `./mvnw spring-boot:run` for auto-restart
   - Mobile: Metro bundler provides hot reload

2. **Database Reset**
   ```bash
   # H2 (dev): Restart the app
   # PostgreSQL: DROP and CREATE database
   ```

3. **API Testing**
   Use tools like Postman or curl to test backend endpoints

## Production Deployment

### AWS Amplify (Backend)
1. Push code to GitHub
2. Connect repository to AWS Amplify
3. Configure environment variables
4. Deploy using amplify.yml configuration

### App Store/Play Store (Mobile)
1. Build release versions
2. Follow platform-specific deployment guides
3. Configure production API endpoints

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check console logs for errors

## Next Steps

After setup, consider:
1. Adding real authentication with AWS Cognito
2. Implementing family sharing features
3. Adding more AI-powered recommendations
4. Integrating with more book databases
5. Adding social features
