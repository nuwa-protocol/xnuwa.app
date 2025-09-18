import { defineBasicExtension } from 'prosekit/basic'
import { defineMarkSpec, definePlugin, union } from 'prosekit/core'
import {
  defineCodeBlock,
  defineCodeBlockShiki,
} from 'prosekit/extensions/code-block'
import { defineHorizontalRule } from 'prosekit/extensions/horizontal-rule'
import { defineMention } from 'prosekit/extensions/mention'
import { definePlaceholder } from 'prosekit/extensions/placeholder'
import {
  defineReactNodeView,
  type ReactNodeViewComponent,
} from 'prosekit/react'

import CodeBlockView from './code-block-view'
import ImageView from './image-view'
import { defineImageFileHandlers } from './upload-file'
// Suggestion mode plugin for accept/reject suggestions
import {
  suggestionModePlugin,
  suggestionMarks,
} from 'prosemirror-suggestion-mode'

export function defineExtension() {
  return union(
    defineBasicExtension(),
    definePlaceholder({ placeholder: 'Press / for commands...' }),
    defineMention(),
    defineCodeBlock(),
    defineCodeBlockShiki(),
    defineHorizontalRule(),
    defineReactNodeView({
      name: 'codeBlock',
      contentAs: 'code',
      component: CodeBlockView satisfies ReactNodeViewComponent,
    }),
    defineReactNodeView({
      name: 'image',
      component: ImageView satisfies ReactNodeViewComponent,
    }),
    defineImageFileHandlers(),
    // Add suggestion marks to the schema (spread the spec into top-level fields)
    defineMarkSpec({ name: 'suggestion_insert', ...(suggestionMarks.suggestion_insert as any) }),
    defineMarkSpec({ name: 'suggestion_delete', ...(suggestionMarks.suggestion_delete as any) }),
    // Register suggestion mode plugin (hover menu enabled by default)
    definePlugin(() => suggestionModePlugin({
      inSuggestionMode: false, // default off; MCP tools toggle it when needed
      username: 'AI',
    })),
  )
}

export type EditorExtension = ReturnType<typeof defineExtension>
