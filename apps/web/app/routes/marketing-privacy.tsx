import { Link } from "react-router";
import { SITE } from "@aihot/site";
import { pageMeta } from "../lib/seo";
import { edgeTtl } from "../lib/api.server";
import type { Screen } from "../components/shell/screens";
export const handle: Screen = { tab: "me", name: "Privacy" };
export const headers = () => edgeTtl(300);
export function meta() {
  return pageMeta({ title: "Privacy & Data", path: "/privacy", description: "Privacy overview for the AI Marketer Signal editorial website.", noindex: true });
}
export default function MarketingPrivacy() {
  return <main className="mx-auto max-w-[790px] px-4 pb-24 pt-10 sm:px-6 lg:pt-16">
    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">PRIVACY</p>
    <h1 className="mt-3 text-[36px] font-bold text-ink">Privacy overview</h1>
    <p className="mt-4 text-[14px] leading-[1.85] text-ink-3">This operational overview requires a final review of the actual hosting, analytics, newsletter and contact-service settings before publication as a legal policy. It is intentionally excluded from search indexing until then.</p>
    <div className="mt-8 space-y-7 text-[14px] leading-[1.9] text-ink-2">
      <section><h2 className="text-[20px] font-semibold text-ink">Browsing the site</h2><p className="mt-2">Our hosting and security services may process IP addresses, request metadata and device information to serve pages and prevent abuse. Browser preferences such as theme may be stored locally. Review the deployment provider's retention and jurisdiction before launch.</p></section>
      <section><h2 className="text-[20px] font-semibold text-ink">Newsletter signups</h2><p className="mt-2">The newsletter form is only enabled once a real Buttondown publication is configured. When you submit it, your email goes directly to Buttondown using their hosted form endpoint. Review Buttondown's privacy practices and use the unsubscribe or subscriber-management options in their messages.</p></section>
      <section><h2 className="text-[20px] font-semibold text-ink">External links and analytics</h2><p className="mt-2">Links may open original creators' websites. Those sites have their own policies. Analytics, cookies and affiliate attribution depend on the services enabled at deployment; they must be disclosed accurately and consent requirements reviewed before activation.</p></section>
      <section><h2 className="text-[20px] font-semibold text-ink">Corrections and data requests</h2><p className="mt-2">A working operator contact address must be added to the published legal policy before launch. No request should require publicly posting private information.</p></section>
    </div>
    <p className="mt-10 border-t border-line pt-5 text-[12px] text-ink-4">Pre-launch policy draft · {SITE.name}</p>
    <Link className="mt-4 inline-block text-[13px] text-accent underline" to="/about">About our editorial process →</Link>
  </main>;
}