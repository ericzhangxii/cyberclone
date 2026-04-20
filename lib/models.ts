export const CLAUDE_MODELS = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (Balanced)" },
  { id: "claude-opus-4-7", label: "Claude Opus 4.7 (Most Capable)" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (Fastest)" },
] as const;

export type ClaudeModel = (typeof CLAUDE_MODELS)[number]["id"];
