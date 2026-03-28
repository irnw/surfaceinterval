// app/lib/block-types.ts
// Shared type definitions for the block editor and renderer

export type ImageLayout =
  | "full"        // full width, same as hero
  | "half-left"   // half width, floats left, text wraps right
  | "half-right"  // half width, floats right, text wraps left
  | "portrait"    // tall crop, centered, ~60% width
  | "pair";       // side by side — used when two consecutive image blocks both have layout="pair"

export interface TextBlock {
  id: string;
  type: "text";
  content: string;
}

export interface ImageBlock {
  id: string;
  type: "image";
  url: string;
  caption?: string;
  layout: ImageLayout;
  alt?: string;
}

export type Block = TextBlock | ImageBlock;

// Helper: generate a simple unique ID for new blocks
export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Helper: parse body from Supabase — handles both old string[] and new Block[] formats
export function parseBody(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return [];
  if (raw.length === 0) return [];

  // Old format: array of strings
  if (typeof raw[0] === "string") {
    return raw
      .filter((s): s is string => typeof s === "string" && s.trim() !== "")
      .map((content) => ({ id: newId(), type: "text" as const, content }));
  }

  // New format: array of block objects
  return raw as Block[];
}

// Helper: serialise blocks for storage (strip IDs would lose reorder state, keep them)
export function serialiseBlocks(blocks: Block[]): Block[] {
  return blocks;
}