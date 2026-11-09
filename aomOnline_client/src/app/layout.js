import { Hind_Siliguri, Great_Vibes } from "next/font/google";
import "./globals.css";
import ReduxProviderWrapper from "@/components/ReduxProviderWrapper";
import { SettingsProvider } from "@/context/SettingsContext";

// Hind Siliguri — default font.
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

// Great Vibes — elegant script for certificate names + the principal signature.
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
});

export const metadata = {
  title: {
    default: "AOM Online Madrasa",
    template: "%s | AOM Online Madrasa",
  },
  description:
    "AOM Online Madrasa — Pure Quranic and Islamic Education from home. Online madrasa for students of all ages under the guidance of experienced teachers.",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${hindSiliguri.variable} ${greatVibes.variable}`} suppressHydrationWarning>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla adds
          `cz-shortcut-listen`, Grammarly, etc.) inject attributes onto <body>
          before React hydrates, causing a harmless server/client mismatch.
          This only suppresses the warning for the element's own attributes. */}
      <body className="antialiased font-hind" suppressHydrationWarning>
        <ReduxProviderWrapper>
          <SettingsProvider>{children}</SettingsProvider>
        </ReduxProviderWrapper>
      </body>
    </html>
  );
}
