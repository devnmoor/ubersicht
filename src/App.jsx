import { useState } from "react";
import "./App.css";
import Dropzone from "./components/Dropzone";
import SortableList from "./components/SortableList";
import { PDFDocument } from "pdf-lib";

function ext(name = "") {
  return name.split(".").pop()?.toLowerCase();
}
async function fileToBytes(file) {
  return new Uint8Array(await file.arrayBuffer());
}

async function imageFileToPdfBytes(file) {
  const pdfDoc = await PDFDocument.create();
  const bytes = await fileToBytes(file);

  let img;
  const e = ext(file.name);
  if (e === "png") img = await pdfDoc.embedPng(bytes);
  else img = await pdfDoc.embedJpg(bytes); // jpg/jpeg

  const page = pdfDoc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

  return await pdfDoc.save();
}

async function mergeItemsToPdfBytes(items) {
  const out = await PDFDocument.create();

  for (const item of items) {
    const pdfBytes =
      item.kind === "pdf" ? await fileToBytes(item.file) : await imageFileToPdfBytes(item.file);

    const src = await PDFDocument.load(pdfBytes);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }

  return await out.save();
}

function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [items, setItems] = useState([]); // {id, name, kind, file}

  const onFiles = (files) => {
    const mapped = files
      .filter((f) => f.type === "application/pdf" || f.type.startsWith("image/"))
      .map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        kind: f.type === "application/pdf" ? "pdf" : "image",
        file: f,
      }));

    setItems((prev) => [...prev, ...mapped]);
  };

  const onRemove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  const downloadMerged = async () => {
    const merged = await mergeItemsToPdfBytes(items);
    downloadBytes(merged, "merged.pdf");
  };

  return (
    <div className="ub-wrap">
      <div className="ub-panel">
        <div className="ub-title">
          <span style={{ color: "var(--accent)" }}>ubersicht</span>
          <span className="ub-dot" />
        </div>
        <p className="ub-sub">Drop PDFs + images • drag to reorder • download merged PDF</p>

        <div className="ub-drop">
          <Dropzone onFiles={onFiles} />
        </div>

        <div className="ub-sectionTitle">Queue</div>

        {items.length === 0 ? (
          <div className="ub-footer">No files yet.</div>
        ) : (
          <SortableList items={items} setItems={setItems} onRemove={onRemove} />
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <button className="ub-btn ub-btnPrimary" disabled={items.length === 0} onClick={downloadMerged}>
            Download
          </button>
          <button className="ub-btn ub-btnDanger" disabled={items.length === 0} onClick={() => setItems([])}>
            Clear
          </button>
        </div>

        <div className="ub-footer" style={{ marginTop: 10 }}>
          Tip: drop images + PDFs together and reorder them before merging.
        </div>
      </div>
    </div>
  );
}