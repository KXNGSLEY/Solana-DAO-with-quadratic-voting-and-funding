import { useWallet, WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function WalletConnect() {
  const { connected } = useWallet();
  
  return (
    <div className="p-4 flex justify-center">
      <WalletMultiButton />
      {connected && <p className="text-green-500 ml-4">Wallet Connected</p>}
    </div>
  );
}
