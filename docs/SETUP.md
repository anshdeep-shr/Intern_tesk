# Project Setup & Execution Instructions

This repository contains a full-stack Project Management System composed of:
1. **Backend API**: Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt
2. **Web Application**: React, Vite, Tailwind CSS, Lucide Icons
3. **Mobile Application**: React Native, Expo, SecureStore

---

## Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Expo Go App** (for testing mobile app on physical phone) or Android Studio / Xcode Emulator

---

## 1. Backend Setup

```bash
cd backend
npm install
```

### Environment Setup (`.env`)
Create a `.env` file inside `backend/`:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="*"
```

### Database Migration & Seed
```bash
npx prisma db push
```

### Run Backend Development Server
```bash
npm run dev
# Server starts at http://localhost:5000
```

### Run Backend Tests
```bash
npm test
```

---

## 2. Web Application Setup

```bash
cd ../web
npm install
```

### Run Web Development Server
```bash
npm run dev
# App opens at http://localhost:3000
```

### Build Web Production Distribution
```bash
npm run build
```

---

## 3. Mobile Application Setup

```bash
cd ../mobile
npm install
```

### Configure Backend API Host
Inside `mobile/src/services/api.ts`:
- **Android Emulator**: Use `http://10.0.2.2:5000/api`
- **iOS Simulator**: Use `http://localhost:5000/api`
- **Physical Phone**: Use your computer's LAN IP, e.g., `http://192.168.1.50:5000/api` or deployed server URL.

### Run Mobile App
```bash
npx expo start
```
- Scan QR code with Expo Go app on Android/iOS device, or press `a` for Android Emulator.

---

## 4. Docker Dockerized Setup (Optional Bonus)

Run the backend, PostgreSQL database, and web frontend together in Docker:

```bash
docker-compose up --build
```
- Web App: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
