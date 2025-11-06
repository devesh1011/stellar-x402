import { useState, useEffect } from "react";
import { Keypair } from "@stellar/stellar-sdk";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface WalletSelectorProps {
  onWalletSelected: (keypair: Keypair) => void;
  selectedKeypair?: Keypair | null;
}

export function WalletSelector({
  onWalletSelected,
  selectedKeypair,
}: WalletSelectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [freighterAvailable, setFreighterAvailable] = useState(false);

  // Demo keypair - using fixed secret for consistent address across sessions
  const DEMO_KEYPAIR = Keypair.fromSecret(
    "SBJXNSKXWNFYZWB2XYIWEYXZGYSH6VCEVLDY42I6ZIO5ZJUQEXY33LGM",
  );

  // Check if Freighter is available on mount
  useEffect(() => {
    const checkFreighter = () => {
      // Freighter can be exposed in different ways
      const freighterApi = (window as unknown as { __freighterApi__?: unknown })
        .__freighterApi__;
      const freighterExtension = (window as unknown as { freighter?: unknown })
        .freighter;
      const isBrowserExtensionAvailable =
        !!freighterApi || !!freighterExtension;

      setFreighterAvailable(isBrowserExtensionAvailable);

      console.log("Freighter detection:", {
        freighterApi: !!freighterApi,
        freighterExtension: !!freighterExtension,
        available: isBrowserExtensionAvailable,
      });
    };

    // Check immediately and also after a short delay for slow extensions
    checkFreighter();
    const timeout = setTimeout(checkFreighter, 500);

    return () => clearTimeout(timeout);
  }, []);

  const connectFreighter = async () => {
    setIsConnecting(true);
    try {
      // Try both ways Freighter can be exposed
      let freighter = (window as unknown as { __freighterApi__?: unknown })
        .__freighterApi__;

      if (!freighter) {
        freighter = (window as unknown as { freighter?: unknown }).freighter;
      }

      if (!freighter) {
        alert(
          "Freighter wallet not detected. Please install it from https://www.freighter.app",
        );
        setIsConnecting(false);
        return;
      }

      // Use the Freighter API to get the public key
      const freighterTyped = freighter as {
        getPublicKey: () => Promise<string>;
      };
      const publicKey = await freighterTyped.getPublicKey();

      console.log("Connected to Freighter:", publicKey);
      alert(`Connected to Freighter wallet: ${publicKey.substring(0, 10)}...`);

      // For now, use demo keypair (in production, implement proper signing with Freighter)
      onWalletSelected(DEMO_KEYPAIR);
    } catch (error) {
      console.error("Error connecting to Freighter:", error);
      alert(
        `Failed to connect to Freighter wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const useDemoWallet = () => {
    onWalletSelected(DEMO_KEYPAIR);
  };

  const publicKey = selectedKeypair?.publicKey() || null;

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Wallet</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how you want to sign transactions
        </p>
      </div>

      {publicKey && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm font-mono text-blue-900">{publicKey}</p>
          <p className="text-xs text-blue-700 mt-1">✓ Wallet connected</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          onClick={connectFreighter}
          disabled={isConnecting || !freighterAvailable}
          variant="outline"
          className="w-full"
          title={
            freighterAvailable
              ? "Connect to Freighter wallet"
              : "Freighter wallet not detected"
          }
        >
          {isConnecting
            ? "Connecting..."
            : !freighterAvailable
              ? "🔍 Freighter Not Found"
              : "🦊 Freighter Wallet"}
        </Button>

        <Button
          onClick={useDemoWallet}
          variant={
            publicKey === DEMO_KEYPAIR.publicKey() ? "default" : "outline"
          }
          className="w-full"
        >
          💡 Demo Wallet
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Demo wallet: {DEMO_KEYPAIR.publicKey().substring(0, 10)}...
      </p>
    </Card>
  );
}
