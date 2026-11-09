# AOM Online Madrasa — Backend

Backend server for **AOM Online Madrasa**, an online madrasa management system. Built with **Node.js**, **Express**, and **TypeScript** using a modular, domain-driven architecture.

> **Status:** Phase 1 — Foundation only. Security, config, DB connection helper, and base middlewares are in place. Feature modules are added in later phases.

## 🛠️ Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js 4
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose 8 ODM
- **Validation**: Zod
- **Security**: JWT (jsonwebtoken), Bcryptjs, Helmet, CORS, express-rate-limit, express-mongo-sanitize
- **Media**: Cloudinary + Multer
- **Dev Tools**: ESLint, Prettier, ts-node-dev

## 👥 Roles

Role hierarchy (lowest → highest authority):

`parent` < `student` < `teacher` < `admin` < `superAdmin`

`superAdmin` always bypasses authorization checks.

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=5000
DATABASE_URL=your_mongodb_connection_string
BCRYPT_SALT_ROUNDS=12
JWT_ACCESS_SECRET=your_access_token_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

> In Phase 1 the server boots and serves the health check even if `DATABASE_URL` is blank/unreachable.

## 🏃 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run start:dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Start Production Server
```bash
npm run start:prod
```

Health check: `GET http://localhost:5000/` →
```json
{ "success": true, "message": "AOM Online Madrasa Server is running 🚀" }
```

## 📁 Project Structure

```text
src/
├── app/
│   ├── config/             # Environment config + Cloudinary setup
│   ├── middlewares/        # auth, validateRequest, globalErrorHandler
│   ├── modules/            # Domain feature modules (added per phase)
│   └── utils/              # Utilities (dbConnect, etc.)
├── scripts/                # Seed/maintenance scripts
├── app.ts                  # Express app initialization
└── server.ts               # Application entry point
```

## 📜 Scripts

| Script | Description |
| :--- | :--- |
| `npm run start:dev` | Runs the app in development mode with auto-reload |
| `npm run start:prod` | Runs the compiled production build from `/dist` |
| `npm run build` | Compiles TypeScript files to JavaScript |
| `npm run lint` | Checks for code style and errors |
| `npm run prettier` | Formats source files |
| `npm run seed:admin` | Seeds a default admin (placeholder in Phase 1) |

## 🌐 Deployment

Configured for **Vercel** via `vercel.json`.
