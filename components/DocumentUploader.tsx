"use client";

import { useState, useRef } from "react";
import { deleteDocument } from "@/actions/clone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Document {
  id: string;
  filename: string;
  createdAt: Date;
}

interface DocumentUploaderProps {
  documents: Document[];
  maxDocs?: number;
}

export function DocumentUploader({ documents: initial, maxDocs = 5 }: DocumentUploaderProps) {
  const [docs, setDocs] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (docs.length >= maxDocs) { toast.error(`Max ${maxDocs} documents`); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Upload failed"); return; }
      setDocs((prev) => [...prev, json.document]);
      toast.success("Document uploaded!");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteDocument(id);
    if (result.error) { toast.error(result.error); return; }
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success("Document removed");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {docs.map((doc) => (
          <Badge key={doc.id} variant="secondary" className="gap-1.5 pr-1.5 py-1">
            <span className="max-w-[200px] truncate">{doc.filename}</span>
            <button
              onClick={() => handleDelete(doc.id)}
              className="ml-1 text-muted-foreground hover:text-destructive text-xs leading-none"
              aria-label="Remove"
            >
              ✕
            </button>
          </Badge>
        ))}
      </div>
      {docs.length < maxDocs && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.md,.pdf,.csv,.json"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : `Upload document (${docs.length}/${maxDocs})`}
          </Button>
        </>
      )}
      <p className="text-xs text-muted-foreground">
        Accepted: .txt, .md, .pdf, .csv, .json — max 10 MB each
      </p>
    </div>
  );
}
