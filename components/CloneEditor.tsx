"use client";

import { useState } from "react";
import { upsertClone } from "@/actions/clone";
import { CLAUDE_MODELS } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CloneEditorProps {
  initialData?: {
    name: string;
    bio?: string | null;
    systemPrompt: string;
    model: string;
    isPublic: boolean;
  };
}

export function CloneEditor({ initialData }: CloneEditorProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [systemPrompt, setSystemPrompt] = useState(initialData?.systemPrompt ?? "");
  const [model, setModel] = useState(initialData?.model ?? "claude-sonnet-4-6");
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const result = await upsertClone({ name, bio, systemPrompt, model, isPublic });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Cyberclone saved!");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Label>Clone name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your cyberclone's name"
          maxLength={60}
        />
      </div>

      <div className="space-y-1">
        <Label>Bio <span className="text-muted-foreground text-xs">(optional, shown publicly)</span></Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short description of your cyberclone…"
          maxLength={280}
          rows={2}
        />
      </div>

      <div className="space-y-1">
        <Label>System prompt <span className="text-muted-foreground text-xs">(instructions for the AI)</span></Label>
        <Textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are a cyberclone of [your name]. Respond as they would, drawing on their background in…"
          maxLength={4000}
          rows={6}
        />
        <p className="text-xs text-muted-foreground">{systemPrompt.length}/4000</p>
      </div>

      <div className="space-y-1">
        <Label>AI model</Label>
        <Select value={model} onValueChange={(v) => { if (v) setModel(v); }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CLAUDE_MODELS.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="isPublic">Make clone publicly discoverable</Label>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
