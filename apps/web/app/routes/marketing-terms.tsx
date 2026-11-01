import { Link } from "react-router";
import { SITE } from "@aihot/site";
import { pageMeta } from "../lib/seo";
import { edgeTtl } from "../lib/api.server";
import type { Screen } from "../components/shell/screens";
export const handle: Screen = { tab: "me", name: "Terms" };
export const headers = () => edgeTtl(300);
export function meta() { return pageMeta({ title: "Terms & Attribution", path: "/terms", description: "Terms and attribution overview for curated AI marketing content.", noindex: true }); }
export default function MarketingTerms() {
  return <main className="mx-auto max-w-[790px] px-4 pb-24 pt-10 sm:px-6 lg:pt-16">
    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">TERMS & ATTRIBUTION</p>
    <h1 className="mt-3 text-[36px] font-bold text-ink">Usage and attribution</h1>
    <p className="mt-4 text-[14px] leading-[1.85] text-ink-3">This is a pre-launch terms draft. Review it alongside the deployed website, contact information and applicable laws before treating it as final legal terms.</p>
    <div className="mt-8 space-y-7 text-[14px] leading-[1.9] text-ink-2">
      <section><h2 className="text-[20px] font-semibold text-ink">Third-party sources</h2><p className="mt-2">Articles, X posts, videos, logos and documentation linked from this site remain the work of their respective authors and rights holders. A link or short editorial summary does not grant anyone permission to republish their full content.</p></section>
      <section><h2 className="text-[20px] font-semibold text-ink">Editorial content</h2><p className="mt-2">Workflows and Playbooks are educational references, not guarantees of performance, regulatory compliance, API access, or fitness for a specific project. Users must verify permissions, costs, provider terms, and the output of AI tools before business use.</p></section>
      <section><h2 className="text-[20px] font-semibold text-ink">Sponsored and affiliate material</h2><p className="mt-2">Any future sponsored placements or affiliate relationships should be clearly labelled at the point of recommendation. The availability of such programs does not change our stated editorial verification standards.</p></section>
      <section><h2 className="text-[20px] font-semibold text-ink">Correction or removal</h2><p className="mt-2">Original creators may request a correction or removal. A verified operator contact mechanism and response process must be configured before public launch.</p></section>
    </div>
    <p className="mt-10 border-t border-line pt-5 text-[12px] text-ink-4">Pre-launch legal draft · {SITE.name}</p>
    <Link className="mt-4 inline-block text-[13px] text-accent underline" to="/privacy">Privacy overview →</Link>
  </main>;
}