# 🚀 Z.ai Dashboard - How to Run

This guide provides step-by-step instructions for setting up and running your role-based BI platform locally.

## ✅ Prerequisites
- **Node.js**: 18.0.0 or higher
- **npm**: 7.0.0 or higher

---

## 🛠️ Installation & Setup

### 1. Install Dependencies
If you encounter peer dependency errors or execution policy issues in PowerShell, use the following commands:
```powershell
# Set execution policy (if npm is blocked)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install dependencies
npm install --legacy-peer-deps
```

---

## 🗄️ Database Setup

The project uses Prisma with a local SQLite database (`db/custom.db`).

### 2. Sync Database Schema
```powershell
npm run db:push
```

### 3. Generate Prisma Client
```powershell
npm run db:generate
```

---

## 🚀 Running the Application

### 4. Start Development Server
This command runs the custom server (`server.ts`) which handles both Next.js and Socket.IO.
```powershell
npm run dev
```

### 5. Access the Web App
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔐 Accounts for Testing

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `demo123` |
| **Manager** | `manager@demo.com` | `demo123` |
| **Client** | `client@demo.com` | `demo123` |

> [!TIP]
> You can also use the **"Demo Access"** buttons on the login page for instant access without credentials.

---

## 📊 Useful Scripts
- `npm run db:studio`: Opens a browser UI to view/edit database records.
- `npm run build`: Prepares the app for production.
- `npm run start`: Starts the production server.
