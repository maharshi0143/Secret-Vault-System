FROM node:18.17-alpine

# Install build essentials for native dependencies
RUN apk add --no-cache python3 make g++ curl ca-certificates

WORKDIR /app

# Copy dependency files first for caching
COPY package.json package-lock.json ./

# Install dependencies using the same flag to avoid peer conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the project
COPY . .

# Compile contracts during build to catch errors early
RUN npx hardhat compile

# Make entrypoint executable
RUN chmod +x ./docker/entrypoint.sh

CMD ["sh", "./docker/entrypoint.sh"]