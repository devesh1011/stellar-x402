# Stellar x402

<div align="center">

**HTTP 402 Payment Protocol SDK for Stellar Blockchain**

[![npm version](https://img.shields.io/npm/v/stellar-x402.svg)](https://www.npmjs.com/package/stellar-x402)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)

[Documentation](#quick-start) • [API Reference](#api-reference) • [Examples](#examples--demo)

</div>

---

## Overview

**Stellar x402** is a TypeScript SDK implementing the [x402 payment protocol](https://github.com/coinbase/x402) for the Stellar blockchain. Enable your APIs to require cryptocurrency payments before serving responses using the standardized HTTP 402 status code.

Built for **machine-to-machine micropayments**, this SDK provides zero-friction payment integration for Node.js and Express applications with automatic payment handling, cryptographic verification, and **fast settlement times**.

> 💰 **Simple & Elegant:** Enable real-time micropayments without payment processors, subscriptions, or API keys. Pay exactly for what you use.

## Use Cases

| Use Case | Description |
|----------|-------------|
| **Pay-per-API-Call** | Monetize APIs without subscriptions or rate limits |
| **AI Agent Payments** | Enable autonomous agents to pay for resources |
| **Metered Services** | Charge exactly for what's consumed in real-time |
| **Micropayments** | Enable sub-cent transactions economically |
| **Decentralized Access** | Replace API keys with cryptographic payments |

## Quick Start

### Installation

```bash
npm install stellar-x402
```

### Requirements

- **Node.js:** 20.0.0 or higher
- **TypeScript:** 5.x (recommended)
- **Stellar SDK:** 13.0.0 or higher (included as dependency)

---

## 🛒 Client Integration (Consuming Paid APIs)

Access x402-protected APIs with zero configuration. The `wrapFetchWithPayment` client automatically detects payment requirements, builds transactions, and handles the entire payment flow.

### Basic Usage

```typescript
import { wrapFetchWithPayment } from 'stellar-x402/client-http';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);
const fetchWithPayment = wrapFetchWithPayment(fetch, keypair);

const response = await fetchWithPayment('https://api.example.com/premium/data');

// Access response data
console.log(response.status);
console.log(await response.json());

// Verify payment details
console.log('Headers:', response.headers.get('X-PAYMENT-RESPONSE'));
```

### Supported HTTP Methods

```typescript
// GET with parameters
const response = await fetchWithPayment(
  new Request('https://api.example.com/data?filter=active', {
    method: 'GET'
  })
);

// POST with body
const response = await fetchWithPayment(
  new Request('https://api.example.com/analyze', {
    method: 'POST',
    body: JSON.stringify({ text: 'Content to analyze' }),
    headers: { 'Content-Type': 'application/json' }
  })
);

// PUT, PATCH, DELETE
await fetchWithPayment(new Request(url, { method: 'PUT', body: data }));
await fetchWithPayment(new Request(url, { method: 'PATCH', body: updates }));
await fetchWithPayment(new Request(url, { method: 'DELETE' }));
```

### Configuration Options

```typescript
import { wrapFetchWithPayment } from 'stellar-x402/client-http';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);

// Basic usage with default settings
const fetchWithPayment = wrapFetchWithPayment(fetch, keypair);

// With custom max payment amount (in stroops)
// Default: 1,000,000 stroops = 0.1 USDC
const fetchWithPayment = wrapFetchWithPayment(
  fetch,
  keypair,
  BigInt(5_000_000)  // 0.5 USDC max
);

// Custom configuration
const fetchWithPayment = wrapFetchWithPayment(
  fetch,
  keypair,
  undefined,
  undefined,
  {
    stellarConfig: {
      rpcUrl: 'https://soroban-testnet.stellar.org'
    }
  }
);
```

### How It Works

The client automatically handles the complete payment flow:

1. **Initial Request** - Sends HTTP request to protected endpoint
2. **402 Detection** - Identifies payment requirement from response
3. **Transaction Building** - Constructs Stellar payment transaction
4. **Client Signing** - Signs transaction locally (keys never leave client)
5. **Payment Retry** - Resubmits request with X-PAYMENT header
6. **Settlement** - Server verifies and submits to blockchain
7. **Response** - Receives data after confirmed payment

---

## 💎 Using Axios Client (`x402axios`)

For applications already using Axios, stellar-x402 provides a pre-configured Axios instance with automatic payment handling.

### Getting Started with Axios

```typescript
import { x402axios } from 'stellar-x402/client-axios';
import { Keypair } from '@stellar/stellar-sdk';

// Initialize with your keypair
const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);
x402axios.withSigner({
  publicKey: keypair.publicKey(),
  signTransaction: async (transaction) => {
    // Sign transaction with your keypair
    return keypair.sign(transaction);
  }
});

// Now use it like normal axios - payments happen automatically!
const response = await x402axios.get('https://api.example.com/premium/weather');

// Access response data
console.log(response.data);

// Check payment confirmation
console.log('Payment:', response.headers['x-payment-response']);
```

### All HTTP Methods Supported

```typescript
// GET
const data = await x402axios.get('https://api.example.com/data');

// POST
const result = await x402axios.post('https://api.example.com/analyze', {
  text: 'Content to analyze'
});

// PUT
await x402axios.put('https://api.example.com/resource/123', {
  status: 'updated'
});

// PATCH
await x402axios.patch('https://api.example.com/resource/123', {
  field: 'new_value'
});

// DELETE
await x402axios.delete('https://api.example.com/resource/123');
```

### Multiple Requests with Chaining

```typescript
// Configure once, use for multiple requests
x402axios.withSigner({
  publicKey: keypair.publicKey(),
  signTransaction: async (tx) => keypair.sign(tx)
});

// All these requests share the same signer
const [weather, stocks, news] = await Promise.all([
  x402axios.get('https://api.example.com/weather'),
  x402axios.get('https://api.example.com/stocks'),
  x402axios.get('https://api.example.com/news')
]);

console.log('Weather:', weather.data);
console.log('Stocks:', stocks.data);
console.log('News:', news.data);
```

### Comparison: Fetch vs Axios

| Feature | Fetch | Axios |
|---------|-------|-------|
| **API Style** | Functional (`wrapFetchWithPayment()`) | OOP (`.withSigner()`) |
| **Setup** | Per-request function wrapping | Configure once, reuse |
| **Best For** | Minimal dependencies, edge functions | Large applications, familiar API |
| **Request** | `new Request()` objects | Simple URL strings |
| **Chainable** | No | Yes (`.withSigner().get()`) |
| **Community** | Native, standard | Popular, widely used |

Both methods are equally secure and provide the same payment functionality. Choose based on your application's existing HTTP client patterns.

---

## 🏪 Server Integration (Monetizing Your APIs)

Protect Express.js API routes with x402 middleware - zero payment code required in your route handlers.

### Step 1: Configure Environment

Create `.env` in your project root:

```env
PAYMENT_RECIPIENT_ADDRESS=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
FACILITATOR_URL=https://facilitator.example.com
```

> **Getting a Wallet Address:**  
> Generate with `stellar-x402` or use the Stellar CLI: `stellar account create`

### Step 2: Create Middleware

Create your Express app with x402 payment middleware:

```typescript
import express from 'express';
import { paymentMiddleware } from 'stellar-x402/server';

const app = express();

// Apply payment middleware to protected routes
app.use(
  paymentMiddleware(
    process.env.PAYMENT_RECIPIENT_ADDRESS!,
    {
      '/api/premium/weather': {
        price: '1000000',  // 0.1 USDC
        network: 'stellar-testnet',
        config: {
          description: 'Premium weather data access',
          mimeType: 'application/json'
        }
      },
      '/api/premium/stocks': {
        price: '5000000',  // 0.5 USDC
        network: 'stellar-testnet',
        config: { description: 'Real-time stock data' }
      }
    },
    { 
      url: process.env.FACILITATOR_URL!
    }
  )
);

// Your protected routes
app.get('/api/premium/weather', (req, res) => {
  // Execution only reaches here AFTER successful payment settlement
  
  res.json({
    location: 'San Francisco',
    temperature: 72,
    condition: 'Sunny',
    forecast: '7-day detailed forecast data...'
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Middleware Behavior

| Scenario | Response |
|----------|----------|
| No payment header | **402 Payment Required** with payment instructions |
| Invalid payment | **403 Forbidden** with error details |
| Valid payment | **Verifies → Settles → Executes route → 200 OK** |

### Price Configuration

Stellar uses **stroops** as the smallest unit (like satoshis or wei):

```typescript
1 XLM = 10,000,000 stroops
1 USDC = 10,000,000 stroops (7 decimal places)

Common prices:
  0.001 XLM = 10,000 stroops
  0.01 XLM  = 100,000 stroops
  0.1 XLM   = 1,000,000 stroops
  1 XLM     = 10,000,000 stroops
```

### Testing Your Integration

Start your development server and verify payment protection:

```bash
npm run dev

# Test without payment (should return 402)
curl http://localhost:3000/api/premium/weather
```

Expected 402 response:
```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "stellar-testnet",
    "maxAmountRequired": "1000000",
    "payTo": "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    "description": "Premium weather data access",
    "resource": "http://localhost:3000/api/premium/weather"
  }]
}
```

Test with payment using the client:
```typescript
import { wrapFetchWithPayment } from 'stellar-x402/client-http';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);
const fetchWithPayment = wrapFetchWithPayment(fetch, keypair);

