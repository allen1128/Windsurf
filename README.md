# LittleLibrary - Interactive Home Library App

A mobile app that helps parents catalog and manage their children's books at home with AI-powered recommendations.

## Features

- **Scan & Add**: Camera-based barcode or cover scanning
- **Smart Library**: Searchable, filterable book collection with bookshelf UI
- **AI Insights**: Age suitability and related-book suggestions using OpenAI
- **Duplicate Detection**: Avoid buying books you already own
- **Family Sharing**: Multi-user library access

## Tech Stack

### Backend
- Java Spring Boot
- PostgreSQL Database
- AWS Amplify Hosting
- AWS Cognito Authentication

### Frontend
- React Native
- Custom bookshelf UI components

### Integrations
- Google Books API
- OpenAI API
- AWS Rekognition (OCR)

## Project Structure

```
little-library/
├── backend/           # Java Spring Boot API
├── mobile/           # React Native mobile app
├── docs/             # Documentation
└── deployment/       # AWS deployment configs
```

## Getting Started

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```

### Mobile Setup
```bash
cd mobile
npm install
npx react-native run-ios
```

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/books` - Get user's library
- `POST /api/books` - Add book to library
- `POST /api/books/scan` - Scan and identify book
- `GET /api/books/{id}/recommendations` - Get AI recommendations
- `POST /api/books/{id}/duplicate-check` - Check for duplicates

## Environment Variables

Create `.env` files with:
- `OPENAI_API_KEY`
- `GOOGLE_BOOKS_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
