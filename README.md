# EduPaper Frontend

React frontend for the EduPaper online examination system.

## Features

- Modern React 19 with hooks
- Redux Toolkit for state management
- RTK Query for API calls
- Role-based dashboards (Student, Teacher, Admin)
- Responsive design with Tailwind CSS
- Beautiful animations with Framer Motion
- Real-time exam interface

## Tech Stack

- React 19
- Redux Toolkit & RTK Query
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create `.env` file:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
   VITE_APP_NAME=EduPaper
   VITE_APP_VERSION=1.0.0
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## User Roles

### Students
- Take assigned examinations
- View results and performance
- Track exam history
- Real-time exam interface

### Teachers
- Create and manage papers
- Assign papers to students
- Grade subjective answers
- View analytics and reports

### Admins
- Manage users and system settings
- View system-wide analytics

## Deployment (Vercel)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**
   - Update `VITE_API_BASE_URL` to your backend URL

## Project Structure

```
src/
├── components/     # Reusable UI components
├── features/       # Redux slices and API calls
├── pages/          # Route components
├── store/          # Redux store configuration
└── App.jsx         # Main app component
```

Ready for production deployment! 🎨