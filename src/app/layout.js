import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chabon Method",
  description: "The Chabon Method",
  'mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-capable': 'yes',
  'theme-color': '#000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

//<link rel="manifest" href="manifest.json" />
//<link rel="apple-touch-icon" href="chabon.png" />

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
