import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rough Runway - Financial Runway Modeling for Crypto Protocols",
  description:
    "Plan, simulate, and optimize your crypto treasury with AI-powered insights. Built at the Accountant Quits Web3 Hackathon.",
};

// Pre-hydration script — apply the dark class before the first paint so
// the user's theme preference is honored without a flash of unstyled
// content. Mirrors the logic in components/DarkModeToggle.tsx.
const themeInitScript = `(function(){try{var s=localStorage.getItem('darkMode');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s!==null?s==='true':p;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
