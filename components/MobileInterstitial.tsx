"use client";

import React from "react";
import { Smartphone } from "lucide-react";

export default function MobileInterstitial() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Desktop Experience Required
        </h1>
        
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          CryptoRunway is designed for desktop use with complex financial modeling.
          Please visit this page on a desktop computer to access the full dashboard.
        </p>
        
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Why Desktop?</h2>
          <ul className="mt-4 space-y-2 text-left text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-primary">•</div>
              <p className="ml-2">Complex treasury modeling requires a larger workspace</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-primary">•</div>
              <p className="ml-2">Detailed scenario analysis needs precise controls</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-primary">•</div>
              <p className="ml-2">Interactive charts are optimized for mouse interaction</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}