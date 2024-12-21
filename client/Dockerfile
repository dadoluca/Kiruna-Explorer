FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
ENV DOCKER=1
COPY --from=build /app/build /app/build
COPY . /app
EXPOSE 5173
CMD ["npm", "run", "dev"]