# Stage 1: Build the React app
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine

# Copy the build output from the first stage to the Nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration to handle React Router navigation
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Nginx runs on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
