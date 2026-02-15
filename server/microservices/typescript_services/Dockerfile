FROM node:current-alpine AS base
WORKDIR /service/
COPY package.json ./
COPY tsconfig.base.json ./
COPY common ./common
COPY map_tile_service ./map_tile_service
COPY route_service ./route_service
RUN npm install --ignore-scripts

FROM base AS map-tile-service
WORKDIR /service/map_tile_service
RUN npm run build
EXPOSE 3000
USER node
CMD ["npm", "start"]

FROM base AS route-service
WORKDIR /service/route_service
RUN npm run build
EXPOSE 3000
USER node
CMD ["npm", "start"]
