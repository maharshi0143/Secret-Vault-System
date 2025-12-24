# Secure Vault System

## Overview

This project implements a secure vault system where **fund custody** and **withdrawal authorization** are separated into two on-chain contracts.  
Funds can only be withdrawn after a **valid, single-use authorization** is verified on-chain.

The system is fully reproducible using **Docker** and deploys automatically on a **local blockchain**.

---

## Objective (Task Context)

Many decentralized systems separate responsibility for asset custody and permission validation across multiple on-chain components.  
This project demonstrates a secure multi-contract architecture where permissions are enforced exactly once and state transitions remain correct even under adversarial conditions.

---

## Contracts

### SecureVault
- Holds native blockchain currency (ETH)
- Accepts deposits from any address
- Executes withdrawals only after authorization validation
- Updates internal state before transferring funds
- Emits deposit and withdrawal events
- Never performs cryptographic signature verification

### AuthorizationManager
- Validates off-chain generated withdrawal permissions
- Verifies cryptographic signatures
- Tracks authorization usage on-chain
- Prevents replay attacks (each authorization can be used only once)

The vault relies exclusively on the AuthorizationManager for permission checks.

---

## Authorization Design

Authorizations are generated **off-chain** and signed by a trusted signer.

Each authorization is tightly bound to:
- Vault contract address
- Blockchain network (chain ID)
- Recipient address
- Withdrawal amount
- Unique nonce / authorization ID

This ensures permissions cannot be reused, replayed, or applied in a different context.

---

## Replay Protection

- Every authorization includes a unique identifier
- Once validated, the authorization is permanently marked as consumed
- Reuse attempts revert deterministically
- State transitions occur exactly once per authorization

---

## System Guarantees

- Unauthorized withdrawals are impossible
- Authorizations cannot be reused
- Vault balance never becomes negative
- State updates occur before value transfers
- Cross-contract calls cannot duplicate effects
- Initialization logic cannot be executed more than once

---

## Events & Observability

The system emits events for:
- Deposits
- Authorization consumption
- Successful withdrawals

Failed withdrawal attempts revert with no side effects.

---

## Repository Structure

/
├─ contracts/
│  ├─ SecureVault.sol
│  └─ AuthorizationManager.sol
├─ scripts/
│  └─ deploy.js
├─ tests/
│  └─ system.spec.js
├─ docker/
│  ├─ Dockerfile
│  └─ entrypoint.sh
├─ docker-compose.yml
└─ README.md

---

## Docker Usage

To build and deploy the system locally:

```bash
docker-compose up --build
```

---

## Deployment Flow

When `docker-compose up --build` is executed:

1. A local EVM blockchain is started
2. Smart contracts are compiled
3. Automated tests are executed
4. AuthorizationManager is deployed
5. SecureVault is deployed with the AuthorizationManager address
6. Deployment details are printed to container logs

---

## Deployment Output

After deployment, the following information is printed to logs:

- Network name
- Chain ID
- AuthorizationManager contract address
- SecureVault contract address
- Authorized signer address

This information is visible in the Docker container output during startup.

---

## Environment Variables

Example `.env` configuration:

```
SIGNER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

This key is used only for **local testing** to generate and verify authorizations.

---

## Local Validation

- Automated tests demonstrate:
  - Successful authorized withdrawals
  - Rejection of reused authorizations
- All tests run automatically during container startup

---

## Assumptions and Limitations

- Only native blockchain currency (ETH) is supported
- Authorizations are generated off-chain
- A single trusted signer is assumed
- No frontend is included
- Intended for local evaluation only

---

## Submission Notes

- No deployment to public blockchains is required
- System is fully Dockerized and reproducible
- Security invariants hold under adversarial execution
