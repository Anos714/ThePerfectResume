import type { ReactNode } from "react";
import { Navbar } from "@/features/landing/navbar/navbar";
import { Footer } from "@/features/landing/footer/footer";

export default function LegalLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">{children}</main>
      <Footer />
    </>
  );
}
