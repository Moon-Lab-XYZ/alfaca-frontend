import type { Metadata } from "next";

import { getSession } from "~/auth"
import "~/app/globals.css";
import { Providers } from "~/app/providers";

export const metadata: Metadata = {
  title: "Farcaster Frames v2 Demo",
  description: "A Farcaster Frames v2 demo app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  console.log(session);

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
