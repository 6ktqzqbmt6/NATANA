import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NATANA — Brand Studio",
  description: "NATANA 팀을 위한 7개의 전문 에이전트",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
