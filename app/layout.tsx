import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draw - Collaborative Whiteboard",
  description: "A simple multiplayer whiteboard powered by tldraw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
