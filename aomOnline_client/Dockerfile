# syntax=docker/dockerfile:1

# ─── Dependencies ───────────────────────────────────────────────
FROM node:22-slim AS deps
WORKDIR /app
# --include=dev forces devDependencies (tailwindcss, postcss, etc.) even when
# NODE_ENV=production is passed in as a build-time variable.
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# ─── Build ──────────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the browser bundle at BUILD time,
# so the production API URL must be supplied HERE, not just at runtime.
# In Coolify, add NEXT_PUBLIC_API_URL as a *Build Variable* so it is passed
# to this build arg (e.g. https://api.your-domain.com).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Runtime ────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# `npm run start` → `next start -p 5005`
EXPOSE 5005
CMD ["npm", "run", "start"]
