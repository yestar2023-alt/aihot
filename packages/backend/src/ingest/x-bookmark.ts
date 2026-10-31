/**
 * Validate and canonicalize a manually bookmarked X/Twitter status URL.
 * No network requests are made here. The returned title is explicitly a placeholder.
 */
export function parseXPostUrl(input: string): { url: string; handle: string; postId: string } {
  let u: URL;
  try { u = new URL(input.trim()); }
  catch { throw new Error("Expected an X/Twitter status URL."); }
  if (u.protocol !== "https:" || !["x.com", "www.x.com", "twitter.com", "www.twitter.com"].includes(u.hostname.toLowerCase())) {
    throw new Error("Only public https://x.com or https://twitter.com status URLs are accepted.");
  }
  if (u.username || u.password || u.port) throw new Error("Unexpected URL credentials or port.");
  const match = /^\/([A-Za-z0-9_]{1,15})\/status\/(\d{6,25})\/?$/.exec(u.pathname);
  if (!match) throw new Error("Expected https://x.com/<handle>/status/<numeric-post-id>.");
  const handle = match[1]!;
  const postId = match[2]!;
  return { url: `https://x.com/${handle}/status/${postId}`, handle, postId };
}
