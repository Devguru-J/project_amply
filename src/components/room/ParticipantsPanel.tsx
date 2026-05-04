"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { PresenceUser } from "@/lib/realtime";

interface Props {
  users: PresenceUser[];
  currentUserId: string | null;
  djUserId: string | null;
}

export function ParticipantsPanel({ users, currentUserId, djUserId }: Props) {
  return (
    <div className="bezel-shell">
      <div className="bezel-core p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            HERE NOW
          </span>
          <span className="font-mono text-[10px] tabular-nums text-foreground/40">
            {users.length}
          </span>
        </div>
        {users.length === 0 ? (
          <div className="text-xs text-foreground/40 py-4 text-center">아직 아무도 없습니다</div>
        ) : (
          <ul className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {users.map((u) => {
              const isMe = u.user_id === currentUserId;
              const isDj = u.user_id === djUserId;
              return (
                <li key={u.user_id} className="flex items-center gap-2.5">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar_url ?? undefined} alt={u.display_name} />
                      <AvatarFallback>{initials(u.display_name)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-glow ring-2 ring-[#0d0d10]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground/90 truncate">
                      {u.display_name}
                    </div>
                    {(isMe || isDj) && (
                      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-glow">
                        {isDj ? "DJ" : ""}
                        {isDj && isMe ? " · " : ""}
                        {isMe ? "YOU" : ""}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
