import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="grain min-h-[70vh]">
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">{children}</div>
      </main>
      <Footer />
    </>
  );
}
