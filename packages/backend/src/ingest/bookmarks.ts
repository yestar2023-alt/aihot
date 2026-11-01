/**
 * Safe, metadata-only bookmark intake for source discovery. Never scrapes a page or
 * treats a URL as evidence of claims. All source IDs refer to ISOLATED sources.
 */
import { parseXPostUrl } from "./x-bookmark.ts";
export type BookmarkKind = "x" | "github" | "youtube";
export interface SourceBookmark {
  kind: BookmarkKind; canonicalUrl: string; title: string; sourceId: string; sourceName: string;
}
function httpsUrl(input: string): URL {
  if (input.length > 2048) throw new Error("URL is too long.");
  let u: URL;
  try { u = new URL(input.trim()); } catch { throw new Error("Expected a valid HTTPS URL."); }
  if (u.protocol !== "https:" || u.username || u.password || u.port || u.hash) throw new Error("Use a plain HTTPS source URL without credentials, port or fragment.");
  return u;
}
export function parseSourceBookmark(input: string): SourceBookmark {
  const u = httpsUrl(input);
  const host = u.hostname.toLowerCase();
  if (["x.com", "www.x.com", "twitter.com", "www.twitter.com"].includes(host)) {
    const x = parseXPostUrl(input);
    return { kind: "x", canonicalUrl: x.url, title: `X post by @${x.handle} (${x.postId}; content not retrieved)`,
      sourceId: "manual-x-bookmarks", sourceName: "Manual X bookmarks" };
  }
  if (host === "github.com" || host === "www.github.com") {
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2 || !parts.slice(0,2).every(s=>/^[a-zA-Z0-9._-]{1,100}$/.test(s))) {
      throw new Error("Expected a GitHub repository URL.");
    }
    const owner = parts[0]!, repo = parts[1]!;
    if (repo === "." || repo === ".." || owner === "." || owner === "..") throw new Error("Invalid GitHub repository name.");
    let subpath = "";
    if (parts.length === 2) subpath = "";
    else if (parts.length === 4 && ["issues", "pull", "discussions"].includes(parts[2]!) && /^\d{1,15}$/.test(parts[3]!)) {
      subpath = `/${parts[2]}/${parts[3]}`;
    } else if (parts.length === 4 && parts[2] === "releases" && parts[3] === "latest") {
      subpath = "/releases/latest";
    } else if (parts.length >= 5 && parts[2] === "releases" && parts[3] === "tag" && parts.slice(4).every(s=>/^[a-zA-Z0-9._-]{1,100}$/.test(s))) {
      subpath = "/releases/tag/" + parts.slice(4).join("/");
    } else throw new Error("Use a repository, release, issue, pull request or discussion URL.");
    return { kind: "github", canonicalUrl: `https://github.com/${owner}/${repo}${subpath}`,
      title: `GitHub ${owner}/${repo}${subpath} (not independently inspected)`,
      sourceId: "manual-github-bookmarks", sourceName: "Manual GitHub bookmarks" };
  }
  if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    let id: string | null = null;
    if (host === "youtu.be") id = /^\/([a-zA-Z0-9_-]{11})\/?$/.exec(u.pathname)?.[1] ?? null;
    else if (u.pathname === "/watch") id = u.searchParams.get("v");
    else id = /^\/(?:shorts|live)\/([a-zA-Z0-9_-]{11})\/?$/.exec(u.pathname)?.[1] ?? null;
    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) throw new Error("Expected a public YouTube video URL with an 11-character ID.");
    return { kind: "youtube", canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
      title: `YouTube video ${id} (content not retrieved)`,
      sourceId: "manual-youtube-bookmarks", sourceName: "Manual YouTube bookmarks" };
  }
  throw new Error("Supported links: X posts, GitHub repositories/releases/issues, and YouTube videos.");
}
