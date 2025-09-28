# LittleLibrary - Test Run Guide

This guide walks you through starting the iOS simulator app, the Spring Boot backend, and the Web Demo UI. It also includes common issues and mitigations.

- Repo root: `little-library/`
- Mobile app: `little-library/mobile/`
- Backend API: `little-library/backend/`
- Web demo: `little-library/web-demo/`

---

## 1) Start the iOS Simulator (React Native)

Prereqs
- Xcode installed from the App Store (macOS only)
- Command Line Tools: Xcode > Settings > Locations > Command Line Tools
- Node.js 20+, Watchman (optional), CocoaPods

Install dependencies
```bash
# From repo root
cd mobile
npm install
```

Install CocoaPods for iOS native deps
```bash
# If not installed
brew install cocoapods

# Install pods (if needed)
cd ios
pod install
```

Run the iOS app
```bash
# From little-library/mobile
npx react-native run-ios
```

If you prefer Xcode
1. Open `mobile/ios/mobile.xcodeproj` in Xcode
2. Select a Simulator device (e.g., iPhone 15)
3. Press Run (⌘R)

Troubleshooting (iOS)
- Simulator not launching or Xcode not found
  - Ensure full Xcode is installed (not just Command Line Tools)
  - Run `xcode-select --switch /Applications/Xcode.app`
- Pod install issues
  - `sudo gem uninstall cocoapods` then `brew install cocoapods`
  - Run `pod repo update` then `pod install`
- Metro cache issues / red screen
  - Stop the packager, then `npm start -- --reset-cache`
- Port 8081 conflict (Metro)
  - Kill the process occupying 8081 or run Metro on another port

---

## 2) Start the Backend Endpoint (Spring Boot)

Environment variables
- Configure keys via environment or `application.properties` (already mapped):
  - `GOOGLE_BOOKS_API_KEY` (optional but recommended)
  - `OPENAI_API_KEY` (future feature)
  - Postgres (if running with DB): `SPRING_DATASOURCE_*`

Option A: Start backend normally (requires Postgres running)
```bash
# From little-library/backend
./mvnw spring-boot:run
```
If Postgres is not running locally, you will see `Connection refused` for `localhost:5432`.

Option B: Start backend without DB (fastest for testing Google Books endpoints)
```bash
# From little-library/backend
./mvnw spring-boot:run \
  -Dspring-boot.run.arguments="--spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration"
```
This bypasses JDBC/JPA so Google Books endpoints work without a database.

Verify
- Backend base URL: `http://localhost:8080`
- Example endpoints:
  - Lookup by ISBN: `http://localhost:8080/api/books/lookup?isbn=9780439708180`
  - Lookup by Title: `http://localhost:8080/api/books/lookup?title=Goodnight%20Moon`
  - Search: `http://localhost:8080/api/books/search?query=The%20Gruffalo`

Curl tests
```bash
curl "http://localhost:8080/api/books/lookup?isbn=9780439708180"
curl "http://localhost:8080/api/books/lookup?title=Goodnight%20Moon"
curl "http://localhost:8080/api/books/search?query=The%20Gruffalo"
```

Google Books API key
- Optional but recommended to avoid anonymous quota limits
- Set via env var:
```bash
export GOOGLE_BOOKS_API_KEY=your_key
```
- Or in `backend/src/main/resources/application.properties` as `google.books.api.key=${GOOGLE_BOOKS_API_KEY:}` (already configured)

Troubleshooting (Backend)
- Connection refused to Postgres
  - Start Postgres locally, or use Option B to exclude DB auto-config
- Missing repository bean errors when excluding JPA
  - We marked repositories `@Autowired(required = false)` to allow startup without JPA
- Port 8080 already in use
  - Change port via `server.port=8081` or kill the conflicting process
- CORS issues
  - `BookController` uses `@CrossOrigin(origins = "*")` so the web demo can call it from a file:// or http:// origin

---

## 3) Start the Web Demo UI

The web demo is a static HTML file with buttons that call backend endpoints. It does not require a build step.

Open directly (simplest)
- Open `web-demo/index.html` in your browser (double-click or `open web-demo/index.html` on macOS)

Or serve locally (if needed)
```bash
# From little-library/web-demo
python3 -m http.server 5501
# Open http://localhost:5501 in your browser
```

Use the UI
- In the "Book Management" panel, try:
  - "Lookup by ISBN (Google)"
  - "Lookup by Title (Google)"
  - "Search (Legacy Endpoint)"
- Results will render under the list with cover, title, author, and ISBN.

Troubleshooting (Web Demo)
- Static server terminated (environment kills processes)
  - Open `index.html` directly without a server
  - Or use an editor extension (e.g., Live Server) to serve the folder
- Mixed content errors
  - If the page is served over https, ensure backend is also https (or just open index.html via file:// during development)
- CORS errors
  - Backend has permissive CORS; ensure you are calling `http://localhost:8080` as defined in the script's `API_BASE`

---

## Optional: Docker Alternative (Backend)

`SETUP.md` contains a docker-compose flow. Quick start:
```bash
# From project root
cd deployment
export GOOGLE_BOOKS_API_KEY=your_key
export OPENAI_API_KEY=your_key
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_key

docker-compose up -d
```

---

## Appendix: Known Issues & Mitigations

- **Xcode / Simulator missing**
  - Install Xcode from the App Store, then run `xcode-select --switch /Applications/Xcode.app`
- **CocoaPods permission errors**
  - Prefer Homebrew install: `brew install cocoapods` (avoid sudo gem installs)
- **RN dependency conflicts**
  - Use Node 20+ and reinstall: `rm -rf node_modules && npm install`
- **Backend DB connection failures**
  - Start Postgres or start backend with DB auto-config excluded (see Option B)
- **Google Books quota**
  - Provide `GOOGLE_BOOKS_API_KEY` to increase limits and stability
- **Ports in use (8080, 8081, 5501)**
  - Change ports or free them before running
- **Static server killed by environment**
  - Open `web-demo/index.html` directly instead of serving

You're ready to test: run the backend (Option B for speed), open the web demo HTML, and try Lookups/Search. If anything fails, copy the error and I’ll help fix it quickly.
