import { FileCodeIcon, FileIcon, FileImageIcon, FileTextIcon, FileTypeIcon, XIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export interface Attachment {
    name: string;
    url: string;
    contentType: string;
}

const getFileIcon = (contentType: string, size: number = 14) => {
    if (contentType.startsWith('image/')) {
        return <FileImageIcon size={size} />;
    }
    if (contentType === 'application/pdf') {
        return <FileTypeIcon size={size} />;
    }
    if (
        contentType.startsWith('text/x-') ||
        contentType === 'text/javascript' ||
        contentType === 'application/javascript' ||
        contentType === 'text/typescript' ||
        contentType === 'text/css' ||
        contentType === 'text/html'
    ) {
        return <FileCodeIcon size={size} />;
    }
    if (
        contentType.startsWith('text/') ||
        contentType === 'application/json' ||
        contentType === 'text/markdown'
    ) {
        return <FileTextIcon size={size} />;
    }
    return <FileIcon size={size} />;
};

const getFileTypeLabel = (contentType: string) => {
    if (contentType.startsWith('image/')) return 'Image';
    if (contentType === 'application/pdf') return 'PDF';
    if (contentType === 'text/csv') return 'CSV';
    if (contentType === 'text/markdown') return 'MD';
    if (contentType === 'application/json') return 'JSON';
    if (contentType === 'text/html') return 'HTML';
    if (contentType === 'text/css') return 'CSS';
    if (
        contentType === 'text/javascript' ||
        contentType === 'application/javascript'
    )
        return 'JS';
    if (contentType === 'text/typescript') return 'TS';
    if (contentType === 'text/x-python') return 'PY';
    if (contentType === 'text/x-java') return 'Java';
    if (contentType === 'text/x-c') return 'C';
    if (contentType === 'text/x-cpp') return 'C++';
    if (contentType.startsWith('text/')) return 'Text';
    return 'File';
};

export const PreviewAttachment = ({
    attachment,
    onRemove,
}: {
    attachment: Attachment;
    onRemove?: () => void;
}) => {
    const { name, url, contentType } = attachment;
    const isImage = contentType?.startsWith('image/');
    const fileTypeLabel = getFileTypeLabel(contentType);
    const fileName = name || 'Unknown file';

    return (
        <div
            data-testid="input-attachment-preview"
            className="group relative w-20 h-20 rounded-lg overflow-hidden bg-muted border hover:border-primary/20 transition-colors"
        >
            {isImage ? (
                <img
                    src={url}
                    alt={fileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-2">
                    {getFileIcon(contentType, 20)}
                    <span className="text-[10px] font-medium mt-1 text-center">
                        {fileTypeLabel}
                    </span>
                </div>
            )}

            {onRemove && (
                <Button
                    onClick={onRemove}
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity size-5 p-0 rounded-full"
                    data-testid="remove-attachment"
                >
                    <XIcon size={10} />
                </Button>
            )}

            {/* File name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-[9px] px-1.5 py-1 truncate">
                {fileName}
            </div>
        </div>
    );
};
