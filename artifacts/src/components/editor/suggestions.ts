// Avoid importing prosemirror types to keep deps minimal; use 'any' where needed.
import { Fragment, type Mark, type MarkSpec, type Node as PMNode, Slice } from 'prosemirror-model'

// Mark specs for AI suggestions. Inline-only; inclusive false to avoid mark creep.
export const suggestionMarks: Record<string, MarkSpec> = {
  suggestion_insert: {
    attrs: { id: {}, user: {}, reason: {}, ts: {}, source: { default: 'ai' } },
    inclusive: false,
    excludes: '',
    parseDOM: [
      {
        tag: 'span[data-suggestion="insert"]',
        getAttrs: (dom: Element) => ({
          id: dom.getAttribute('data-id') || undefined,
          user: dom.getAttribute('data-user') || undefined,
          reason: dom.getAttribute('data-reason') || undefined,
          ts: dom.getAttribute('data-ts') || undefined,
          source: dom.getAttribute('data-source') || 'ai',
        }),
      },
    ],
    toDOM(mark) {
      const { id, user, reason, ts, source } = mark.attrs
      return [
        'span',
        {
          'data-suggestion': 'insert',
          'data-id': id,
          'data-user': user,
          'data-reason': reason,
          'data-ts': ts,
          'data-source': source,
          class: 'sg-insert',
        },
        0,
      ] as unknown as HTMLElement
    },
  },
  suggestion_delete: {
    attrs: { id: {}, user: {}, reason: {}, ts: {}, source: { default: 'ai' } },
    inclusive: false,
    excludes: '',
    parseDOM: [
      {
        tag: 'span[data-suggestion="delete"]',
        getAttrs: (dom: Element) => ({
          id: dom.getAttribute('data-id') || undefined,
          user: dom.getAttribute('data-user') || undefined,
          reason: dom.getAttribute('data-reason') || undefined,
          ts: dom.getAttribute('data-ts') || undefined,
          source: dom.getAttribute('data-source') || 'ai',
        }),
      },
    ],
    toDOM(mark) {
      const { id, user, reason, ts, source } = mark.attrs
      return [
        'span',
        {
          'data-suggestion': 'delete',
          'data-id': id,
          'data-user': user,
          'data-reason': reason,
          'data-ts': ts,
          'data-source': source,
          class: 'sg-delete',
        },
        0,
      ] as unknown as HTMLElement
    },
  },
}

// Utility: add a mark to all text within a Fragment
function addMarkToFragment(fragment: Fragment, mark: Mark): Fragment {
  const out: PMNode[] = []
  for (let i = 0; i < fragment.childCount; i++) {
    let child = fragment.child(i)
    if (child.isText || child.isInline) {
      child = child.mark(mark.addToSet(child.marks))
    }
    if (child.content && child.content.size) {
      child = child.copy(addMarkToFragment(child.content, mark))
    }
    out.push(child)
  }
  return Fragment.from(out)
}

function addMarkToSlice(slice: Slice, mark: Mark): Slice {
  return new Slice(addMarkToFragment(slice.content, mark), slice.openStart, slice.openEnd)
}

// Find ranges for a given mark type across the document
function findMarkRanges(doc: PMNode, markType: any) {
  const ranges: Array<{ from: number; to: number }> = []
  doc.descendants((node, pos) => {
    if (node.isText && node.marks.some((m) => m.type === markType)) {
      ranges.push({ from: pos, to: pos + node.text!.length })
    }
  })
  return ranges
}

// Find ranges for a given mark type and id
function findMarkRangesById(doc: PMNode, markType: any, id: string) {
  const ranges: Array<{ from: number; to: number }> = []
  doc.descendants((node, pos) => {
    if (node.isText) {
      const has = node.marks.some((m) => m.type === markType && m.attrs && m.attrs.id === id)
      if (has) {
        ranges.push({ from: pos, to: pos + (node.text?.length || 0) })
      }
    }
  })
  return ranges
}

// true if document currently has any suggestion marks
export function hasSuggestionsInDoc(doc: PMNode) {
  let found = false
  doc.descendants((node) => {
    if (!node.isText) return true
    if (
      node.marks.some(
        (m) => m.type.name === 'suggestion_insert' || m.type.name === 'suggestion_delete',
      )
    ) {
      found = true
      return false
    }
    return true
  })
  return found
}

