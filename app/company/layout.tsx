
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "@/app/globals.css";
import ClientFix from "@/components/ClientFix";
import MainLayout from "@/components/MainLayout";


const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "300", "400", "500", "700", "900"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body
        className={`${roboto.variable} antialiased`}

      >
      <ClientFix/>
      <MainLayout>
        {children}
      </MainLayout>
      </body>
    </html>
  );
}
