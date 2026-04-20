import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CloneCardProps {
  username: string;
  name: string;
  bio?: string | null;
  image?: string | null;
  model: string;
}

export function CloneCard({ username, name, bio, image, model }: CloneCardProps) {
  const shortModel = model.split("-").slice(1, 3).join(" ");

  return (
    <Link href={`/${username}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={image ?? undefined} />
            <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold truncate">{name}</p>
            <p className="text-sm text-muted-foreground truncate">@{username}</p>
          </div>
        </CardHeader>
        <CardContent>
          {bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{bio}</p>}
          <Badge variant="secondary" className="text-xs capitalize">
            {shortModel}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