const response = await fetchWithPayment('http://localhost:3000/api/premium/weather');
console.log(await response.json());
```

---

## Architecture

### Protocol Flow

```
┌──────────┐                 ┌──────────┐              ┌────────────┐         ┌────────────┐
│  Client  │                 │   API    │              │ Facilitator│         │  Stellar   │
│  (Buyer) │                 │ (Seller) │              │  Service   │         │ Blockchain │
└────┬─────┘                 └────┬─────┘              └─────┬──────┘         └─────┬──────┘
     │                            │                          │                      │
     │ GET /api/premium/data      │                          │                      │
     │───────────────────────────>│                          │                      │
     │                            │                          │                      │
     │ 402 Payment Required       │                          │                      │
     │<───────────────────────────│                          │                      │
     │ {scheme, amount, payTo}    │                          │                      │
     │                            │                          │                      │
     │ [Build & Sign Transaction] │                          │                      │
     │ (Client-side, offline)     │                          │                      │
     │                            │                          │                      │
     │ GET /api/premium/data      │                          │                      │
     │ X-PAYMENT: <signed_tx>     │                          │                      │
     │───────────────────────────>│                          │                      │
     │                            │                          │                      │
     │                            │ POST /verify             │                      │
     │                            │─────────────────────────>│                      │
     │                            │ {isValid: true}          │                      │
     │                            │<─────────────────────────│                      │
     │                            │                          │                      │
     │                            │ POST /settle             │                      │
     │                            │─────────────────────────>│                      │
     │                            │                          │ Submit Transaction  │
     │                            │                          │────────────────────>│
     │                            │                          │ Confirmed           │
     │                            │                          │<────────────────────│
     │                            │ {success, txHash}        │                      │
     │                            │<─────────────────────────│                      │
     │                            │                          │                      │
     │ 200 OK + Data              │                          │                      │
     │<───────────────────────────│                          │                      │
     │ X-PAYMENT-RESPONSE: {...}  │                          │                      │
     │                            │                          │                      │
