import { ArrowRight, Code2, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative">
        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-32 pb-24 max-w-5xl">
          <div className="text-center space-y-8">
            {/* Headline */}
            <h1
              className="text-5xl md:text-6xl tracking-tight leading-tight"
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
            >
              <span className="text-zinc-900">Stellar-native</span>
              <br />
              <span className="text-zinc-900">x402 payment protocol</span>
            </h1>

            {/* Tagline */}
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Monetize your APIs with blockchain micropayments on Stellar.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
              >
                Try Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-200 text-zinc-900 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
              >
                Documentation
              </Link>
            </div>

            {/* Quick Install */}
            <div className="pt-8">
              <p className="text-sm text-zinc-500 mb-3">Install via npm</p>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-900 rounded-lg font-mono text-sm text-zinc-100">
                <span>npm install stellar-x402</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-6 pb-24 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-sm hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Simple Integration</h3>
              <p className="text-zinc-600 text-sm">
                Add payments to your APIs with just a few lines of code. Works
                with Express and other frameworks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-sm hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Settlement</h3>
              <p className="text-zinc-600 text-sm">
                Stellar blockchain provides fast finality with low transaction
                costs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-sm hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Verified</h3>
              <p className="text-zinc-600 text-sm">
                Cryptographic verification ensures payment authenticity without
                exposing private keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
