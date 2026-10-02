import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://theperfectresume.app"),
  title: "ThePerfectResume — Build your perfect resume with AI",
  description:
    "A beautifully crafted manual + AI resume builder. Design pixel-perfect resumes in minutes, powered by intelligent suggestions.",
  keywords: [
    "resume builder",
    "AI resume",
    "CV builder",
    "resume templates",
    "ThePerfectResume",
  ],
  openGraph: {
    title: "ThePerfectResume",
    description:
      "A beautifully crafted manual + AI resume builder. Design pixel-perfect resumes in minutes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThePerfectResume — Build your perfect resume with AI",
    description:
      "A beautifully crafted manual + AI resume builder. Design pixel-perfect resumes in minutes.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
