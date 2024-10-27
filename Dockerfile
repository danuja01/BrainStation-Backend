# Use the stable LTS version of Node.js as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that your app runs on
EXPOSE 3000

# Build the application using Babel (if necessary)
RUN pnpm run build

# Start the application (using app.js as the entry point)
CMD ["pnpm", "run", "dev"]
