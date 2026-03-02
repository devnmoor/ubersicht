import { useDropzone } from "react-dropzone";

export default function Dropzone({ onFiles }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    onDrop: (files) => onFiles(files),
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #999",
        padding: 24,
        borderRadius: 12,
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? "Drop files here…" : "Drag & drop PDFs/images here, or click to pick"}
    </div>
  );
}