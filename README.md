# Mira Lounge 💍✨

A premium full-stack MERN wedding hall booking platform built for **Mira Lounge**, a luxury wedding venue located in **Sarojini Nagar, Delhi**.

The platform provides a cinematic luxury experience where users can:

* explore venue details
* browse decoration & catering packages
* book the hall online
* pay advance using Razorpay
* track booking status

Admins (hall owners) can manage:

* bookings
* pricing
* gallery
* approvals/rejections
* refunds

---

# 🌐 Live Demo

Frontend:


Backend API:


Admin Demo Credentials:

```bash
Email: admin@miralounge.com
Password: ********
```

---

# 🚀 Tech Stack

## Frontend

* React.js
* Tailwind CSS
* GSAP Animations
* React Router DOM
* Axios

## Backend

* Node.js
* Express.js
* JWT Authentication
* Razorpay Integration

## Database

* MongoDB Atlas

## Deployment

* Vercel (Frontend)
* Render (Backend)

---

# ✨ Features

## 👤 User Features

* User Registration & Login
* JWT Authentication
* Premium Luxury UI
* Cinematic Hero Video
* Hall Gallery & Services
* Dynamic Price Calculation
* Full-Day Hall Booking
* Razorpay Payment Integration
* Booking Status Tracking
* Booking Cancellation & Refund

---

## 🔐 Admin Features

* Secure Admin Dashboard
* View All Bookings
* Approve / Reject Requests
* Manage Hall Pricing
* Manage Packages & Services
* Upload Gallery Images
* Revenue Tracking
* Refund Management

---

# 💳 Booking & Payment Logic

* Users pay **25% advance** during booking
* Remaining amount paid offline
* Only **1 approved booking per date**
* Multiple pending bookings allowed

### Cancellation Policy

* If admin rejects booking → Full refund
* If user cancels approved booking → 40% of advance refunded

---

# 🗄 Database Collections

```bash
Users
Hall
Bookings
```

---

# 📁 Project Structure

```bash
mira-lounge/
│
├── frontend/
│
└── backend/
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/mira-lounge.git
cd mira-lounge
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create `.env` file inside backend:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🎨 Design Theme

* Matte Black + Royal Gold
* Glassmorphism Effects
* Smooth Scroll Animations
* Cinematic Luxury Branding
* Responsive Design
* Elegant Typography

---

# 🔐 Authentication

* JWT-based Authentication
* Role-Based Access Control
* Protected Routes
* Admin Middleware

---

# 📸 Future Enhancements

* Email Notifications
* Calendar Availability View
* Invoice PDF Generation
* AI Decoration Suggestions
* WhatsApp Booking Alerts

---

# 👨‍💻 Author

**Chaitanya Pawar**

---

# ⭐ Project Goal

To build a luxury digital booking platform for wedding venues using the MERN stack while implementing:

* real-world business logic
* secure authentication
* online payments
* admin management system
* premium UI/UX design
