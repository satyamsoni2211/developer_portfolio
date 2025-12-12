import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Satyam Soni | Technical Architect & AI Engineer",
  description:
    "Portfolio of Satyam Soni – Technical Architect specializing in AI, LLMs, and scalable cloud-native systems.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
