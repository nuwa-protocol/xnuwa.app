import { ArrowDownRight } from 'lucide-react';
import type { ImageAttrs } from 'prosekit/extensions/image';
import type { ReactNodeViewProps } from 'prosekit/react';
import { ResizableHandle, ResizableRoot } from 'prosekit/react/resizable';
import { type SyntheticEvent, useState } from 'react';

export default function ImageView(props: ReactNodeViewProps) {
  const { setAttrs, node } = props;
  const attrs = node.attrs as ImageAttrs;
  const url = attrs.src || '';

  const [aspectRatio, setAspectRatio] = useState<number | undefined>();

  const handleImageLoad = (event: SyntheticEvent) => {
    const img = event.target as HTMLImageElement;
    const { naturalWidth, naturalHeight } = img;
    const ratio = naturalWidth / naturalHeight;
    if (ratio && Number.isFinite(ratio)) {
      setAspectRatio(ratio);
    }
    if (naturalWidth && naturalHeight && (!attrs.width || !attrs.height)) {
      setAttrs({ width: naturalWidth, height: naturalHeight });
    }
  };

  return (
    <ResizableRoot
      width={attrs.width ?? undefined}
      height={attrs.height ?? undefined}
      aspectRatio={aspectRatio}
      onResizeEnd={(event) => setAttrs(event.detail)}
      data-selected={props.selected ? '' : undefined}
      className="relative flex items-center justify-center box-border overflow-hidden my-2 group max-h-[600px] max-w-full min-h-[64px] min-w-[64px] outline-2 outline-transparent data-selected:outline-blue-500 outline-solid"
    >
      {url && (
        <img
          src={url}
          onLoad={handleImageLoad}
          className="h-full w-full max-w-full max-h-full object-contain"
          aria-label="Image"
        />
      )}
      <ResizableHandle
        className="absolute bottom-0 right-0 rounded-sm m-1.5 p-1 transition bg-gray-900/30 active:bg-gray-800/60 hover:bg-gray-800/60 text-white/50 active:text-white/80 active:translate-x-0.5 active:translate-y-0.5 opacity-0 hover:opacity-100 group-hover:opacity-100 group-data-resizing:opacity-100"
        position="bottom-right"
      >
        <ArrowDownRight className="size-4 block" />
      </ResizableHandle>
    </ResizableRoot>
  );
}
