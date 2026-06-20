import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/DashboardLayout";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "نظام إدارة عمليات فنادق راحتي",
  description: "لوحة تحكم العمليات للصيانة والمستودعات واعتمادات المشتريات.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
