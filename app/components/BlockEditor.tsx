"use client";

import { useRef, useState } from "react";
import { Block, TextBlock, ImageBlock, ImageLayout, newId } from "../lib/block-types";
import { uploadMediaFile, getFilesFromClipboard } from "../lib/media-upload";
import ImageCropper from "./ImageCropper";
import MediaLibrary from "./MediaLibrary";

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

const LAYOUT_OPTIONS: { value: ImageLayout; label: string; hint: string }[] = [
  { value: "full",       label: "Full width",   hint: "Same width as hero image" },
  { value: "half-left",  label: "Half · left",  hint: "Text wraps right" },
  { value: "half-right", label: "Half · right", hint: "Text wraps left" },
  { value: "portrait",   label: "Portrait",     hint: "Tall crop, centered" },
  { value: "pair",       label: "Side by side", hint: "Pair with adjacent image block" },
];

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [draftText, setDraftText] = useState("");
  const [cropTarget, setCropTarget] = useState<{ index: number; src: string } | null>(null);
  const [mediaPickerIndex, setMediaPickerIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ── Long-form text → blocks ──────────────────────────────

  function commitDraftText() {
    if (!draftText.trim()) return;
    // Split on double newline (blank line between paragraphs)
    const paragraphs = draftText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const newBlocks: TextBlock[] = paragraphs.map((content) => ({
      id: newId(),
      type: "text",
      content,
    }));

    onChange([...blocks, ...newBlocks]);
    setDraftText("");
  }

  // ── Block mutations ──────────────────────────────────────

  function updateBlock(index: number, updates: Partial<Block>) {
    const next = [...blocks];
    next[index] = { ...next[index], ...updates } as Block;
    onChange(next);
  }

  function addImageBlock(afterIndex?: number) {
    const block: ImageBlock = { id: newId(), type: "image", url: "", layout: "full", caption: "" };
    const next = [...blocks];
    const insertAt = afterIndex !== undefined ? afterIndex + 1 : next.length;
    next.splice(insertAt, 0, block);
    onChange(next);
  }

  function addTextBlock(afterIndex?: number) {
    const block: TextBlock = { id: newId(), type: "text", content: "" };
    const next = [...blocks];
    const insertAt = afterIndex !== undefined ? afterIndex + 1 : next.length;
    next.splice(insertAt, 0, block);
    onChange(next);
  }

  function removeBlock(index: number) {
    const next = [...blocks];
    next.splice(index, 1);
    onChange(next);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...blocks];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === blocks.length - 1) return;
    const next = [...blocks];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  // ── Drag and drop ────────────────────────────────────────

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) {
      setDraggingIndex(null); setDragOverIndex(null); return;
    }
    const next = [...blocks];
    const [moved] = next.splice(draggingIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
    setDraggingIndex(null); setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDraggingIndex(null); setDragOverIndex(null);
  }

  // ── Image paste ──────────────────────────────────────────

  async function handleImageBlockPaste(e: React.ClipboardEvent, index: number) {
    const files = getFilesFromClipboard(e.nativeEvent);
    if (files.length === 0) return;
    e.preventDefault();
    const url = await uploadMediaFile(files[0]);
    updateBlock(index, { url } as Partial<ImageBlock>);
  }

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="be-root">

      {/* ── Long-form writing area ── */}
      <div className="be-longform">
        <div className="be-longform-head">
          <span className="be-longform-label">Write</span>
          <span className="be-longform-hint">
            Separate paragraphs with a blank line. Click "Add to post" when done.
          </span>
        </div>
        <textarea
          className="be-longform-textarea"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder={"Write freely here.\n\nEach blank line between paragraphs becomes a new paragraph block.\n\nYou can add images between paragraphs using the blocks below."}
          rows={10}
        />
        <div className="be-longform-actions">
          <button
            type="button"
            className="be-add-btn be-add-btn--commit"
            onClick={commitDraftText}
            disabled={!draftText.trim()}
          >
            Add to post ↓
          </button>
          {draftText.trim() && (
            <span className="be-longform-count">
              {draftText.split(/\n\s*\n/).filter((p) => p.trim()).length} paragraph
              {draftText.split(/\n\s*\n/).filter((p) => p.trim()).length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Blocks list ── */}
      {blocks.length === 0 ? (
        <div className="be-empty">
          No blocks yet. Write above and click "Add to post", or add an image block below.
        </div>
      ) : (
        blocks.map((block, index) => (
          <div
            key={block.id}
            className={`be-block ${draggingIndex === index ? "be-block--dragging" : ""} ${dragOverIndex === index && draggingIndex !== index ? "be-block--dragover" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            {/* Controls bar */}
            <div className="be-block-controls">
              <div className="be-drag-handle" title="Drag to reorder">⠿</div>
              <div className="be-move-btns">
                <button type="button" className="be-move-btn" onClick={() => moveUp(index)} disabled={index === 0} title="Move up">▲</button>
                <button type="button" className="be-move-btn" onClick={() => moveDown(index)} disabled={index === blocks.length - 1} title="Move down">▼</button>
              </div>
              <span className="be-block-type">{block.type}</span>
              <button type="button" className="be-remove-btn" onClick={() => removeBlock(index)} title="Remove block">✕</button>
            </div>

            {/* Text block */}
            {block.type === "text" && (
              <textarea
                className="be-text-input"
                value={(block as TextBlock).content}
                onChange={(e) => updateBlock(index, { content: e.target.value })}
                placeholder="Paragraph text…"
                rows={3}
              />
            )}

            {/* Image block */}
            {block.type === "image" && (
              <div className="be-image-block">
                <div className="be-layout-row">
                  {LAYOUT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`be-layout-btn ${(block as ImageBlock).layout === opt.value ? "is-active" : ""}`}
                      onClick={() => updateBlock(index, { layout: opt.value } as Partial<ImageBlock>)}
                      title={opt.hint}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {(block as ImageBlock).url ? (
                  <div className="be-image-preview-wrap">
                    <img src={(block as ImageBlock).url} alt="" className="be-image-preview" />
                    <div className="be-image-preview-actions">
                      <button type="button" className="pef-btn-ghost"
                        onClick={() => setCropTarget({ index, src: (block as ImageBlock).url })}>
                        Crop
                      </button>
                      <button type="button" className="pef-btn-ghost pef-btn-ghost--muted"
                        onClick={() => updateBlock(index, { url: "" } as Partial<ImageBlock>)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="be-image-dropzone" onPaste={(e) => handleImageBlockPaste(e, index)} tabIndex={0}>
                    <span className="be-image-drop-hint">Paste image here, or:</span>
                    <div className="be-image-drop-actions">
                      <button type="button" className="pef-btn-ghost" onClick={() => setMediaPickerIndex(index)}>
                        Choose from library
                      </button>
                      <span className="be-or">or paste URL:</span>
                      <input
                        type="text"
                        className="pef-input"
                        placeholder="https://…"
                        style={{ flex: 1 }}
                        onBlur={(e) => {
                          if (e.target.value) {
                            updateBlock(index, { url: e.target.value } as Partial<ImageBlock>);
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  className="pef-input pef-input--caption"
                  value={(block as ImageBlock).caption ?? ""}
                  onChange={(e) => updateBlock(index, { caption: e.target.value } as Partial<ImageBlock>)}
                  placeholder="Caption (overlays inside image)"
                />
              </div>
            )}

            {/* Insert buttons between blocks */}
            <div className="be-add-row">
              <button type="button" className="be-add-btn" onClick={() => addTextBlock(index)}>+ Text</button>
              <button type="button" className="be-add-btn" onClick={() => addImageBlock(index)}>+ Image</button>
            </div>
          </div>
        ))
      )}

      {/* Bottom add buttons */}
      <div className="be-add-row be-add-row--bottom">
        <button type="button" className="be-add-btn" onClick={() => addTextBlock()}>+ Text block</button>
        <button type="button" className="be-add-btn" onClick={() => addImageBlock()}>+ Image block</button>
      </div>

      {/* Crop modal */}
      {cropTarget && (
        <ImageCropper
          src={cropTarget.src}
          onComplete={(url) => { updateBlock(cropTarget.index, { url } as Partial<ImageBlock>); setCropTarget(null); }}
          onCancel={() => setCropTarget(null)}
        />
      )}

      {/* Media picker modal */}
      {mediaPickerIndex !== null && (
        <div className="pef-modal-overlay" onClick={() => setMediaPickerIndex(null)}>
          <div className="pef-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pef-modal-head">
              <h3>Select image</h3>
              <button type="button" onClick={() => setMediaPickerIndex(null)}>Close</button>
            </div>
            <MediaLibrary selectable onSelect={(url) => {
              updateBlock(mediaPickerIndex, { url } as Partial<ImageBlock>);
              setMediaPickerIndex(null);
            }} />
          </div>
        </div>
      )}
    </div>
  );
}