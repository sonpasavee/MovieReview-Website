# 🎬 MovieReview Website

โปรเจกต์นี้เป็นเว็บไซต์รีวิวภาพยนตร์ที่พัฒนาด้วย **Node.js + Express + EJS + TailwindCSS** 
และใช้ **MongoDB Atlas** เป็นฐานข้อมูล

---

## 📂 Project Structure
```
MovieReview-Website/
│── controllers/      # Logic การทำงานของระบบ
│── middleware/       # Middleware เช่น Authentication, Flash Messages
│── models/           # Mongoose Models
│── public/           # Static files (CSS, JS, Images)
│── views/            # EJS Templates
│── .gitignore
│── README.md
│── index.js          # Main Entry Point
│── package.json
│── package-lock.json
```

---

## 🚀 Installation & Setup

### 1. Clone project
```bash
git clone <repository-url>
cd MovieReview-Website
```

### 2. Install dependencies
```bash
npm install
```

### 3. สร้างไฟล์ `.env` และใส่ค่าที่จำเป็น
```env
MONGODB_URI=your_mongodb_atlas_uri
SESSION_SECRET=your_session_secret
TMDB_KEY=your_tmdb_key
```

### 4. Run project
```bash
npm run start
```
หรือรันแบบ dev (ใช้ nodemon)
```bash
npm run dev
```

---

## 🛠 Tech Stack
- **Node.js + Express** → Backend
- **EJS** → Template Engine
- **TailwindCSS** → CSS Framework (CDN / Link based)
- **MongoDB Atlas** → Cloud Database

---

## 📌 Features
- สมัครสมาชิก / เข้าสู่ระบบ
- ค้นหาหนังจาก TMDB API
- เขียนรีวิว / ให้คะแนนหนัง
- ดูโปรไฟล์ผู้ใช้
- ระบบแจ้งเตือน (Flash Alert)

---

## 👥 Contributors
- Pasavee Pongkaew (Owner)
- และทีมผู้พัฒนาคนอื่นๆ

---

## 📄 License
This project is licensed under the MIT License.
