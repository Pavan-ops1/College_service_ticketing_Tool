FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install the dependencies specified in package.json (including Chart.js if it's there)
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the frontend app (assuming you're using React, Angular, etc.)
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

# Expose port 3001 for the app
EXPOSE 3001

# Command to start the server and serve the app on port 3001
CMD ["serve", "-s", "build", "-l", "3001"]
