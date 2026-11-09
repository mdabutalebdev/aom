# AOM Online Education Management System (Monorepo)

This repository contains both the client and server applications for **AOM Online Education Management System**.

---

## 📁 Repository Structure

```text
aomonline-edu-management/
├── aomOnline_client/     # Frontend (Next.js, React, Tailwind CSS, TypeScript)
├── aomOnline_server/     # Backend (Node.js, Express, TypeScript, MongoDB, Mongoose)
├── .gitignore            # Root-level ignore rules for monorepo
└── README.md             # Project documentation
```

---

## 🚀 Getting Started

### 1. Backend Setup (`aomOnline_server`)

```bash
# Navigate to server directory
cd aomOnline_server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Open .env and add your MongoDB URI, JWT secrets, etc.

# Start development server
npm run dev
```

The server will start on `http://localhost:5000` (or configured port).

---

### 2. Frontend Setup (`aomOnline_client`)

```bash
# Navigate to client directory
cd aomOnline_client

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

The client will start on `http://localhost:3000`.

---

## 🛡️ Git & Security Notes

- Sensitive credentials (`.env`, `.env.local`) are excluded from git tracking. Always refer to `.env.example` and `.env.local.example`.
- Large build directories (`.next`, `dist`, `node_modules`) are strictly ignored.
- Local user upload media files in `aomOnline_server/uploads` are ignored while maintaining the directory structure via `.gitkeep`.
