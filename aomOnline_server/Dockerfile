# syntax=docker/dockerfile:1

# ─── Build stage ────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

# Install ALL deps (incl. dev) so `tsc` is available for the build.
# --include=dev forces devDependencies even when NODE_ENV=production is passed
# in as a build-time variable (which would otherwise skip them).
COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build          # compiles src/ → dist/

# ─── Runtime stage ──────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Only production deps in the final image.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled output from the build stage.
COPY --from=builder /app/dist ./dist

# `uploads/` is the local-storage fallback used when Cloudinary is not
# configured. Mount a Coolify persistent volume at /app/uploads to keep
# these files across redeploys (skip if you use Cloudinary exclusively).
RUN mkdir -p uploads

EXPOSE 5000
CMD ["node", "dist/server.js"]
