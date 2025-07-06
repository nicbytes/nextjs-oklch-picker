import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Oklch Picker in React",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-[#121212] text-black dark:text-white/80">
        {children}
      </body>
    </html>
  );
}
