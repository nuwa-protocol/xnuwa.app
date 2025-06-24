import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@/shared/components/ui";
import { Input } from "@/shared/components/ui";
import { useLanguage } from "@/shared/hooks/use-language";
import { useSearch } from "../hooks/use-search";

export function SearchModal({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { filtered, setQuery, query } = useSearch();

  return (
    <Dialog.Dialog>
      <Dialog.DialogTrigger asChild>{children}</Dialog.DialogTrigger>
      <Dialog.DialogContent
        className="flex flex-col border bg-background p-6 shadow-lg sm:rounded-lg overflow-hidden"
        style={{
          width: "80vw",
          maxWidth: 800,
          height: "80vh",
          maxHeight: 700,
        }}
        aria-describedby={undefined}
      >
        <Dialog.DialogTitle className="sr-only">
          {t("search.searchHistory")}
        </Dialog.DialogTitle>
        <Input
          autoFocus
          placeholder={t("search.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-none border-0 border-b focus-visible:ring-0 focus-visible:border-primary"
        />
        <div className="overflow-y-auto divide-y">
          {filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t("search.noChatsHistory")}
            </div>
          ) : (
            filtered.map((session) => (
              <Dialog.DialogClose asChild key={session.id}>
                <button
                  type="button"
                  className="w-full px-1 py-3 hover:bg-muted rounded flex items-center justify-between border-none"
                  onClick={() => {
                    navigate(`/chat?cid=${session.id}`);
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare
                      size={20}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="text-sm font-medium truncate">
                      {session.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {formatDistanceToNow(new Date(session.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </button>
              </Dialog.DialogClose>
            ))
          )}
        </div>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}
