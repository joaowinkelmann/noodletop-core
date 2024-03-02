# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# copy everything from the current directory to the container
COPY . .
#list the flies in the current directory for debugging
RUN ls -la

# install dependencies
RUN bun install

# build the app
RUN bun build ./src/index.ts --target=bun --outfile=server.ts

# run the app
USER bun
EXPOSE 34567/tcp
EXPOSE 34567/udp
ENTRYPOINT [ "bun", "run", "index.ts" ]
