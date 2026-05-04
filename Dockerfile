# =============================================================================
# Stage 1: Install dependencies (with lockfile)
# =============================================================================
FROM node:20-alpine AS deps

# libc6-compat is required on Alpine for some native bindings
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only the manifests first (better layer caching)
COPY package.json package-lock.json* ./

RUN npm ci --prefer-offline

# =============================================================================
# Stage 2: Build the Next.js app
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Re-use node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the full source
COPY . .

# Next.js collects telemetry data by default — disable it in CI/CD
ENV NEXT_TELEMETRY_DISABLED=1

# These variables are needed at BUILD time only if you use them server-side.
# Public variables (NEXT_PUBLIC_*) are baked into the JS bundle here.
# Pass them as build args: --build-arg NEXT_PUBLIC_API_URL=https://...
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}

RUN npm run build

# =============================================================================
# Stage 3: Production runner — smallest possible image
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 nextjs

# Copy only the standalone server output
COPY --from=builder /app/.next/standalone ./
# Copy static assets (CSS, JS chunks, images)
COPY --from=builder /app/.next/static ./.next/static
# Copy the public directory (favicon, logo, etc.)
COPY --from=builder /app/public ./public

# Hand off ownership to the non-root user
RUN chown -R nextjs:nodejs /app

USER nextjs

# The port your Next.js app listens on (set in package.json start script: -p 3001)
EXPOSE 3001

# Runtime env vars — these are NOT baked in; pass them via docker run -e or compose
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# next/image optimisation server and NextAuth need these at runtime
# (set them in your docker-compose or deployment platform)
# ENV NEXTAUTH_URL=https://your-admin-domain.com
# ENV NEXTAUTH_SECRET=your-secret
# ENV AUTH_SECRET=your-secret

CMD ["node", "server.js"]
