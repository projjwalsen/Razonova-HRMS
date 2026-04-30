
import type { Metadata } from "next";
import { Roboto,Montserrat,Poppins } from "next/font/google";
import "./globals.css";
import ClientFix from "@/components/ClientFix";
import ReduxProvider from "@/components/ReduxProvider";
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "300", "400", "500", "700", "900"],
});
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "300", "400", "500", "700", "900"],
});


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
      <ReduxProvider>
      <ClientFix/>

        {children}

      </ReduxProvider>
      </body>
    </html>
  );
}
