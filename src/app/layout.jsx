// src/app/layout.jsx
import "./globals.css";
import Navbar from "./components/Navbar";
import { Providers } from "./components/Provider";
import { TimesupProvider } from "./context/TimesupContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <TimesupProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 container mx-auto p-4">{children}</main>
            </div>
          </TimesupProvider>
        </Providers>
      </body>
    </html>
  );
}
