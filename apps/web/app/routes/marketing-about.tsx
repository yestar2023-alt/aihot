import { Link } from "react-router";
import { SITE } from "@aihot/site";
import { edgeTtl } from "../lib/api.server";
import { pageMeta } from "../lib/seo";
import type { Screen } from "../components/shell/screens";

export const handle: Screen = { tab: "me", name: "About" };
export const headers = () => edgeTtl(300);
export function meta() {
  return pageMeta({ title: "About the Editorial Process", path: "/about",
    description: "How AI Workflow Fieldbook selects and reviews practical AI workflows for makers and small teams." });
}
const standards = [
  ["Find the original", "We prioritize original creators, technical documentation, repositories, reproducible workflows and firsthand maker experiences over unattributed reposts."],
  ["Check the claim", "We separate what the author says from what can be verified. Dates, metrics, access requirements and feature support are never guessed."],
  ["Make it useful", "Each public Signal connects to a task in Build, Grow or Automate. Playbooks add steps, prerequisites, validation checks, limitations and primary sources."],
  ["Publish deliberately", "Automated collection and ranking happen privately; editorial approval is separate from an explicit public release decision."],
];
export default function AboutMarketing() {
  return (
    <main className="mx-auto max-w-[880px] px-4 pb-24 pt-10 sm:px-6 lg:pt-16">
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-accent">OUR EDITORIAL APPROACH</p>
      <h1 className="mt-3 text-[36px] font-bold leading-tight tracking-tight text-ink sm:text-[48px]">Less discovery work. More real work.</h1>
      <p className="mt-5 text-[16px] leading-[1.85] text-ink-3">{SITE.name} is an English-language field guide for independent makers, creators and small teams using AI to build products, grow distribution and automate repeatable work. We collect candidate sources across X, blogs, repositories and tutorials, then turn only the useful ones into attributed Signals and practical guides.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {standards.map(([title,text]) => (
          <section key={title} className="rounded-panel bg-surface p-6 ring-1 ring-line">
            <h2 className="text-[19px] font-semibold text-ink">{title}</h2>
            <p className="mt-3 text-[14px] leading-[1.8] text-ink-3">{text}</p>
          </section>
        ))}
      </div>
      <section className="mt-12 space-y-4 text-[14px] leading-[1.9] text-ink-2">
        <h2 className="text-[24px] font-bold text-ink">How we handle attribution and testing</h2>
        <p>Curated links point back to the original author or publisher. External articles, threads and videos are not rehosted in full by default. A Playbook based on documentation is labelled as a documented approach; it is not presented as an independently tested workflow.</p>
        <p>Future tool recommendations may contain clearly disclosed affiliate links or sponsorships. Commercial relationships do not convert a vendor's claim into verified evidence, and paid placements must be labelled separately from independent editorial selections.</p>
        <p>Creators and rights holders should be able to request corrections or removal. The site operator must configure a working public contact address before production launch.</p>
      </section>
      <div className="mt-12 flex flex-wrap gap-5 border-t border-line pt-7 text-[14px] font-semibold text-accent">
        <Link to="/playbooks">Explore Playbooks →</Link>
        <Link to="/signals">Read Signals →</Link>
        <Link to="/privacy">Privacy →</Link>
      </div>
    </main>
  );
}