# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@11.20.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .sally-pack .sally-pack
RUN pnpm install --frozen-lockfile
ARG NEXT_PUBLIC_SALLY_STUDIO_URL
ARG NEXT_PUBLIC_SALLY_EMBED_KEY
ENV NEXT_PUBLIC_SALLY_STUDIO_URL=$NEXT_PUBLIC_SALLY_STUDIO_URL
ENV NEXT_PUBLIC_SALLY_EMBED_KEY=$NEXT_PUBLIC_SALLY_EMBED_KEY
ENV NEXT_PUBLIC_APP_URL=https://demo.supportsally.com
ENV NEXT_PUBLIC_APP_NAME=NextCRM
ENV NEXT_PUBLIC_PASSWORD_LOGIN=true
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV INNGEST_ID=nextcrm-demo
ENV INNGEST_APP_NAME=NextCRM-Demo
ENV MINIO_ENDPOINT=http://127.0.0.1:9000
ENV MINIO_ACCESS_KEY=demo
ENV MINIO_SECRET_KEY=demo
ENV MINIO_BUCKET=demo
ENV OPENAI_API_KEY=sk-demo-not-used
ENV RESEND_API_KEY=re_demo_not_used
ENV ANTHROPIC_API_KEY=sk-ant-demo-not-used
ENV BETTER_AUTH_URL=https://demo.supportsally.com
ENV DEMO_PASSWORD_LOGIN=1
ENV GOOGLE_ID=demo
ENV GOOGLE_SECRET=demo
ARG BETTER_AUTH_SECRET=build-only-placeholder-not-the-runtime-secret
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
COPY . .
RUN pnpm exec prisma generate && pnpm exec next build

FROM node:22-bookworm-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 8080
CMD ["node", "server.js"]
