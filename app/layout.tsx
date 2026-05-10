import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "ThesisLab Portal",
  description: "Resumen del proyecto para clientes de ThesisLab"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-[#0B132B] font-sans antialiased text-gray-200">
        {children}
      </body>
    </html>
  );
}
