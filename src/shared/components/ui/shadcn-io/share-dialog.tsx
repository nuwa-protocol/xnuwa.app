import * as React from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { toast } from "sonner"

interface ShareLink {
  label: string
  url: string
  id: string
}

interface ShareDialogProps {
  children?: React.ReactNode
  title?: string
  description?: string
  links: ShareLink[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ShareDialog({
  children,
  title = "Share link",
  description = "Anyone who has this link will be able to view this.",
  links,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [copiedStates, setCopiedStates] = React.useState<Record<string, boolean>>({})

  const copyToClipboard = (url: string, label: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedStates(prev => ({ ...prev, [id]: true }))
    toast.success(`${label} link copied to clipboard`)
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }))
    }, 2000)
  }

  const dialogProps = open !== undefined ? { open, onOpenChange } : {}

  return (
    <Dialog {...dialogProps}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {links.map((link) => (
            <div key={link.id} className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor={link.id} className="text-sm font-medium">
                  {link.label}
                </Label>
                <Input
                  id={link.id}
                  value={link.url}
                  readOnly
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="px-3 mt-6"
                onClick={() => copyToClipboard(link.url, link.label, link.id)}
              >
                <span className="sr-only">Copy</span>
                {copiedStates[link.id] ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}