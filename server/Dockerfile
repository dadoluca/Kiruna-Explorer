# Dockerfile for Backend
FROM node:20

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json for caching
COPY package*.json ./

# Install dependencies
RUN npm install && npm rebuild bcrypt --build-from-source

# Copy the rest of the app
COPY . .

# Expose the backend port
EXPOSE 5001

# Start the backend
CMD ["npm", "start"]
