import { insertNode, union } from 'prosekit/core';
import {
  defineFileDropHandler,
  defineFilePasteHandler,
} from 'prosekit/extensions/file';

/**
 * Returns an extension that handles image file uploads when pasting or dropping
 * images into the editor.
 */
export function defineImageFileHandlers() {
  return union(
    defineFilePasteHandler(({ view, file }) => {
      // Only handle image files
      if (!file.type.startsWith('image/')) {
        return false;
      }

      // Convert the image to a URL synchronously (no network request)
      // Note: In the browser main thread, true base64 conversion cannot be synchronous.
      // We return a Blob URL which works as an <img src>. If you strictly need
      // a base64 data URL, use the async `dataUrlUploader` below.
      const base64 = URL.createObjectURL(file);

      // Insert the image node at the current text selection position
      const command = insertNode({
        type: 'image',
        attrs: { src: base64 },
      });
      return command(view.state, view.dispatch, view);
    }),
    defineFileDropHandler(({ view, file, pos }) => {
      // Only handle image files
      if (!file.type.startsWith('image/')) {
        return false;
      }

      // Convert the image to a URL synchronously (no network request)
      const base64 = URL.createObjectURL(file);

      // Insert the image node at the drop position
      const command = insertNode({
        type: 'image',
        attrs: { src: base64 },
        pos,
      });
      return command(view.state, view.dispatch, view);
    }),
  );
}