// Map a character offset within a textblock to an absolute document position.
function blockOffsetToPos(block: PMNode, blockPos: number, charOffset: number): number | null {
  let accumChars = 0
  let pos = blockPos + 1 // first child starts at blockPos + 1
  for (let i = 0; i < block.childCount; i++) {
    const child = block.child(i)
    const childStart = pos
    if (child.isText) {
      const len = child.text?.length ?? 0
      const endChars = accumChars + len
      if (charOffset <= endChars) {
        // inside this text node
        return childStart + (charOffset - accumChars)
      }
      accumChars = endChars
      pos += child.nodeSize
      continue
    }
    // Inline hard_break contributes one char to textContent
    if (child.type && child.type.name === 'hard_break') {
      const endChars = accumChars + 1
      if (charOffset < endChars) {
        return childStart // position at the break
      }
      accumChars = endChars
      pos += child.nodeSize
      continue
    }
    // Other inline nodes: advance pos but do not contribute characters
    pos += child.nodeSize
  }
  // If offset is exactly after the last character
  if (charOffset === accumChars) return pos
  return null
}

// Search within textblocks for the first occurrence of textToReplace that matches optional anchors
function findRangeInDoc(
  doc: PMNode,
  opts: {
    textToReplace: string
    textBefore?: string
    textAfter?: string
  },
): { from: number; to: number } | null {
  let found: { from: number; to: number } | null = null
  doc.descendants((node, pos) => {
    if (found) return false
    if (!node.isTextblock) return true
    const content = node.textContent || ''
    if (!content) return true

    const { textToReplace, textBefore, textAfter } = opts
    if (!textToReplace) return true

    let startIndex = 0
    while (startIndex <= content.length) {
      const idx = content.indexOf(textToReplace, startIndex)
      if (idx < 0) break
      const beforeOK = textBefore ? content.slice(0, idx).endsWith(textBefore) : true
      const afterOK = textAfter
        ? content.slice(idx + textToReplace.length).startsWith(textAfter)
        : true
      if (beforeOK && afterOK) {
        const from = blockOffsetToPos(node, pos, idx)
        const to = blockOffsetToPos(node, pos, idx + textToReplace.length)
        if (from != null && to != null) {
          found = { from, to }
          return false
        }
      }
      startIndex = idx + 1
    }
    return true
  })
  return found
}

// Find an insertion position based on anchors. Prefers the first match.
function findInsertionPos(
  doc: PMNode,
  opts: { textBefore?: string; textAfter?: string },
): number | null {
  let found: number | null = null
  doc.descendants((node, pos) => {
    if (found != null) return false
    if (!node.isTextblock) return true
    const content = node.textContent || ''
    const { textBefore, textAfter } = opts
    if (textBefore) {
      const idx = content.indexOf(textBefore)
      if (idx >= 0) {
        const end = idx + textBefore.length
        const p = blockOffsetToPos(node, pos, end)
        if (p != null) {
          found = p
          return false
        }
      }
    } else if (textAfter) {
      const idx = content.indexOf(textAfter)
      if (idx >= 0) {
        const p = blockOffsetToPos(node, pos, idx)
        if (p != null) {
          found = p
          return false
        }
      }
    }
    return true
  })
  return found
}

export type ApplySuggestionInput = {
  textToReplace: string
  textReplacement: string
  reason?: string
  textBefore?: string
  textAfter?: string
}

// Apply a single AI suggestion: mark deletion and insertion in one transaction.
export function applySuggestion(view: any, s: ApplySuggestionInput, user = 'AI') {
  const { state, dispatch } = view
  const { schema } = state
  const isInsertOnly = (s.textToReplace ?? '').length === 0 && (s.textReplacement ?? '').length > 0
  const isDeleteOnly = (s.textToReplace ?? '').length > 0 && (s.textReplacement ?? '').length === 0
  const isReplace = (s.textToReplace ?? '').length > 0 && (s.textReplacement ?? '').length > 0

  let from = 0
  let to = 0
  if (isInsertOnly) {
    const pos = findInsertionPos(state.doc, s)
    if (pos == null) return false
    from = pos
    to = pos
  } else {
    const range = findRangeInDoc(state.doc, s)
    if (!range) return false
    from = range.from
    to = range.to
  }

  const id = `sg-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6)}`
  const ts = Date.now()
  const insMark = schema.marks.suggestion_insert.create({ id, user, reason: s.reason ?? '', ts, source: 'ai' })
  const delMark = schema.marks.suggestion_delete.create({ id, user, reason: s.reason ?? '', ts, source: 'ai' })

  // Build marked insertion slice (inline-only for v1); may be empty
  let markedInsert: Slice | null = null
  if ((s.textReplacement ?? '') !== '') {
    const insertNode = schema.text(s.textReplacement)
    const insertSlice = new Slice(Fragment.from(insertNode), 0, 0)
    markedInsert = addMarkToSlice(insertSlice, insMark)
  }

  // Build marked deletion slice
  const removedSlice = state.doc.slice(from, to)
  const markedDelete = (to > from) ? addMarkToSlice(removedSlice, delMark) : null

  let tr = state.tr
  if (isInsertOnly && markedInsert) {
    tr = tr.insert(from, markedInsert.content)
  } else if (isDeleteOnly) {
    // Remove original, then re-insert marked deletion to visualize
    tr = tr.replaceRange(from, to, Slice.empty)
    const start = tr.mapping.map(from)
    if (markedDelete) tr = tr.insert(start, markedDelete.content)
  } else {
    // Replace: insert marked insert, and show marked delete just before
    if (!markedInsert) return false
    tr = tr.replaceRange(from, to, markedInsert)
    const start = tr.mapping.map(from)
    if (markedDelete) tr = tr.insert(start, markedDelete.content)
  }
  tr = tr.setMeta('aiSuggestion', true).setMeta('addToHistory', true)

  dispatch(tr)
  view.focus()
  return true
}

