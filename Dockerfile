FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY src src
COPY public public
COPY data data
COPY types types
COPY tsconfig.json package.json ./
RUN mkdir -p logs && chown bun:bun logs

USER bun
ENV NODE_ENV=production
EXPOSE 8080/tcp

ENTRYPOINT ["bun", "run", "src/index.ts"]
