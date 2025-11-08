import { useState, useEffect } from "react";
import { Keypair } from "@stellar/stellar-sdk";
import {
  StellarWalletsKit,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";
import * as StellarWalletsModules from "@creit.tech/stellar-wallets-kit";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface WalletSelectorProps {
  onWalletSelected: (address: string) => void;
  selectedAddress?: string | null;
}

export function WalletSelector({
  onWalletSelected,
  selectedAddress,
}: WalletSelectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletKit, setWalletKit] = useState<StellarWalletsKit | null>(null);

  // Demo keypair - using fixed secret for consistent address across sessions
  const DEMO_KEYPAIR = Keypair.fromSecret(
    "SBJXNSKXWNFYZWB2XYIWEYXZGYSH6VCEVLDY42I6ZIO5ZJUQEXY33LGM",
  );

  // Initialize Stellar Wallets Kit on mount
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
        console.log("Stellar Wallets Kit initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Stellar Wallets Kit:", error);
      }
    };

    initKit();
  }, []);

  const connectWallet = async () => {
    if (!walletKit) {
      alert("Wallet kit not initialized");
      return;
    }

    setIsConnecting(true);
    try {
      const { address: walletAddress } = await walletKit.getAddress();
      onWalletSelected(walletAddress);
      console.log("Connected to wallet:", walletAddress);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      alert(
        `Failed to connect wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const useDemoWallet = () => {
    onWalletSelected(DEMO_KEYPAIR.publicKey());
  };

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Wallet</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how you want to sign transactions
        </p>
      </div>

      {selectedAddress && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm font-mono text-blue-900">{selectedAddress}</p>
          <p className="text-xs text-blue-700 mt-1">✓ Wallet connected</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          onClick={connectWallet}
          disabled={isConnecting || !walletKit}
          variant="outline"
          className="w-full"
        >
          {isConnecting ? "Connecting..." : "🦊 Connect Wallet"}
        </Button>

        <Button
          onClick={useDemoWallet}
          variant={
            selectedAddress === DEMO_KEYPAIR.publicKey() ? "default" : "outline"
          }
          className="w-full"
        >
          💡 Demo Wallet
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Supports: Freighter, xBull, Albedo, Rabet, Lobstr, Hana, Hot Wallet,
        Klever
      </p>
    </Card>
  );
}
