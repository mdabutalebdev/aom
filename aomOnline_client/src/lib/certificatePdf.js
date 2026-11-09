// Generate a real, downloadable PDF from a certificate DOM node.
//
// We rasterize the on-screen certificate with html2canvas-pro (a fork that
// understands Tailwind v4's oklch/lab colors — the original html2canvas throws
// on them) and embed that image into a jsPDF page sized to match. Capturing the
// live DOM means Bangla student/class names render exactly as they do on screen.
//
// jspdf + html2canvas-pro are imported lazily inside the handler so they never
// load during server-side rendering (both touch window/document at import time).

// Shared rasterization step — the ONE place that calls html2canvas-pro, so a
// debug capture and the real download can never drift apart into testing
// different code.
async function rasterize(node) {
  if (!node) throw new Error("Certificate element not found.");
  const html2canvasMod = await import("html2canvas-pro");
  const html2canvas = html2canvasMod.default;
  return html2canvas(node, {
    scale: 2, // sharper output on hi-dpi
    useCORS: true,
    backgroundColor: "#ffffff",
    // Skip any element opted out of the capture (e.g. action buttons).
    ignoreElements: (el) => el?.hasAttribute?.("data-no-pdf"),
  });
}

/**
 * @param {HTMLElement} node - the certificate element to capture
 * @param {string} filename - base name for the downloaded file (no extension)
 */
export async function downloadCertificatePdf(node, filename = "certificate") {
  const [{ jsPDF }, canvas] = await Promise.all([import("jspdf"), rasterize(node)]);

  const imgData = canvas.toDataURL("image/png");

  // Size the PDF page in millimetres to the certificate's own aspect ratio,
  // capped at an A4 long edge (297mm), so it opens at a normal document size
  // instead of the giant pixel-dimension page that made it look zoomed in.
  const ratio = canvas.width / canvas.height;
  const LONG = 297; // mm (A4 long edge)
  let pageW;
  let pageH;
  if (ratio >= 1) {
    pageW = LONG;
    pageH = LONG / ratio;
  } else {
    pageH = LONG;
    pageW = LONG * ratio;
  }
  const orientation = pageW >= pageH ? "landscape" : "portrait";

  const pdf = new jsPDF({ orientation, unit: "mm", format: [pageW, pageH] });
  pdf.addImage(imgData, "PNG", 0, 0, pageW, pageH);
  pdf.save(`${filename || "certificate"}.pdf`);
}

// Generic alias — captures ANY DOM node (certificate, payment receipt, …) into
// a correctly-sized PDF. Same implementation; clearer name at the call site.
export const downloadNodeAsPdf = downloadCertificatePdf;

/**
 * Capture a DOM node as a PNG image and trigger a download. Same rasterization
 * path as the PDF export, so the image matches the on-screen render exactly.
 * @param {HTMLElement} node - the element to capture
 * @param {string} filename - base name for the downloaded file (no extension)
 */
export async function downloadNodeAsImage(node, filename = "image") {
  const canvas = await rasterize(node);
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${filename || "image"}.png`;
  a.click();
}
