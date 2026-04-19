import type { Metadata } from "next";

import "@/app/globals.css";
import { env } from "@/shared/config/env";
import { ThemeRegistry } from "@/shared/ui/theme/theme-registry.client";

export const metadata: Metadata = {
  title: "PreProduct",
  description: "Baseline app shell and blocking quality gates for the Active MVP.",
  metadataBase: new URL(env.BASE_URL)
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
