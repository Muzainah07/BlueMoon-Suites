# 🌙 BlueMoon Suites

A modern and responsive hotel room booking web application built with **React, Vite, and Supabase**.

BlueMoon Suites allows guests to browse hotel rooms, create an account, sign in, book rooms, manage their reservations, and leave reviews. The application also includes protected routes and an admin dashboard.

---

## ✨ Features

- 🏨 Browse available hotel rooms
- 🔎 Filter rooms by room type
- 💰 View room prices and availability
- 🔐 User registration and login
- 🚪 Secure sign-out functionality
- 📅 Book rooms with check-in and check-out dates
- 👥 Select number of guests
- 🛏️ Select number of rooms
- 💵 Automatically calculate estimated booking total
- ✅ Check room availability before booking
- 📋 View personal bookings
- ⭐ Submit and view guest reviews
- 📊 Display average guest rating
- 📧 Booking confirmation email support
- 🛡️ Protected routes for authenticated users
- 👨‍💼 Admin dashboard
- 📱 Responsive desktop and mobile design
- 🌙 Premium boutique-hotel style interface

---

## 🛠️ Technologies Used

### Frontend

- React
- Vite
- React Router
- Lucide React
- CSS

### Backend & Database

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Edge Functions

---

## 📁 Project Structure

```text
BlueMoon-Suites/
│
├── public/
│   └── images/
│       ├── 102.jpg
│       ├── double_room.jpg
│       └── suite_room.jpg
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── RoomCard.jsx
│   │   ├── BookingForm.jsx
│   │   └── RequireAuth.jsx
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── Loginpage.jsx
│   │   ├── Home.jsx
│   │   ├── Bookings.jsx
│   │   ├── BookingList.jsx
│   │   └── AdminDashboard.jsx
│   │
│   ├── lib/
│   │   └── supabase.js
│   │
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── package.json
├── vite.config.js
├── .env
└── README.md