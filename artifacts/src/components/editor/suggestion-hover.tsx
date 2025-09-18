import { Check, X } from 'lucide-react'
import { useEditor } from 'prosekit/react'
import { useEffect, useRef, useState } from 'react'
import { acceptSuggestionById, rejectSuggestionById } from './suggestions'

type HoverData = {
  id: string
  reason?: string
  type: 'insert' | 'delete' | 'replace'
  rect: DOMRect
  anchor: HTMLElement
}

export default function SuggestionHoverMenu() {
  const editor = useEditor() as any
  const [hover, setHover] = useState<HoverData | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!editor) return
    const view: any = editor.view
    const root = view?.dom as HTMLElement
    if (!root) return

    // Helper to compute an anchor rect
    const computeRect = (el: HTMLElement): DOMRect => el.getBoundingClientRect()

    // Show menu when user clicks inside a suggestion mark. Hide otherwise.
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      // Keep open when clicking inside the menu itself
      if (target.closest('.sg-hover-menu')) return

      const span = target.closest('span.sg-insert, span.sg-delete') as HTMLElement | null
      if (!span) {
        setHover(null)
        return
      }
      const typeFromSpan: 'insert' | 'delete' = span.classList.contains('sg-insert') ? 'insert' : 'delete'
      const id = span.getAttribute('data-id') || ''
      if (!id) return
      const reason = span.getAttribute('data-reason') || undefined
      const hasInsert = !!root.querySelector(`span.sg-insert[data-id="${id}"]`)
      const hasDelete = !!root.querySelector(`span.sg-delete[data-id="${id}"]`)
      const type: HoverData['type'] = hasInsert && hasDelete ? 'replace' : typeFromSpan
      setHover({ id, reason, type, rect: computeRect(span), anchor: span })
    }

    // Keep menu in sync with caret moves: if selection leaves the current
    // suggestion, hide; if it stays inside, update anchor/position.
    const onSelectionChange = () => {
      setHover((prev) => {
        if (!prev) return null
        const sel = document.getSelection()
        if (!sel) return null
        // Ignore selections outside the editor
        if (!root.contains(sel.anchorNode)) return null
        // Find spans for this id and check containment
        const spans = root.querySelectorAll(
          `span.sg-insert[data-id="${prev.id}"], span.sg-delete[data-id="${prev.id}"]`,
        )
        let containing: HTMLElement | null = null
        for (const n of spans) {
          if (n.contains(sel.anchorNode)) {
            containing = n as HTMLElement
            break
          }
        }
        if (!containing) return null
        return { ...prev, anchor: containing, rect: computeRect(containing) }
      })
    }

    const onScrollOrResize = () => {
      setHover((prev) => {
        if (!prev) return prev
        if (!document.body.contains(prev.anchor)) return null
        return { ...prev, rect: computeRect(prev.anchor) }
      })
    }

    root.addEventListener('click', onClick)
    document.addEventListener('selectionchange', onSelectionChange)
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      root.removeEventListener('click', onClick)
      document.removeEventListener('selectionchange', onSelectionChange)
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [editor])

  if (!editor || !hover) return null

  // Positioning: center horizontally over the hovered span and flip above/below.
  // Use CSS transforms to avoid measuring the menu size.
  const gap = 8
  const centerX = hover.rect.left + hover.rect.width / 2
  const spaceAbove = hover.rect.top
  const spaceBelow = window.innerHeight - hover.rect.bottom
  const placeAbove = spaceAbove > spaceBelow && spaceAbove > 120 // flip if cramped below
  const baseTop = placeAbove ? hover.rect.top : hover.rect.bottom
  const transform = placeAbove
    ? `translate(-50%, calc(-100% - ${gap}px))`
    : `translate(-50%, ${gap}px)`

  return (
    <div
      className="sg-hover-menu fixed z-30"
      style={{ top: `${baseTop}px`, left: `${centerX}px`, transform }}
      ref={menuRef}
    >
      <div className="sg-fade-in relative flex flex-col gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 shadow-lg px-3 py-2 text-sm max-w-sm">
        {/* Arrow pointer */}
        <div
          className={
            'pointer-events-none absolute left-1/2 size-2 -translate-x-1/2 rotate-45 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ' +
            (placeAbove ? ' -bottom-1 border-t-0 border-l-0' : ' -top-1 border-b-0 border-r-0')
          }
        />

        <div className="flex items-start gap-2">
          <span
            className={
              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ' +
              (hover.type === 'insert'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : hover.type === 'delete'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300')
            }
          >
            {hover.type === 'insert' ? 'Insertion' : hover.type === 'delete' ? 'Deletion' : 'Replacement'}
          </span>
          <div className="text-gray-800 dark:text-gray-200 leading-snug">
            {hover.reason?.trim() || (hover.type === 'insert' ? 'Proposed insertion' : hover.type === 'delete' ? 'Proposed deletion' : 'Proposed replacement')}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 text-white px-2.5 py-1.5 text-xs hover:bg-emerald-700"
            onClick={() => {
              editor.exec(acceptSuggestionById(hover.id))
              setHover(null)
              editor.focus()
            }}
          >
            <Check className="size-4" /> Accept
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-rose-600 text-white px-2.5 py-1.5 text-xs hover:bg-rose-700"
            onClick={() => {
              editor.exec(rejectSuggestionById(hover.id))
              setHover(null)
              editor.focus()
            }}
          >
            <X className="size-4" /> Reject
          </button>
        </div>
      </div>
    </div>
  )
}
