import { AlertCircle, Check, Download, Loader2, Power } from "lucide-react";
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
} from "@/shared/components/ui";
import { useLanguage } from "@/shared/hooks/use-language";
import type { CapDisplayData } from "../types";

export function CapCard({
  capData,
  onInstall,
  onUninstall,
  onToggleEnable,
}: {
  capData: CapDisplayData;
  onInstall: () => void;
  onUninstall: () => void;
  onToggleEnable: () => void;
}) {
  const { remote, local, isInstalled, isEnabled, hasUpdate, installedVersion } =
    capData;
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleInstall = async () => {
    setIsLoading(true);
    try {
      if (isInstalled) {
        onUninstall();
      } else {
        onInstall();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEnable = async () => {
    if (isInstalled) {
      onToggleEnable();
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage
            src={`https://avatar.vercel.sh/${remote.name}`}
            alt={remote.name}
          />
          <AvatarFallback>
            {remote.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm truncate">{remote.name}</h3>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {remote.tag}
              </Badge>
              {isInstalled && !isEnabled && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  {t("capStore.card.disabled")}
                </Badge>
              )}
              {hasUpdate && (
                <Badge variant="destructive" className="text-xs">
                  {t("capStore.card.update")}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {remote.description}
          </p>

          {/* Version and metadata info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Download className="size-3" />
              <span>{remote.downloads.toLocaleString()}</span>
            </div>
            {isInstalled && installedVersion ? (
              <span className="text-xs">
                {hasUpdate
                  ? `v${installedVersion} → v${remote.version}`
                  : `v${installedVersion}`}
              </span>
            ) : (
              <span className="text-xs">
                {t("capStore.card.version", { version: remote.version })}
              </span>
            )}
            {remote.author && (
              <span className="text-xs">
                {t("capStore.card.by", { author: remote.author })}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Install/Uninstall button */}
              <Button
                size="sm"
                variant={isInstalled ? "default" : "outline"}
                className="text-xs px-2 py-1 h-6"
                onClick={handleInstall}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : isInstalled ? (
                  <>
                    <Check className="size-3 mr-1" />
                    {t("capStore.card.installed")}
                  </>
                ) : (
                  t("capStore.card.install")
                )}
              </Button>

              {/* Enable/Disable button (only show if installed) */}
              {isInstalled && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs px-2 py-1 h-6"
                  onClick={handleToggleEnable}
                >
                  <Power
                    className={`size-3 ${
                      isEnabled ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                </Button>
              )}

              {/* Update indicator */}
              {hasUpdate && <AlertCircle className="size-3 text-orange-500" />}
            </div>

            {/* Install date (if installed) */}
            {isInstalled && local?.installDate && (
              <span className="text-xs text-muted-foreground">
                {t("capStore.card.installDate", {
                  date: new Date(local.installDate).toLocaleDateString(),
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
