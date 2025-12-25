import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grade Calculator",
  description: "A smart grade calculator and graduation eligibility checker.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
