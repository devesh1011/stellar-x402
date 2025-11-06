import express from "express";
import { verify, settle, type X402Config } from "stellar-x402";
import { Keypair } from "@stellar/stellar-sdk";

const app = express();
app.use(express.json());

// Facilitator keypair (fee sponsor)
const facilitatorKeypair = Keypair.fromSecret(
  "SCRPKQFC3XIOZZOGAW3JH2OKWITV4GQ2WDJPFFSWZEV5N4LF3ODVJ33E",
);

// X402 config
const config: X402Config = {
  stellarConfig: {
    rpcUrl: "https://soroban-testnet.stellar.org",
  },
};

/**
 * POST /verify
 * Verify a payment transaction
 */
app.post("/verify", async (req, res) => {
  try {
    const { paymentPayload, paymentRequirements } = req.body;

    const response = await verify(config, paymentPayload, paymentRequirements);

    res.json(response);
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      error: "verification_error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /settle
 * Settle a verified payment transaction
 */
app.post("/settle", async (req, res) => {
  try {
    const { paymentPayload, paymentRequirements } = req.body;

    const response = await settle(
      config,
      paymentPayload,
      paymentRequirements,
      facilitatorKeypair,
    );

    res.json(response);
  } catch (error) {
    console.error("Settlement error:", error);
    res.status(500).json({
      success: false,
      error: "settlement_error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(3001, () => {
  console.log("✅ Facilitator running on port 3001");
  console.log("Facilitator account:", facilitatorKeypair.publicKey());
});
