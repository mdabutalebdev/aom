// Whitelist-based sanitizer for the teacher's rich-text progress message.
// The author is authenticated staff, but the stored HTML is still rendered to
// guardians — so anything executable (scripts, event handlers, url()/javascript:
// in styles, unknown tags) is stripped before it reaches the DOM.

const ALLOWED_TAGS = new Set([
  "B", "STRONG", "I", "EM", "U", "S", "STRIKE", "BR", "P", "DIV", "SPAN",
  "FONT", "UL", "OL", "LI", "H1", "H2", "H3", "H4", "BLOCKQUOTE",
]);

const ALLOWED_STYLE_PROPS = new Set([
  "color", "background-color", "font-size", "font-weight", "font-style",
  "text-decoration", "text-align", "font-family",
]);

// Keep only safe style declarations (no url()/expression()/javascript:).
const cleanStyle = (styleText) => {
  if (!styleText) return "";
  return styleText
    .split(";")
    .map((decl) => decl.trim())
    .filter(Boolean)
    .filter((decl) => {
      const idx = decl.indexOf(":");
      if (idx === -1) return false;
      const prop = decl.slice(0, idx).trim().toLowerCase();
      const val = decl.slice(idx + 1).toLowerCase();
      if (!ALLOWED_STYLE_PROPS.has(prop)) return false;
      if (/url\(|expression\(|javascript:/i.test(val)) return false;
      return true;
    })
    .join("; ");
};

// Recursively copy allowed nodes into `out`, unwrapping disallowed tags but
// keeping their text so nothing the teacher typed is silently lost.
const walk = (node, out) => {
  node.childNodes.forEach((child) => {
    if (child.nodeType === 3 /* text */) {
      out.appendChild(document.createTextNode(child.textContent));
      return;
    }
    if (child.nodeType !== 1 /* element */) return;

    const tag = child.tagName;
    if (!ALLOWED_TAGS.has(tag)) {
      const frag = document.createDocumentFragment();
      walk(child, frag);
      out.appendChild(frag);
      return;
    }

    const el = document.createElement(tag);
    // execCommand emits <font color="" size=""> for colour/size formatting.
    if (tag === "FONT") {
      const color = child.getAttribute("color");
      const size = child.getAttribute("size");
      if (color && !/javascript:/i.test(color)) el.setAttribute("color", color);
      if (size && /^[1-7]$/.test(size)) el.setAttribute("size", size);
    }
    const style = cleanStyle(child.getAttribute("style"));
    if (style) el.setAttribute("style", style);

    walk(child, el);
    out.appendChild(el);
  });
};

/**
 * sanitizeRichText — return a safe HTML string for dangerouslySetInnerHTML.
 * Runs client-side via the DOM; on the server it degrades to plain text.
 */
export const sanitizeRichText = (html) => {
  if (!html || typeof html !== "string") return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    // SSR fallback — strip every tag so only safe text remains.
    return html.replace(/<[^>]*>/g, "");
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  const container = document.createElement("div");
  walk(doc.body, container);
  return container.innerHTML;
};

// True when the message has no visible content (empty, whitespace, or a lone
// <br> that execCommand leaves behind) — used to decide whether to show it.
export const isRichTextEmpty = (html) => {
  if (!html || typeof html !== "string") return true;
  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, "")
    .trim();
  return text.length === 0;
};
