# Quickstart for Sellers

Add payment requirements to your Express API in 5 minutes with x402 middleware.

## Prerequisites

| Requirement    | Version           |
| -------------- | ----------------- |
| **Express**    | 4.x or 5.x        |
| **Node.js**    | 18.0.0+           |
| **TypeScript** | 5.x (recommended) |

## Installation

```bash
npm install stellar-x402
```

> The Stellar SDK (`@stellar/stellar-sdk`) is included as a peer dependency.

## Step 1: Configure Wallet Address

You need a Stellar wallet address to receive payments. The private key stays in your wallet - only the address is needed on your server.

### Option A: Use Existing Wallet

If you have [Stellar Wallet](https://wallet.stellar.org/), [Albedo](https://albedo.link/), or [Lobstr Wallet](https://lobstr.co/), copy your public address (starts with `G`).

### Option B: Generate Programmatically

```bash
npx tsx -e "import { Keypair } from '@stellar/stellar-sdk'; const kp = Keypair.random(); console.log('Public:', kp.publicKey()); console.log('Secret:', kp.secret());"
```

## Step 2: Configure Environment

Create `.env` in your project root:

```
PAYMENT_RECIPIENT_ADDRESS=GABCD...WXYZ
FACILITATOR_URL=https://facilitator-109839474381.us-central1.run.app
```

| Variable                    | Description                                     |
| --------------------------- | ----------------------------------------------- |
| `PAYMENT_RECIPIENT_ADDRESS` | Your Stellar wallet address (receives payments) |
| `FACILITATOR_URL`           | Service that handles blockchain operations      |

> **Note:** For production, you can deploy your own facilitator. See [Facilitator Setup](../guides/facilitator-setup.md).

## Step 3: Create Middleware

Create your Express server with x402 middleware:

```typescript
import express from "express";
import { paymentMiddleware } from "stellar-x402/server";

const app = express();

// Apply payment middleware to protected routes
app.use(
  paymentMiddleware(
    process.env.PAYMENT_RECIPIENT_ADDRESS!,
    {
      "/api/premium/data": {
        price: "$0.01", // USDC on Stellar testnet
        network: "stellar-testnet",
        config: {
          description: "Premium data access",
          mimeType: "application/json",
        },
      },
      "/api/premium/report": {
        price: "$0.05",
        network: "stellar-testnet",
        config: {
          description: "Full analytics report",
        },
      },
    },
    {
      url: process.env.FACILITATOR_URL!,
    },
  ),
);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### Configuration Explained

| Field           | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| **Route path**  | Exact API endpoint path (e.g., `/api/premium/data`)    |
| **price**       | Payment amount in USD or stroops                       |
| **network**     | Blockchain network (`'stellar-testnet'` or `'public'`) |
| **description** | Human-readable resource description                    |

### Pricing Reference

Stellar uses **stroops** as the smallest unit (like satoshis or wei):

```
1 XLM = 10,000,000 stroops
1 USDC = 1,000,000 stroops

Common prices with USDC:
  $0.01 equivalent → 10,000 stroops (0.00001 USDC)
  $0.10 equivalent → 100,000 stroops (0.0001 USDC)
  $1.00 equivalent → 1,000,000 stroops (0.001 USDC)
```

## Step 4: Create API Routes

Your API routes require **zero payment logic** - write them as normal:

```typescript
// route.ts
app.get("/api/premium/data", (req, res) => {
  // This code ONLY executes after successful payment

  return res.json({
    data: {
      insights: ["Premium insight 1", "Premium insight 2"],
      charts: ["chart_1.png", "chart_2.png"],
      premium: true,
    },
    timestamp: new Date().toISOString(),
  });
});
```

### Payment Flow

The middleware automatically handles:

1. **No Payment** → Returns 402 with payment instructions
2. **Invalid Payment** → Returns 403 with error details
3. **Valid Payment** → Verifies → Settles → Executes your route → Returns 200

## Step 5: Test Your Setup

### Test Without Payment

```bash
npm run dev

# In another terminal
curl http://localhost:3000/api/premium/data
```

Expected 402 response:

```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "exact",
      "network": "stellar-testnet",
      "maxAmountRequired": "$0.01",
      "payTo": "GABCD...WXYZ",
      "description": "Premium data access",
      "resource": "http://localhost:3000/api/premium/data"
    }
  ]
}
```

If you see this 402 response, your middleware is working correctly!

### Test With Payment

Use the client from [Quickstart for Buyers](quickstart-buyers.md):

```typescript
import { wrapFetchWithPayment } from "stellar-x402/client-http";
import { Keypair } from "@stellar/stellar-sdk";

const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);
const fetchWithPayment = wrapFetchWithPayment(fetch, keypair);

const response = await fetchWithPayment(
  "http://localhost:3000/api/premium/data",
);
const data = await response.json();

console.log(data);
console.log("Paid:", response.headers.get("X-PAYMENT-RESPONSE"));
```

## Response Headers

Successful payments include these headers:

| Header                | Description                            |
| --------------------- | -------------------------------------- |
| `X-PAYMENT-RESPONSE`  | Payment receipt with transaction hash  |
| `X-Verification-Time` | Milliseconds for payment verification  |
| `X-Settlement-Time`   | Milliseconds for blockchain settlement |

## Next Steps

### For Development

- Use testnet for all testing
- Get free testnet XLM from [Stellar Friendbot](https://developers.stellar.org/tools/testnet-reset)
- Enable USDC trustline on testnet account
- Monitor transactions on [Stellar Expert](https://stellar.expert/)

### For Production

1. **Deploy Own Facilitator** - See [Facilitator Setup](../guides/facilitator-setup.md)
2. **Switch to Mainnet** - Change `network: 'public'` in configuration
3. **Monitor Performance** - Track verification and settlement times
4. **Implement Error Handling** - Handle payment failures gracefully

## Additional Resources

- [Quickstart for Buyers](quickstart-buyers.md) - Consume your protected API
- [HTTP 402 Protocol](../core-concepts/http-402.md) - Deep dive into the protocol
- [Facilitator Guide](../guides/facilitator-setup.md) - Self-hosting options
