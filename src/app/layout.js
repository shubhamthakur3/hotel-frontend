import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "StayNest — Find Your Perfect Stay",
  description:
    "Discover and book the best hotels at unbeatable prices. Premium accommodations with dynamic pricing and instant confirmation.",
  keywords: "hotel booking, accommodation, travel, stay, rooms",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: "var(--font-family)",
                fontSize: "var(--font-sm)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
              },
              success: {
                iconTheme: { primary: "#008a05", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#c13515", secondary: "#fff" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
