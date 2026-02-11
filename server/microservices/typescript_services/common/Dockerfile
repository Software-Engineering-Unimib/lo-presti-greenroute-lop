FROM node:current-alpine AS base
WORKDIR /service
COPY ./common/ServiceServer.ts ./src/
COPY ./common/tsconfig.base.json ./
COPY ./common/package.json ./
RUN npm install

FROM base AS map-tile-service
COPY ./map_tile_service/ .
RUN npm install redis@^4.6.13
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

FROM base AS route-service
COPY ./route_service/ .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]