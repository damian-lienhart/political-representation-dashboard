# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set working directory
WORKDIR src/index.ts
# /usr/src/app/src


# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 for the app
EXPOSE 3000

# Start the application
CMD ["npx","ts-node", "src/index.ts"]
