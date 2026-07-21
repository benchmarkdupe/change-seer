/**
 * Hacker News is a free, official read-only API — no key, permissive terms,
 * excellent freshness. We use it as one real Trend scout and store the raw
 * payload alongside the normalized signal for auditability.
 *
 * Docs: https://github.com/HackerNews/API
 */
const HN_BASE = "https://hacker-news.firebaseio.com/v0";

export interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  descendants?: number;
  by: string;
  time: number;
  type: string;
}

async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { "user-agent": "OpportunityOS/0.1" } });
  if (!res.ok) throw new Error(`HN ${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchTopHNStories(limit = 30): Promise<HNStory[]> {
  const ids = await fetchJSON<number[]>(`${HN_BASE}/topstories.json`);
  const top = ids.slice(0, limit);
  const stories = await Promise.all(
    top.map((id) => fetchJSON<HNStory>(`${HN_BASE}/item/${id}.json`).catch(() => null)),
  );
  return stories.filter((s): s is HNStory => !!s && s.type === "story");
}

/**
 * Turn HN stories into candidate Trend opportunities. We deliberately only
 * derive coarse signal shape here — the ScoringEngine remains the single
 * source of truth for the final score.
 */
export interface NormalizedHNSignal {
  opportunity_key: string;
  scout_id: "hacker_news";
  signal_type: string;
  value: number;
  evidence: string;
  source_url: string | null;
  source_confidence: number;
  raw_payload: HNStory;
}

export function normalizeHN(story: HNStory): NormalizedHNSignal[] {
  const key = `hn-${story.id}`;
  const engagement = Math.min(100, Math.round(((story.descendants ?? 0) / 400) * 100));
  const attention = Math.min(100, Math.round((story.score / 800) * 100));
  return [
    {
      opportunity_key: key,
      scout_id: "hacker_news",
      signal_type: "search_demand",
      value: attention,
      evidence: `${story.score} upvotes on Hacker News front page`,
      source_url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
      source_confidence: 90,
      raw_payload: story,
    },
    {
      opportunity_key: key,
      scout_id: "hacker_news",
      signal_type: "community_engagement",
      value: engagement,
      evidence: `${story.descendants ?? 0} comments — active builder discussion`,
      source_url: `https://news.ycombinator.com/item?id=${story.id}`,
      source_confidence: 85,
      raw_payload: story,
    },
  ];
}
