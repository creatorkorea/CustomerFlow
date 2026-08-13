import type { Metadata } from "next";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "CustomerFlow",
  description: "Small business customer workflow management SaaS"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
