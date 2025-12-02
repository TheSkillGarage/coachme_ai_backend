<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A comprehensive backend API for Coachme AI built with <a href="http://nestjs.com" target="_blank">NestJS</a>.</p>

## Description

Coachme AI Backend API built with NestJS. A comprehensive backend for a job search platform with authentication, job management, resume parsing, AI-powered cover letters, and application tracking.

## 🚀 Features

- **JWT Authentication & Authorization** with refresh tokens  
- **User Management** with profiles, settings, and preferences  
- **Job Search Integrations** (Adzuna, RapidAPI)  
- **Application Tracking** with status history  
- **Resume & Cover Letter AI Generation**  
- **Email Notifications** using Brevo (Sendinblue)  
- **File Storage** with Cloudinary  
- **Background Jobs** with Bull + Redis  
- **PostgreSQL Database** using Prisma ORM  

## 📋 Prerequisites

- Node.js v18+  
- PostgreSQL v15+  
- Redis  
- npm v9+  

---

## 📦 Project Setup

### **Install Dependencies**
```bash
npm install
```

### 🛠️ Post-Installation (Prisma Setup)

After running:

```bash
# Generate Prisma Client
npm run prisma:generate

# Apply schema to database
npm run prisma:migrate

# Push schema without migrations (development only)
npm run prisma:push

# Visual schema explorer
npm run prisma:studio
```


## Available Scripts

```bash
# Development
npm run start:dev        # Start in watch mode
npm run start:debug      # Start with debug mode

# Production
npm run build           # Build the project
npm run start:prod      # Start production server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:push      # Push schema to database

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:e2e        # Run end-to-end tests
npm run test:cov        # Run tests with coverage

```

