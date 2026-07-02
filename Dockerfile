# syntax=docker/dockerfile:1

# ---- Build stage: compile TypeScript and prune dev dependencies ----
FROM node:22-slim AS build
ENV HUSKY=0
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# ---- Runtime stage: minimal image, non-root user ----
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
USER node

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node package.json ./

EXPOSE 4200

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4200)+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
