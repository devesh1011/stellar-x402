# Quickstart for Buyers

Access x402-protected APIs with zero-configuration automatic payment handling.

## Overview

The `wrapFetchWithPayment` client provides an axios-compatible interface that automatically:

1. Detects 402 Payment Required responses
2. Builds and signs Stellar transactions locally
3. Retries requests with payment headers
4. Returns data + payment receipts

- Key Feature: All signing happens client-side - your private keys never leave your machine.

## Prerequisites

| Requirement        | Details                                  |
| ------------------ | ---------------------------------------- |
| **Node.js**        | 20.0.0+                                  |
| **Stellar Wallet** | With funded balance (testnet or mainnet) |
| **Private Key**    | For transaction signing                  |

> Get free testnet XLM: [stellar.com/testnet-faucet](https://stellar.com/tools/testnet-reset)

## Installation

```bash
npm install stellar-x402
```

## Basic Usage

### Simple GET Request

```typescript
import { wrapFetchWithPayment } from "stellar-x402";

const response = await wrapFetchWithPayment.get(
  "https://api.example.com/premium/weather",
  {
    keypair: process.env.APTOS_PRIVATE_KEY,
  },
);

// Access response data
console.log(response.data);

// Verify payment
console.log("Transaction:", response.paymentInfo?.transactionHash);
console.log("Amount:", response.paymentInfo?.amount);
console.log("Network:", response.paymentInfo?.network);
```

### What Happens Automatically

| Step                      | Description                               |
| ------------------------- | ----------------------------------------- |
| **1. Initial Request**    | Sends GET to protected endpoint           |
| **2. Detect 402**         | Receives payment requirements             |
| **3. Extract Details**    | Parses amount, recipient, network         |
| **4. Build Transaction**  | Constructs Stellar transfer transaction   |
| **5. Sign Locally**       | Signs with your private key (never sent)  |
| **6. Retry with Payment** | Includes X-PAYMENT header                 |
| **7. Settlement**         | Server verifies and settles on blockchain |
| **8. Return Data**        | Receives response + payment receipt       |

## Wallet Setup

### Generate Test Wallet

```bash
# Quick generation
npx tsx -e "import { Keypair } from '@stellar/stellar-sdk'; const acc = Keypair.random(); console.log('Address:', acc.accountAddress.toString()); console.log('Private Key:', acc.privateKey.toString());"
```

Or programmatically:

```typescript
import { Keypair } from "@stellar/stellar-sdk";

const account = Keypair.random();
console.log("Address:", keypair.publicKey().toString());
console.log("Private Key:", keypair.secret().toString());
```

**Next Steps:**

1. Save the private key securely
2. Fund address from [testnet faucet](https://stellar.com/tools/testnet-reset)
3. Verify balance before making requests

## HTTP Methods

### GET with Query Parameters

```typescript
const response = await wrapFetchWithPayment.get(
  "https://api.example.com/data",
  {
    keypair: process.env.APTOS_PRIVATE_KEY,
    params: { city: "SF", units: "metric" },
  },
);
```

### POST with Body

```typescript
const analysis = await wrapFetchWithPayment.post(
  "https://api.example.com/analyze",
  { text: "Content to analyze", lang: "en" },
  { keypair: process.env.APTOS_PRIVATE_KEY },
);
```

### Custom Headers

```typescript
const response = await wrapFetchWithPayment.get(
  "https://api.example.com/data",
  {
    keypair: process.env.APTOS_PRIVATE_KEY,
    headers: {
      "X-Client-Version": "1.0.0",
      Authorization: "Bearer token",
    },
  },
);
```

### PUT, PATCH, DELETE

```typescript
await wrapFetchWithPayment.put("/resource/123", data, { keypair: "0x..." });
await wrapFetchWithPayment.patch("/resource/123", updates, {
  keypair: "0x...",
});
await wrapFetchWithPayment.delete("/resource/123", { keypair: "0x..." });
```

## Instance Configuration

Create a configured instance for reuse:

```typescript
import { wrapFetchWithPayment } from "stellar-x402";

const api = wrapFetchWithPayment.create({
  baseURL: "https://api.example.com",
  timeout: 10000,
  keypair: process.env.APTOS_PRIVATE_KEY,
  headers: {
    "X-Client-ID": "my-app",
  },
});

// Use instance for all requests
const weather = await api.get("/premium/weather");
const stocks = await api.get("/premium/stocks");
```

## Using Stellar Keypair Objects

Alternative to private key strings:

```typescript
import { Keypair, Ed25519PrivateKey } from "@stellar/stellar-sdk";
import { wrapFetchWithPayment } from "stellar-x402";

const privateKey = new Ed25519PrivateKey(process.env.APTOS_PRIVATE_KEY!);
const account = Keypair.fromPrivateKey({ privateKey });

const response = await wrapFetchWithPayment.get(
  "https://api.example.com/premium/data",
  {
    account, // Use account object instead of privateKey string
  },
);
```

## Payment Receipts

Access payment details from the response:

```typescript
const response = await wrapFetchWithPayment.get(
  "https://api.example.com/data",
  {
    keypair: process.env.APTOS_PRIVATE_KEY,
  },
);

if (response.paymentInfo) {
  console.log("Transaction Hash:", response.paymentInfo.transactionHash);
  console.log("Amount (Octas):", response.paymentInfo.amount);
  console.log("Recipient:", response.paymentInfo.recipient);
  console.log("Network:", response.paymentInfo.network);
  console.log("Settled:", response.paymentInfo.settled);
}
```

Verify transactions on [Stellar Explorer](https://explorer.stellar.com/).

## Error Handling

```typescript
import { wrapFetchWithPayment } from "stellar-x402";

try {
  const response = await wrapFetchWithPayment.get(
    "https://api.example.com/premium/data",
    {
      keypair: process.env.APTOS_PRIVATE_KEY,
    },
  );

  console.log("Data:", response.data);
  console.log("Payment TX:", response.paymentInfo?.transactionHash);
} catch (error) {
  if (error.response?.status === 402) {
    console.error("Payment required but failed");
  } else if (error.code === "INSUFFICIENT_BALANCE") {
    console.error("Not enough APT for payment + gas");
  } else {
    console.error("Request failed:", error.message);
  }
}
```

### Common Errors

| Error                    | Cause                            | Solution                |
| ------------------------ | -------------------------------- | ----------------------- |
| **Insufficient Balance** | Not enough APT for payment + gas | Fund wallet from faucet |
| **Invalid Private Key**  | Malformed key format             | Ensure starts with `0x` |
| **Network Errors**       | Cannot reach API/blockchain      | Check connectivity      |
| **Payment Rejected**     | Server validation failed         | Check error details     |

## Advanced Features

### Network Auto-Detection

Automatically uses correct network based on 402 response:

```typescript
// No network configuration needed!
// Detects stellar-testnet, aptos-mainnet, or aptos-devnet automatically
const response = await wrapFetchWithPayment.get(url, { privateKey });
```

### Mixed Free/Paid Endpoints

Handles both seamlessly:

```typescript
// Free endpoint - no payment made
const free = await wrapFetchWithPayment.get("https://api.example.com/free", {
  keypair: process.env.APTOS_PRIVATE_KEY,
});
console.log(free.paymentInfo); // undefined

// Paid endpoint - automatic payment
const paid = await wrapFetchWithPayment.get("https://api.example.com/premium", {
  keypair: process.env.APTOS_PRIVATE_KEY,
});
console.log(paid.paymentInfo); // { transactionHash, amount, ... }
```

## Production Considerations

### Balance Monitoring

```typescript
import { Stellar, StellarConfig, Network } from "@stellar/stellar-sdk";

const aptos = new Stellar(new StellarConfig({ network: Network.TESTNET }));
const balance = await aptos.getKeypairAPTAmount({ accountAddress: address });

if (balance < 1000000) {
  // Less than 0.01 APT
  console.warn("Low balance - top up wallet");
}
```

### Receipt Logging

Store payment receipts for audit trail:

```typescript
const response = await wrapFetchWithPayment.get(url, { privateKey });

if (response.paymentInfo) {
  await database.savePayment({
    txHash: response.paymentInfo.transactionHash,
    amount: response.paymentInfo.amount,
    timestamp: new Date(),
    endpoint: url,
  });
}
```

### Retry Logic

```typescript
async function callWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await wrapFetchWithPayment.get(url, {
        keypair: process.env.APTOS_PRIVATE_KEY,
      });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

## Next Steps

- **[HTTP 402 Protocol](../core-concepts/http-402.md)** - Understand the specification
- **[Quickstart for Sellers](quickstart-sellers.md)** - Build your own paid API
- **[API Reference](../api-reference/server-api.md)** - Complete type definitions
