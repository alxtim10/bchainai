import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bchainAI",
  description: "Blockchain related chatbot AI",
  icons: {
    icon: '/favico.ico'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Toaster
          position="bottom-center"
          reverseOrder={false}
          containerStyle={{
            bottom: 148
          }}
          toastOptions={{
            style: {
              fontSize: '12px'
            }
          }}
        />
        {children}
      </body>
    </html>
  );
}
