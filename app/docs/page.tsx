import React from "react";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 dark:text-gray-100">Rough Runway Documentation</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Learn how to use Rough Runway to model your crypto protocol's financial runway
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 dark:text-gray-100">Getting Started</h2>
          <p className="text-gray-600 mb-4 dark:text-gray-300">
            Rough Runway helps you model your crypto protocol's financial runway by simulating different scenarios based on your treasury composition and burn rate.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Start by configuring your treasury in the Treasury panel</li>
            <li>Set up your burn categories in the Burn panel</li>
            <li>Add inflow categories in the Inflows panel</li>
            <li>Create scenarios to test different market conditions</li>
            <li>Analyze the projections to understand your runway</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 mb-3 dark:text-gray-100">Treasury Configuration</h3>
            <p className="text-gray-600 mb-4 dark:text-gray-300">
              In the Treasury panel, you can configure your protocol's assets:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Stablecoins (USDC, USDT, DAI, etc.)</li>
              <li>Fiat currencies</li>
              <li>Volatile assets (ETH, BTC, native tokens, etc.)</li>
            </ul>
            <p className="text-gray-600 mt-4 dark:text-gray-300">
              For volatile assets, you can specify liquidity profiles that affect how they can be liquidated.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 mb-3 dark:text-gray-100">Scenario Modeling</h3>
            <p className="text-gray-600 mb-4 dark:text-gray-300">
              Scenarios allow you to test different market conditions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Bear market conditions</li>
              <li>Bull market conditions</li>
              <li>Increased burn rates</li>
              <li>New funding rounds</li>
            </ul>
            <p className="text-gray-600 mt-4 dark:text-gray-300">
              Each scenario can override specific parameters to see how they affect your runway.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-8 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 dark:text-gray-100">Understanding the Projections</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Hard Runway</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Based on liquid assets only (stablecoins and fiat). This represents the most conservative estimate of your runway.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Extended Runway</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Includes volatile assets at their haircut value. This represents a more optimistic but still conservative estimate.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Liquidity Constraints</h3>
              <p className="text-gray-600 dark:text-gray-300">
                The model will highlight months where liquidity constraints might affect your ability to meet obligations.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-8 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 dark:text-gray-100">Export and Share</h2>
          <p className="text-gray-600 dark:text-gray-300">
            You can export your models and share them with team members:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 mt-4 dark:text-gray-300">
            <li>Export models as compressed text files</li>
            <li>Generate shareable URLs for collaboration</li>
            <li>Import models from other team members</li>
          </ul>
        </div>
      </div>
    </div>
  );
}