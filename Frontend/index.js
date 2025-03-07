import WalletConnect from "../components/WalletConnect";
import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <WalletConnect />
      <Dashboard />
    </div>
  );
}
