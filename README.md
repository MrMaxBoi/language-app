# Hotelify

A full-stack hotel management application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- 🏨 Product/Room management system
- ➕ Add new products/rooms
- 📋 View all products/rooms
- 🎨 Modern UI with Chakra UI
- 🌙 Dark/Light mode support
- 📱 Responsive design
- 🔄 Real-time state management with Zustand

## Tech Stack

**Frontend:**
- React 19
- Chakra UI
- React Router DOM
- Zustand (State Management)
- Vite (Build Tool)

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- dotenv for environment variables

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mern-hotel
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   npm install --prefix frontend
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/mern-hotel
   PORT=5050
   NODE_ENV=development
   ```

4. **Start the application**
   
   **Development mode (both frontend and backend):**
   ```bash
   # Start backend
   npm run dev

   # In another terminal, start frontend
   cd frontend
   npm run dev
   ```

   **Production mode:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| POST | `/api/products` | Create a new product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

## Project Structure

```
mern-hotel/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── product.controller.js
│   ├── models/
│   │   └── product.model.js
│   ├── routes/
│   │   └── product.route.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .env
├── .gitignore
└── package.json
```

## Available Scripts

**Root directory:**
- `npm run dev` - Start backend in development mode
- `npm run build` - Build the application for production
- `npm start` - Start the application in production mode
- `npm run ci-check` - CI health check

**Frontend directory:**
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.