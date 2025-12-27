FROM node:18.17-alpine

# Install build essentials for native dependencies and dos2unix
RUN apk add --no-cache python3 make g++ curl ca-certificates dos2unix

WORKDIR /app

# Copy dependency files first for caching
COPY package.json package-lock.json ./

# Install dependencies using the same flag to avoid peer conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the project
COPY . .

# Convert entrypoint to LF and make executable
RUN dos2unix ./docker/entrypoint.sh && chmod +x ./docker/entrypoint.sh

# Compile contracts during build to catch errors early
RUN npx hardhat compile

CMD ["sh", "./docker/entrypoint.sh"]