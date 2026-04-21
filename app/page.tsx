import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            CryptoRunway
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Financial runway modeling for crypto protocols. Plan, simulate, and optimize your treasury with AI-powered insights.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/dashboard">
                Launch the Tool
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
              <Link href="https://github.com/hewi333/roughrunway" target="_blank">
                View on GitHub
              </Link>
            </Button>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Powered by Perplexity</h2>
            <p className="text-gray-600 mb-6">
              CryptoRunway leverages Perplexity's Sonar API to provide real-time market insights and AI-powered scenario analysis for crypto treasuries.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Real-time Modeling</h3>
                <p className="text-gray-600 text-sm">
                  Instantly model your runway with complex treasury compositions
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Scenarios</h3>
                <p className="text-gray-600 text-sm">
                  Create custom scenarios with natural language using Perplexity
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Shareable Models</h3>
                <p className="text-gray-600 text-sm">
                  Export and share your models with team members via URL
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-gray-500 text-sm">
            <p>Built at the Accountant Quits Web3 Hackathon</p>
          </div>
        </div>
      </div>
    </div>
  );
}