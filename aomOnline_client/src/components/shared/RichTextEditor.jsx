"use client";

import React, { useEffect, useRef } from "react";
import { FiBold, FiItalic, FiUnderline } from "react-icons/fi";

// Colour swatches offered in the toolbar.
const COLORS = [
  { name: "Black", value: "#111827" },
  { name: "Green", value: "#046c4e" },
  { name: "Red", value: "#dc2626" },
  { name: "Blue", value: "#2563eb" },
  { name: "Orange", value: "#d97706" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Pink", value: "#db2777" },
];

// HTML font sizes (1–7) exposed as friendly labels.
const SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "Huge", value: "7" },
];

/**
 * RichTextEditor — lightweight contentEditable editor with a Bold / Italic /
 * Underline / size / colour toolbar. Emits HTML through onChange. Kept
 * uncontrolled internally so the caret never jumps while typing; external
 * `value` is only written in when it differs from what's on screen.
 */
const RichTextEditor = ({ value = "", onChange, placeholder = "Write a message…" }) => {
  const ref = useRef(null);
  const lastValue = useRef("");

  useEffect(() => {
    if (
      ref.current &&
      value !== lastValue.current &&
      value !== ref.current.innerHTML
    ) {
      ref.current.innerHTML = value || "";
      lastValue.current = value || "";
    }
  }, [value]);

  const emit = () => {
    let html = ref.current?.innerHTML || "";
    // Normalize the "empty but has a stray <br>" case to a clean empty string.
    if (html === "<br>" || html === "<div><br></div>") html = "";
    lastValue.current = html;
    onChange?.(html);
  };

  // Run a formatting command without letting the toolbar steal the selection.
  const exec = (command, arg) => {
    ref.current?.focus();
    // eslint-disable-next-line deprecation/deprecation
    document.execCommand(command, false, arg);
    emit();
  };

  const btnClass =
    "flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-primary-700 transition-colors hover:bg-primary-100";

  return (
    <div className="rounded-[var(--radius-lg)] border border-primary-200 bg-surface focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-1 border-b border-primary-100 px-2 py-1.5"
        // Keep the editor's text selection while interacting with the toolbar.
        onMouseDown={(e) => e.preventDefault()}
      >
        <button type="button" className={btnClass} title="Bold" onClick={() => exec("bold")}>
          <FiBold />
        </button>
        <button type="button" className={btnClass} title="Italic" onClick={() => exec("italic")}>
          <FiItalic />
        </button>
        <button
          type="button"
          className={btnClass}
          title="Underline"
          onClick={() => exec("underline")}
        >
          <FiUnderline />
        </button>

        <span className="mx-1 h-5 w-px bg-primary-100" />

        {/* Text size */}
        <select
          aria-label="Text size"
          defaultValue="3"
          onChange={(e) => exec("fontSize", e.target.value)}
          className="h-8 rounded-[var(--radius-md)] border border-primary-200 bg-surface px-2 text-sm text-primary-700 outline-none"
        >
          {SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <span className="mx-1 h-5 w-px bg-primary-100" />

        {/* Colours */}
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              onClick={() => exec("foreColor", c.value)}
              className="h-6 w-6 rounded-full ring-1 ring-inset ring-black/10 transition-transform hover:scale-110"
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        onInput={emit}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        className="min-h-[120px] w-full px-3 py-2.5 text-base leading-relaxed text-primary-900 outline-none [&:empty]:before:text-primary-300 [&:empty]:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
};

export default RichTextEditor;
