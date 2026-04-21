import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CryptoRunway — Treasury runway forecasting for crypto orgs",
  description:
    "Self-serve runway forecasting for small crypto organizations. Two runway numbers (hard + extended), realistic token liquidation, scenario analysis. No login, no backend.",
  keywords: [
    "crypto treasury",
    "runway",
    "forecasting",
    "defi",
    "CFO",
    "token liquidation",
  ],
  openGraph: {
    title: "CryptoRunway",
    description:
      "When do we run out of money? A crypto-native runway tool for CFOs and finance leads.",
    type: "website",
  },
  other: {
    "agent-instructions": "/.well-known/agent-instructions.md",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-primary antialiased">{children}</body>
    </html>
  );
}
