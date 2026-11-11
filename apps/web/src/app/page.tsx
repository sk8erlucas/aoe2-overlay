import { Footer } from "@/components/Footer";
import { About } from "@/components/landing/About";
import { Demo } from "@/components/landing/Demo";
import { Hero } from "@/components/landing/Hero";
import { ReplaysShowcase } from "@/components/landing/ReplaysShowcase";
import "@/components/landing/landing.css";
import { api } from "@/lib/api";
import { getMe } from "@/lib/server";
import type { StrategyList } from "@/lib/types";

async function strategyCount(): Promise<number | null> {
  try {
    const list = await api<StrategyList>("/api/strategies?pageSize=1", {
      next: { revalidate: 300 },
    });
    return list.total;
  } catch {
    return null;
  }
}

export default async function Home() {
  const [me, count] = await Promise.all([getMe(), strategyCount()]);
  return (
    <div className="landing">
      <Hero me={me} />
      <Demo />
      <About strategyCount={count} />
      <ReplaysShowcase />
      <Footer />
    </div>
  );
}
