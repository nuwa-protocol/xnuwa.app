import { defineBasicExtension } from 'prosekit/basic'
import { defineMarkSpec, union } from 'prosekit/core'
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
import { suggestionMarks } from './suggestions'

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
    // Add our custom suggestion marks to the schema
    defineMarkSpec({ name: 'suggestion_insert', ...(suggestionMarks.suggestion_insert as any) }),
    defineMarkSpec({ name: 'suggestion_delete', ...(suggestionMarks.suggestion_delete as any) }),
  )
}

export type EditorExtension = ReturnType<typeof defineExtension>
