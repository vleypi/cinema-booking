FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@12.4.1 --activate
WORKDIR /app

FROM base AS pruner
ARG APP
COPY . .
RUN pnpm dlx turbo@$(node -p "require('./package.json').devDependencies.turbo") prune ${APP} --docker

FROM base AS deps
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG APP
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=${APP}

FROM base AS prod-deps
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod

FROM node:24-alpine AS backend
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app ./
COPY --from=build /app/backend/dist ./backend/dist
WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "dist/main"]

FROM node:24-alpine AS next
ARG APP
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=build /app/frontend/${APP}/.next/standalone ./
COPY --from=build /app/frontend/${APP}/.next/static ./frontend/${APP}/.next/static
COPY --from=build /app/frontend/${APP}/public ./frontend/${APP}/public
WORKDIR /app/frontend/${APP}
EXPOSE 3000
CMD ["node", "server.js"]
