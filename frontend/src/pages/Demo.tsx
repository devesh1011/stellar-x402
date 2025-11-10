import { useState, useEffect } from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";
import * as StellarWalletsModules from "@creit.tech/stellar-wallets-kit";
import { exact as x402Exact } from "stellar-x402/schemes";
import { WalletSelector } from "../components/WalletSelector";

interface X402Error {
  x402Version: number;
  error: string;
  accepts: X402Requirement[];
}

interface X402Requirement {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  outputSchema: Record<string, unknown>;
}

export default function Demo() {
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [x402Requirement, setX402Requirement] =
    useState<X402Requirement | null>(null);
  const [step, setStep] = useState<"initial" | "payment_required" | "success">(
    "initial"
  );
  const [walletKit, setWalletKit] = useState<StellarWalletsKit | null>(null);
  const [mode, setMode] = useState<"human" | "ai">("human");

  useEffect(() => {
    const initKit = async () => {
      try {
        const modules = [
          new StellarWalletsModules.FreighterModule(),
          new StellarWalletsModules.xBullModule(),
          new StellarWalletsModules.AlbedoModule(),
          new StellarWalletsModules.RabetModule(),
          new StellarWalletsModules.LobstrModule(),
          new StellarWalletsModules.HanaModule(),
          new StellarWalletsModules.HotWalletModule(),
          new StellarWalletsModules.KleverModule(),
        ];

        const kit = new StellarWalletsKit({
          selectedWalletId: "freighter",
          modules,
          network: WalletNetwork.TESTNET,
        });

        setWalletKit(kit);
      } catch (err) {
        console.error("Failed to initialize wallet kit:", err);
      }
    };

    initKit();
  }, []);

  const makeInitialRequest = async () => {
    if (!selectedAddress) {
      setError("Please select a wallet first");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");
    setStep("initial");

    try {
      // First request without payment header
      const res = await fetch(
        "http://server-109839474381.us-central1.run.app/api/protected/data"
      );

      if (res.status === 402) {
        // Handle 402 Payment Required
        const x402Data: X402Error = await res.json();
        console.log("Received x402 error:", x402Data);

        if (x402Data.accepts && x402Data.accepts.length > 0) {
          const requirement = x402Data.accepts[0];
          setX402Requirement(requirement);
          setStep("payment_required");
          setError(
            `Payment Required: ${requirement.maxAmountRequired} stroops to ${requirement.payTo}`
          );
        } else {
          throw new Error("No payment requirements provided");
        }
      } else if (res.ok) {
        // Already paid or no payment required
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
        setStep("success");
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      setError(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      setStep("initial");
    } finally {
      setLoading(false);
    }
  };

  const signAndPay = async () => {
    if (!x402Requirement) {
      setError("No payment requirement available");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!walletKit) {
        throw new Error("Wallet kit not initialized");
      }

      // Get the wallet's public key
      const { address: walletAddress } = await walletKit.getAddress();

      // Step 1: Prepare the unsigned payment header using stellar-x402
      // This handles fetching the account sequence number from Horizon automatically
      const unsignedPayload = await x402Exact.stellar.preparePaymentHeader(
        walletAddress,
        1, // x402Version
        {
          maxAmountRequired: x402Requirement.maxAmountRequired,
          asset: x402Requirement.asset,
          scheme: "exact" as const,
          network: x402Requirement.network as "stellar-testnet" | "stellar",
          resource: x402Requirement.resource,
          description: x402Requirement.description,
          mimeType: x402Requirement.mimeType,
          payTo: x402Requirement.payTo,
          maxTimeoutSeconds: x402Requirement.maxTimeoutSeconds,
        },
        {
          stellarConfig: {
            rpcUrl: "https://soroban-testnet.stellar.org",
          },
        }
      );

      console.log("Unsigned payload:", unsignedPayload);

      // Step 2: Extract the transaction XDR from the unsigned payload
      const transactionXdr = unsignedPayload.payload.transaction;

      // Step 3: Sign the transaction with the wallet
      const signedTransaction = await walletKit.signTransaction(transactionXdr);

      console.log("Signed transaction:", signedTransaction);

      // Extract the XDR from the signed transaction object
      const signedXdr =
        typeof signedTransaction === "string"
          ? signedTransaction
          : signedTransaction.signedTxXdr;

      // Step 4: Build the complete signed payload manually
      // (since wallet has already signed it, we can't use signPaymentHeader)
      const signedPayload = {
        x402Version: unsignedPayload.x402Version,
        scheme: unsignedPayload.scheme,
        network: unsignedPayload.network,
        payload: {
          transaction: signedXdr,
        },
      };

      // Step 5: Encode the payment using the stellar-x402 utility
      const encodedPayment = x402Exact.stellar.encodePayment(signedPayload);

      console.log("Encoded payment:", encodedPayment);

      // Step 6: Send request with X-PAYMENT header containing the encoded payment
      const res = await fetch(
        "http://server-109839474381.us-central1.run.app/api/protected/data",
        {
          method: "GET",
          headers: {
            "X-PAYMENT": encodedPayment,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`HTTP ${res.status}: ${res.statusText} - ${errorData}`);
      }

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStep("success");
      setX402Requirement(null);
    } catch (err) {
      setError(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8 pt-20">
        {/* Header with Toggle Switch */}
        <div className="flex items-start justify-between gap-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              X.402 Payment Demo
            </h1>
            <p className="text-gray-600 text-lg">
              Demonstrating Stellar-powered payment protocol for API access
            </p>
          </div>

          {/* Mode Toggle Switch */}
          <div className="flex items-center gap-3 bg-white rounded-lg shadow p-4">
            <span
              className={`font-semibold transition-colors ${
                mode === "human" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Human
            </span>
            <button
              onClick={() => setMode(mode === "human" ? "ai" : "human")}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                mode === "ai"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  mode === "ai" ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`font-semibold transition-colors ${
                mode === "ai" ? "text-purple-600" : "text-gray-500"
              }`}
            >
              AI Agent
            </span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Wallet Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">1. Select Wallet</h2>
            <WalletSelector
              onWalletSelected={setSelectedAddress}
              selectedAddress={selectedAddress}
            />
          </div>

          {/* Initial Request */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">2. Request Resource</h2>
            <p className="text-gray-600 mb-4">
              Click to request protected data (will receive 402 if payment
              needed)
            </p>

            <button
              onClick={makeInitialRequest}
              disabled={!selectedAddress || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Loading..." : "Request Protected Data"}
            </button>
          </div>

          {/* Payment Step */}
          {step === "payment_required" && x402Requirement && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">
                3. Payment Required
              </h3>
              <div className="space-y-2 mb-4 text-sm text-yellow-800">
                <p>
                  <strong>Amount:</strong> {x402Requirement.maxAmountRequired}{" "}
                  stroops
                </p>
                <p>
                  <strong>Pay To:</strong> {x402Requirement.payTo}
                </p>
                <p>
                  <strong>Asset:</strong> {x402Requirement.asset}
                </p>
                <p>
                  <strong>Network:</strong> {x402Requirement.network}
                </p>
              </div>

              <button
                onClick={signAndPay}
                disabled={loading}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Processing..." : "Sign & Send Payment"}
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">Error/Status</p>
              <p className="text-red-700 mt-1 font-mono text-sm">{error}</p>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold mb-2">
                ✓ Protected Data Retrieved
              </p>
              <pre className="bg-white p-3 rounded border border-green-200 overflow-auto max-h-96 text-sm">
                {response}
              </pre>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              How it works
            </h3>
            <ol className="text-blue-800 space-y-2 list-decimal list-inside">
              <li>Select wallet to establish identity</li>
              <li>
                Request protected resource (may receive 402 Payment Required)
              </li>
              <li>If 402 received, payment requirements are shown</li>
              <li>Sign payment transaction using demo keypair</li>
              <li>Send signed payment in X-PAYMENT header</li>
              <li>Server verifies payment and returns protected data</li>
              <li>Facilitator service settles payment on Stellar</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
