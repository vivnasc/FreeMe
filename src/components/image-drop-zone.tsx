"use client";

import { useState, useCallback } from "react";

interface Props {
  slideId: string;
  onUploaded: (url: string) => void;
  currentUrl?: string;
}

export function ImageDropZone({ slideId, onUploaded, currentUrl }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("slideId", slideId);

    const res = await fetch("/api/admin/upload-slide-image", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { url } = await res.json();
      setPreview(url);
      onUploaded(url);
    }
    setUploading(false);
  }, [slideId, onUploaded]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  function onPaste(e: React.ClipboardEvent) {
    const file = e.clipboardData.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  function onClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden group cursor-pointer" onClick={onClick}>
        <img src={preview} alt="" className="w-full h-48 object-cover" />
        {uploading && (
          <div className="absolute inset-0 bg-carvao/60 flex items-center justify-center">
            <span className="text-creme text-sm">A enviar...</span>
          </div>
        )}
        <div className="absolute inset-0 bg-carvao/0 group-hover:bg-carvao/40 transition-colors flex items-center justify-center">
          <span className="text-creme text-sm opacity-0 group-hover:opacity-100 transition-opacity">Trocar imagem</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onPaste={onPaste}
      onClick={onClick}
      className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
        dragging
          ? "border-terracota/60 bg-terracota/10"
          : "border-creme/15 hover:border-creme/30"
      }`}
    >
      <p className="text-sm text-creme/40">
        {dragging ? "Larga aqui" : "Arrasta, cola, ou clica"}
      </p>
      <p className="text-[10px] text-creme/20 mt-1">JPG, PNG, WebP</p>
    </div>
  );
}
