# Build stage: using Node to build the app
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --save-dev @types/d3

# Copy the rest of the source code and build the app
COPY . .
RUN npm run build

# Production stage: serve the app using nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

