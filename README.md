# CineBook 🎬

**CineBook** is a production-ready, cinematic cinema booking platform designed for a premium user experience. Built with a modern **MERN stack** and a dedicated **Java Spring Boot microservice**, it offers high-end features such as real-time seat synchronization, immersive 3D theater previews, and professional server-side PDF ticket generation.

---

## 🚀 Key Features

### 🎞️ Immersive Discovery
*   **Dynamic Movie Engine**: Live movie listings with TMDB integration for ratings, genres, and profiles.
*   **Intelligent Scheduling**: Dynamic showtime generation across multiple theater locations.
*   **Premium UI**: A sleek, glassmorphic design optimized for cinematic feel.

### 🪑 The Booking Experience
*   **Real-Time Seat Locking**: Powered by **Socket.io**; prevents double bookings with a 120-second auto-unlock timer.
*   **Director's View (3D Preview)**: An immersive theater hall preview using CSS 3D transforms to visualize the best seats.
*   **Multi-Tier Seating**: Support for Silver, Gold, and Premium tiers with dynamic pricing.

### 🍔 Integrated Services
*   **Virtual Snack Bar**: Add food and beverages to your order with itemized billing.
*   **Wallet & Loyalty**: A persistent guest wallet system with cashback rewards (₹10 per seat).
*   **Coupon Engine**: Discount management with custom code support (e.g., `PILU10`).

### 🎫 Professional Ticketing
*   **Java PDF Service**: High-fidelity PDF tickets generated server-side for maximum consistency.
*   **QR Integration**: Every ticket includes a unique, verifiable QR code generated via the **ZXing** library.

---

## 🛠️ Tech Stack

### Frontend (SPA)
| Technology | Role |
| :--- | :--- |
| **React 19** | Core UI library with Vite |
| **Tailwind CSS** | Utility-first styling with glassmorphism |
| **Framer Motion** | Premium micro-animations |
| **Lucide React** | Modern, clean iconography |
| **Socket.io-client** | Real-time seat synchronization |

### Backend (Core API)
| Technology | Role |
| :--- | :--- |
| **Node.js (Express)** | RESTful API and business logic |
| **MongoDB (Mongoose)** | Scalable data storage and modeling |
| **Socket.io** | Real-time bi-directional server communication |
| **Razorpay** | Secure payment gateway integration |

### Backend (Ticket Microservice)
| Technology | Role |
| :--- | :--- |
| **Java (Spring Boot 3)** | Dedicated service for PDF processing |
| **OpenPDF** | Professional PDF layout engine |
| **ZXing** | QR code and barcode generation |

---

## 📂 Project Structure

```text
CINEBOOK/
├── frontend/             # React SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── components/   # Atomic UI components
│   │   ├── pages/        # Route-level views (SeatSelection, 3DPreview, etc.)
│   │   ├── context/      # Global state (Booking, Wallet, Socket)
│   │   └── hooks/        # Reusable business logic
├── backend/              # Node.js REST API & WebSocket Server
│   ├── models/           # Mongoose Data Schemas
│   ├── routes/           # API Endpoint Definitions
│   └── controllers/      # Request handlers and logic
└── ticket-service/       # Java Microservice for PDF Generation
    └── src/              # OpenPDF and QR generation logic
```

---

## 🚀 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- Java 17+
- MongoDB instance (Local or Atlas)
- Maven (or use provided Wrapper)

### 2. Configure Environment Variables
**Backend (`backend/.env`):**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000
```

### 3. Run the Services
**Start Java Ticket Service:**
```bash
cd ticket-service
mvn spring-boot:run
```

**Start Node Backend:**
```bash
cd backend
npm install
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🛣️ API Reference

### Bookings
* `POST /api/bookings` - Create a new reservation
* `GET /api/bookings/history/:userId` - Retrieve user/guest history
* `POST /api/bookings/pdf` - Generate server-side PDF ticket (Node-to-Java bridge)

### Theatre & Layouts
* `GET /api/shows/:id` - Fetch theater layout and seat availability (real-time)
* `GET /api/movies` - List active movies with TMDB metadata

---

## 🛠️ Troubleshooting

**Blank Page on Vercel?**
Ensure your `vite.config.js` has `base: "/"` and that you've added the `VITE_API_URL` environment variable in the Vercel dashboard pointing to your deployed backend.

**PDF Fails to Download?**
Ensure the Java microservice is running on port **8080**. The Node backend acts as a bridge; check Node logs for `ECONNREFUSED` errors.

---

## 👤 Credits & Author
**Bhagyabrata Gantayat**  
*Full Stack Developer*

---
> [!TIP]
> **Demo Coupon**: Apply `PILU10` at checkout for a 10% discount during testing!