```

### Components

| Component | Responsibility | Location |
|-----------|----------------|----------|
| **Client** | Request resources, sign transactions | Your application/agent |
| **Middleware** | Intercept requests, enforce payment | Your Express server |
| **Facilitator** | Verify & settle payments | Shared service or self-hosted |
| **Stellar Blockchain** | Final settlement & verification | Decentralized network |

### Key Design Principles

- **Client-Side Signing** - Private keys never leave the client
- **Stateless Protocol** - No sessions, cookies, or stored state
- **Atomic Operations** - Payment settles or request fails (no partial states)
- **Transparent** - All transactions verifiable on-chain
- **HTTP Native** - Uses standard status codes and headers

---

## API Reference

### Server-Side API

#### `paymentMiddleware()`

Creates Express middleware for x402 payment enforcement.

**Signature:**
```typescript
function paymentMiddleware(
  payTo: string,
  routes: RoutesConfig,
  facilitator?: FacilitatorConfig
): (req: Request, res: Response, next: NextFunction) => Promise<void>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `payTo` | `string` | Stellar wallet address to receive payments |
| `routes` | `RoutesConfig` | Map of route paths to payment configs |
| `facilitator` | `FacilitatorConfig` | Facilitator service configuration |

**RouteConfig:**
```typescript
interface RouteConfig {
  price: string;                           // Amount in stroops
  network?: 'stellar-testnet' | 'stellar'; // Default: 'stellar-testnet'
  config?: {
    description?: string;                  // Human-readable description
    mimeType?: string;                     // Response content type
    outputSchema?: object;                 // Optional JSON schema
    maxTimeoutSeconds?: number;            // Request timeout
  };
}
```

**FacilitatorConfig:**
```typescript
interface FacilitatorConfig {
  url: string;  // Base URL (e.g., 'https://example.com/api/facilitator')
}
```

### Client-Side API

#### `wrapFetchWithPayment()`

Wraps the Fetch API with automatic x402 payment handling.

**Signature:**
```typescript
function wrapFetchWithPayment(
  fetch: typeof globalThis.fetch,
  stellarKeypair: Keypair,
  maxValue?: bigint,
  paymentRequirementsSelector?: typeof selectPaymentRequirements,
  config?: X402Config
): (input: RequestInfo, init?: RequestInit) => Promise<Response>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `fetch` | `typeof globalThis.fetch` | Fetch function to wrap |
| `stellarKeypair` | `Keypair` | Stellar keypair for signing |
| `maxValue` | `bigint` | Max payment in stroops (default: 1,000,000) |
| `paymentRequirementsSelector` | `function` | Custom requirement selector |
| `config` | `X402Config` | Optional configuration |

**Returns:** Wrapped fetch function that handles 402 responses automatically

**Usage:**
```typescript
import { wrapFetchWithPayment } from 'stellar-x402/client-http';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret('SXXX...');
const fetchWithPayment = wrapFetchWithPayment(fetch, keypair);

