import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
          <span className="text-2xl">404</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Page Not Found</h1>
        
        <p className="text-gray-600 mb-8 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild>
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}