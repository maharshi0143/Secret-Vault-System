#!/bin/sh
set -e

echo "Starting Hardhat node..."
npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!
echo "Waiting for Hardhat node to be ready..."
until curl -s http://127.0.0.1:8545 > /dev/null; do
  sleep 1
done
echo "Hardhat node is ready!"

echo "Running Automated Tests..."
npx hardhat test tests/system.spec.js

echo "Starting Deployment..."
npx hardhat run scripts/deploy.js --network localhost

# Keep container alive by waiting for the node process
wait $NODE_PID
