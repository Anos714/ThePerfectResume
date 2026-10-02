import type { ReactNode } from "react";
import { Navbar } from "@/features/landing/navbar/navbar";
import { Footer } from "@/features/landing/footer/footer";

export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
