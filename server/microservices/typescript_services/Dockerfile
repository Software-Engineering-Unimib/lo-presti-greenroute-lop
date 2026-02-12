FROM node:current-alpine AS base
WORKDIR /service/
COPY /package.json ./package.json
COPY /tsconfig.base.json ./tsconfig.base.json
COPY ./common/ ./common/
RUN npm install

FROM base AS map-tile-service
WORKDIR /service/map_tile_service/
COPY ./map_tile_service/ .
RUN npm install \
&& npm run build
EXPOSE 3000
CMD ["npm", "start"]

FROM base AS route-service
WORKDIR /service/route_service/
COPY ./route_service/ .
RUN npm install \
&& npm run build
EXPOSE 3000
CMD ["npm", "start"]
