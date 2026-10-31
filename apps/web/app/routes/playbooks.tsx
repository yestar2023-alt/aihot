import { Link } from "react-router";
import { PLAYBOOKS } from "../content/playbooks";
import { pageMeta } from "../lib/seo";
import { edgeTtl } from "../lib/api.server";
import type { Screen } from "../components/shell/screens";

export const handle: Screen = { tab: "featured", name: "Playbooks" };
export const headers = () => edgeTtl(300);
export function meta() {
  return pageMeta({
    path: "/playbooks", title: "AI Marketing Automation Playbooks",
    description: "Practical, source-led AI marketing workflow guides with steps, prerequisites, evidence checks and limitations.",
  });
}
export default function PlaybookIndex() {
  return (
    <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-8 sm:px-6 lg:pt-12">
      <p className="text-[12px] font-semibold uppercase tracking-[0.19em] text-accent">Practical guides · Source linked</p>
      <h1 className="mt-3 max-w-3xl text-[36px] font-bold leading-[1.13] tracking-tight text-ink sm:text-[48px]">
        AI marketing work you can actually plan.
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-[1.8] text-ink-3">No 100-tool directories, recycled prompts or unexplained automations. Each playbook starts with a marketing task, keeps a human in the loop, and links back to documentation.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {PLAYBOOKS.map(p => (
          <article key={p.slug} className="flex flex-col rounded-panel bg-surface p-6 ring-1 ring-line">
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-3">
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent">{p.category}</span>
              <span>{p.readingMinutes} min read</span>
            </div>
            <h2 className="mt-4 text-[21px] font-semibold leading-snug text-ink">
              <Link to={`/playbooks/${p.slug}`} className="hover:text-accent">{p.title}</Link>
            </h2>
            <p className="mt-3 flex-1 text-[14px] leading-[1.8] text-ink-3">{p.description}</p>
            <p className="mt-4 text-[12px] text-ink-4">Documented approach · Not independently tested</p>
            <Link to={`/playbooks/${p.slug}`} className="mt-4 text-[13px] font-semibold text-accent hover:underline">Read the playbook →</Link>
          </article>
        ))}
      </div>
      <div className="mt-12 rounded-panel bg-bg-sunk p-6 sm:p-8">
        <h2 className="text-[20px] font-semibold text-ink">Follow the source, not just the summary.</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-3">Our guides are original editorial syntheses of publicly available documentation. A documented design is not a claim that the integration was tested. Verify pricing, terms, permissions and feature availability before production use.</p>
        <Link to="/signals" className="mt-4 inline-flex text-[13px] font-semibold text-accent hover:underline">Discover curated Signals →</Link>
      </div>
    </main>
  );
}