// Accept all suggestions: keep insertions, delete deletions
export const acceptAllSuggestions = (state: any, dispatch?: (tr: any) => void) => {
  const { schema } = state
  const ins = schema.marks.suggestion_insert
  const del = schema.marks.suggestion_delete
  if (!ins || !del) return false
  if (!dispatch) return true
  let tr = state.tr

  // Drop insert marks
  for (const r of findMarkRanges(state.doc, ins)) {
    tr = tr.removeMark(r.from, r.to, ins)
  }
  // Delete all delete-marked content (right-to-left)
  const delRanges = findMarkRanges(state.doc, del).sort((a, b) => b.from - a.from)
  for (const r of delRanges) {
    tr = tr.delete(r.from, r.to)
  }
  dispatch(tr.setMeta('aiSuggestionResolve', { action: 'acceptAll' }))
  return true
}

// Reject all suggestions: delete insertions, keep deletions by dropping marks
export const rejectAllSuggestions = (state: any, dispatch?: (tr: any) => void) => {
  const { schema } = state
  const ins = schema.marks.suggestion_insert
  const del = schema.marks.suggestion_delete
  if (!ins || !del) return false
  if (!dispatch) return true
  let tr = state.tr

  // Delete insert-marked content (right-to-left)
  const insRanges = findMarkRanges(state.doc, ins).sort((a, b) => b.from - a.from)
  for (const r of insRanges) {
    tr = tr.delete(r.from, r.to)
  }
  // Drop delete marks
  for (const r of findMarkRanges(state.doc, del)) {
    tr = tr.removeMark(r.from, r.to, del)
  }
  dispatch(tr.setMeta('aiSuggestionResolve', { action: 'rejectAll' }))
  return true
}

// Accept a single suggestion by id (keep insert text, remove delete text)
export function acceptSuggestionById(id: string) {
  return (state: any, dispatch?: (tr: any) => void) => {
    const ins = state.schema.marks.suggestion_insert
    const del = state.schema.marks.suggestion_delete
    if (!ins || !del) return false
    if (!dispatch) return true
    let tr = state.tr
    for (const r of findMarkRangesById(state.doc, ins, id)) {
      tr = tr.removeMark(r.from, r.to, ins)
    }
    const delRanges = findMarkRangesById(state.doc, del, id).sort((a, b) => b.from - a.from)
    for (const r of delRanges) tr = tr.delete(r.from, r.to)
    dispatch(tr.setMeta('aiSuggestionResolve', { id, action: 'accept' }))
    return true
  }
}

// Reject a single suggestion by id (remove insert text, keep delete text)
export function rejectSuggestionById(id: string) {
  return (state: any, dispatch?: (tr: any) => void) => {
    const ins = state.schema.marks.suggestion_insert
    const del = state.schema.marks.suggestion_delete
    if (!ins || !del) return false
    if (!dispatch) return true
    let tr = state.tr
    const insRanges = findMarkRangesById(state.doc, ins, id).sort((a, b) => b.from - a.from)
    for (const r of insRanges) tr = tr.delete(r.from, r.to)
    for (const r of findMarkRangesById(state.doc, del, id)) tr = tr.removeMark(r.from, r.to, del)
    dispatch(tr.setMeta('aiSuggestionResolve', { id, action: 'reject' }))
    return true
  }
}
