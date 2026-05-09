import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CloneCardProps {
  username: string;
  name: string;
  bio?: string | null;
  image?: string | null;
  model: string;
}

const MODEL_COLORS: Record<string, string> = {
  opus: "from-amber-500 to-orange-500",
  sonnet: "from-violet-500 to-indigo-500",
  haiku: "from-emerald-500 to-teal-500",
};

function getModelColor(model: string) {
  const key = Object.keys(MODEL_COLORS).find((k) => model.includes(k));
  return key ? MODEL_COLORS[key] : "from-violet-500 to-indigo-500";
}

function getModelLabel(model: string) {
  if (model.includes("opus")) return "Opus";
  if (model.includes("sonnet")) return "Sonnet";
  if (model.includes("haiku")) return "Haiku";
  return model;
}

export function CloneCard({ username, name, bio, image, model }: CloneCardProps) {
  const gradient = getModelColor(model);
  const modelLabel = getModelLabel(model);

  return (
    <Link href={`/${username}`} className="group block">
      <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200">
        {/* Gradient banner */}
        <div className={`h-16 bg-gradient-to-br ${gradient} opacity-80`} />

        <div className="px-4 pb-4">
          {/* Avatar overlapping banner */}
          <div className="-mt-6 mb-3">
            <Avatar className="h-12 w-12 ring-4 ring-card">
              <AvatarImage src={image ?? undefined} />
              <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-semibold`}>
                {name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div>
            <p className="font-semibold leading-tight">{name}</p>
            <p className="text-xs text-muted-foreground mb-2">@{username}</p>
            {bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{bio}</p>
            )}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white bg-gradient-to-r ${gradient}`}>
              {modelLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
