import "./globals.css";
import Navigation from "@/components/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <Navigation />
        <main className="max-w-screen-xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
