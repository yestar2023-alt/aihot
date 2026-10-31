/** Public, human-released curated links, not automatic AIHOT news publications. */
export interface PublicSignal {
  id: string;
  title: string;
  summary: string;
  originalUrl: string;
  originalTitle: string;
  sourceName: string;
  releasedAt: string;
  sourcePublishedAt: string | null;
}
export interface SignalFeed { items: PublicSignal[] }