const response = await fetchWithPayment('https://api.example.com/paid');
```

### TypeScript Types

Import types for full type safety:

```typescript
import type {
  RouteConfig,
  RoutesConfig,
  FacilitatorConfig,
  PaymentRequirements,
  PaymentPayload,
  X402Config,
  Network
} from 'stellar-x402/types';
```

---

## Advanced Usage

### Manual Payment Flow

For full control over the payment process:

```typescript
import { Keypair } from '@stellar/stellar-sdk';

async function manualPaymentFlow(url: string, secretKey: string) {
  // 1. Request without payment
  let response = await fetch(url);
  
  if (response.status === 402) {
    const paymentReqs = await response.json();
    const requirement = paymentReqs.accepts[0];
    
    // 2. Build and sign transaction
    const keypair = Keypair.fromSecret(secretKey);
    // ... build Stellar transaction ...
    
    // 3. Create payment header
    const paymentHeader = transaction.toXDR();
    
    // 4. Retry with payment
    response = await fetch(url, {
      headers: {
        'X-PAYMENT': paymentHeader
      }
    });
  }
  
  return await response.json();
}
```

---

## Examples & Demo

### Example Projects

| Example | Description | Location |
|---------|-------------|----------|
| **Express Server** | Basic middleware setup | [`examples/typescript/`](../../examples/typescript/) |
| **Full Stack** | Complete client + server | [`examples/typescript/fullstack/`](../../examples/typescript/fullstack/) |

### Testing Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, test with the client
npx ts-node examples/test-client.ts
```

---

## FAQ

<details>
<summary><strong>Why use x402 instead of API keys?</strong></summary>

- No secrets to manage, rotate, or leak
- True pay-per-use with no subscriptions
- Decentralized with no auth server
- Instant monetization without payment processors
- Works with any blockchain

</details>

<details>
<summary><strong>How fast are payments?</strong></summary>

| Operation | Time |
|-----------|------|
| Verification | < 100ms |
| Settlement | 3-5 seconds |
| **Total** | **~3-6 seconds** |

*Times depend on Stellar network congestion*

</details>

<details>
<summary><strong>What are the costs?</strong></summary>

| Party | Cost |
|-------|------|
| **Client** | Gas (~$0.00001) + API price |
| **Server** | Facilitator hosting only |
| **Protocol** | Free, open source |

</details>

<details>
<summary><strong>Is this production-ready?</strong></summary>

Yes, with proper testing:
- Start on testnet for development
- Thorough testing before mainnet
- Monitor facilitator health
- Implement error handling

</details>

<details>
<summary><strong>Can I use other blockchains?</strong></summary>

This SDK is Stellar-specific. The x402 protocol supports any blockchain. Other implementations coming soon.

</details>

<details>
<summary><strong>Do I need a blockchain wallet?</strong></summary>

**Sellers:** Need wallet address to receive payments (no private key on server)  
**Buyers:** Need funded wallet to make payments

Generate testnet wallets with:
```bash
stellar account create
```

</details>

<details>
<summary><strong>How do AI agents use this?</strong></summary>

Agents can autonomously make payments:
```typescript
const keypair = Keypair.fromSecret(process.env.AGENT_KEY);
const fetchWithPayment = wrapFetchWithPayment(fetch, keypair);
const data = await fetchWithPayment(apiUrl);
```

No human intervention required.

</details>

<details>
<summary><strong>How do I handle payment failures?</strong></summary>

```typescript
try {
  const response = await fetchWithPayment(url);
  if (response.status === 402) {
    console.log('Payment required but not completed');
  }
} catch (error) {
  console.error('Payment error:', error.message);
}
```

</details>

---

## Resources

### Links
- [GitHub Repository](https://github.com/devesh1011/stellar-x402)
- [NPM Package](https://www.npmjs.com/package/stellar-x402)
- [Stellar Foundation](https://www.stellar.org)

### Support
- [Report Issues](https://github.com/devesh1011/stellar-x402/issues)
- [Discussions](https://github.com/devesh1011/stellar-x402/discussions)

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

---

<div align="center">

**Built for the Stellar Ecosystem**

[Documentation](#quick-start) • [GitHub](https://github.com/devesh1011/stellar-x402) • [NPM](https://www.npmjs.com/package/stellar-x402)

</div>
