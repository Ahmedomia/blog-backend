# ✍️ Blog Platform

A full-stack blog application built with **React, Express, and PostgreSQL**.  
Supports blog post creation, editing, deletion, search, and image uploads with a responsive UI.

---

## 🚀 Features

- 📝 Create, read, update, and delete (CRUD) blog posts.
- 🔍 Search and filter blog posts by keywords.
- 🖼️ Upload and manage blog images.
- 👤 User profile management with avatars.
- ⚡ Global state management with Zustand for efficient rendering.
- 📱 Responsive design with React + Tailwind CSS.
- 🗄️ RESTful API with Express and PostgreSQL backend.

---

## 🛠️ Tech Stack

**Frontend:** React, Zustand, Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** PostgreSQL (via Sequelize/Knex)  
**Image Storage:** Multer / Cloudinary (configurable)  
**Deployment:** Vercel (frontend) & Render/Heroku (backend)

---

## 📂 Project Structure

/client → React frontend
/server → Express backend
/server/models → PostgreSQL models
/server/routes → API routes
/uploads → Uploaded blog images

---

## ⚡ Getting Started

### ✅ Prerequisites

- Node.js (v16+)
- PostgreSQL installed locally OR use a cloud database (e.g., Supabase, Neon, Railway)

---

### 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/Ahmedomia/react-blog-app.git
cd blog-platform

# Install dependencies
cd client && npm install
cd ../server && npm install


/server/.env
# Server Port
PORT=5000

# PostgreSQL Database URL
DATABASE_URL=postgresql://<username>:<password>@<host>/<dbname>?sslmode=require

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Secret Key
JWT_SECRET=your_jwt_secret_key

# Email Service (for password reset, notifications, etc.)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password

/client/.env
VITE_API_URL=http://localhost:5000/

# Start backend
cd server
npm run dev

# Start frontend
cd client
npm start
```

API Endpoints

# Blogs

GET /api/blogs → List all blogs
GET /api/blogs/:id → Fetch blog by ID
POST /api/blogs → Create blog (auth required)
PUT /api/blogs/:id → Update blog (auth required)
DELETE /api/blogs/:id → Delete blog (auth required)

# Users

GET /api/users/:id → Get user profile
PUT /api/users/:id → Update profile

# Future Improvements

⭐ Add blog post comments.
👍 Implement likes/reactions for posts.
🏷️ Add categories and tags.
🗄️ Rich-text editor for blog creation.

# Author

Ahmed Omia

- [GitHub](https://github.com/Ahmedomia)
