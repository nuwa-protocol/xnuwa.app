import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Upload,
  XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui';
import { useAuth } from '@/shared/hooks';
import { type Cap, CapSchema } from '@/shared/types';
import { CapStudioStore } from '../stores';
import type { LocalCap } from '../types';

interface BatchCreateProps {
  onBatchCreate?: (caps: LocalCap[]) => void;
}

// Uploaded Cap format should contain all required fields from CapSchema,
// except for `id` and `authorDID` which are injected here.
type UploadedCapInput = Omit<Cap, 'id' | 'authorDID'>;

export function BatchCreate({ onBatchCreate }: BatchCreateProps) {
  const navigate = useNavigate();
  const { did } = useAuth();
  const { createCap } = CapStudioStore();
  const [uploading, setUploading] = useState(false);
  const [showJsonFormat, setShowJsonFormat] = useState(false);
  const [parsedData, setParsedData] = useState<{
    validCaps: Cap[];
    invalidCaps: { cap: any; error: string }[];
  } | null>(null);
  const [uploadResults, setUploadResults] = useState<{
    success: LocalCap[];
    errors: { cap: any; error: string }[];
  }>({ success: [], errors: [] });
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build a full Cap object by injecting id and authorDID, then validate via CapSchema
  const buildAndValidateCap = (capData: any): Cap => {
    const partial = capData as UploadedCapInput;
    const normalizeAuthorDid = (raw?: string | null): string => {
      if (!raw) return 'did::unknown';
      if (raw.startsWith('did::')) return raw;
      if (raw.startsWith('did:')) return `did::${raw.slice(4)}`;
      return `did::${raw}`;
    };

    const authorDID = normalizeAuthorDid(did);

    const fullCap: Cap = {
      id: `${authorDID}:${partial.idName}`,
      authorDID,
      ...partial,
    } as Cap;

    // Throws if invalid
    CapSchema.parse(fullCap);
    return fullCap;
  };

  const handleBatchUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!did) {
      toast.error('Please sign in to upload caps');
      return;
    }

    setUploading(true);
    setParsedData(null);
    setUploadResults({ success: [], errors: [] });

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate that it's an array
      if (!Array.isArray(data)) {
        throw new Error('File must contain an array of Cap objects');
      }

      const validCaps: Cap[] = [];
      const invalidCaps: { cap: any; error: string }[] = [];

      // Validate each cap without creating them yet
      for (let i = 0; i < data.length; i++) {
        const capData = data[i];
        try {
          const validatedFullCap = buildAndValidateCap(capData);
          validCaps.push(validatedFullCap);
        } catch (error) {
          let errorMessage = 'Invalid cap format';

          if (error instanceof Error) {
            errorMessage = error.message;
          }

          const capName =
            capData?.metadata?.displayName ||
            capData?.idName ||
            `Item ${i + 1}`;
          invalidCaps.push({
            cap: capData,
            error: `"${capName}": ${errorMessage}`,
          });
        }
      }

      setParsedData({ validCaps, invalidCaps });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to parse JSON file';
      setParsedData({
        validCaps: [],
        invalidCaps: [{ cap: null, error: errorMessage }],
      });
    }

    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmUpload = async () => {
    if (!parsedData || parsedData.validCaps.length === 0) return;

    setIsCreating(true);

    try {
      const results = {
        success: [] as LocalCap[],
        errors: [] as { cap: any; error: string }[],
      };

      // Create each validated cap
      for (const fullCap of parsedData.validCaps) {
        try {
          const newLocalCap = createCap(fullCap);
          results.success.push(newLocalCap);
        } catch (error) {
          const capName =
            fullCap.metadata?.displayName || fullCap.idName || 'Unknown Cap';
          results.errors.push({
            cap: fullCap,
            error: `"${capName}": Failed to create cap - ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      }

      setUploadResults(results);

      // If there are successful uploads, call the parent callback
      if (results.success.length > 0 && onBatchCreate) {
        onBatchCreate(results.success);
      }

      // Clear parsed data after creation
      setParsedData(null);
    } catch (error) {
      toast.error('Failed to create caps');
    }

    setIsCreating(false);
  };

  const handleCopyError = async (error: string) => {
    try {
      await navigator.clipboard.writeText(error);
      toast.success('Error message copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const hasResults =
    uploadResults.success.length > 0 || uploadResults.errors.length > 0;

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/cap-studio')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cap Studio
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Batch Create Caps</h1>
        <p className="text-muted-foreground">
          Upload multiple caps from a JSON file. Each cap will be validated and
          created as a draft in your local workspace.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload JSON File</CardTitle>
          <CardDescription>
            Select a JSON file containing an array of cap objects that conform
            to the CapSchema. Your DID will be used to fill in the required
            fields: id and authorDID.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleBatchUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={uploading}
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Processing...' : 'Choose JSON File'}
            </Button>
          </div>

          {/* Format Example */}
          <div className="bg-muted p-4 rounded-lg">
            <button
              type="button"
              onClick={() => setShowJsonFormat(!showJsonFormat)}
              className="flex items-center justify-between w-full text-left font-medium text-sm mb-2 hover:text-foreground transition-colors"
            >
              <span>Expected JSON format (no id/authorDID):</span>
              {showJsonFormat ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {showJsonFormat && (
              <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                {`[
  {
    "idName": "my_awesome_cap",
    "metadata": {
      "displayName": "My Awesome Cap",
      "description": "A detailed description of what this cap does and how it helps users accomplish their tasks effectively",
      "tags": ["productivity", "assistant"],
      "thumbnail": "https://example.com/thumbnail.png",
      "homepage": "https://example.com",
      "repository": "https://github.com/user/repo"
    },
    "core": {
      "prompt": {
        "value": "You are a helpful assistant that...",
        "suggestions": ["How can I help you today?", "What would you like to know?"]
      },
      "model": {
        "modelId": "openai/gpt-4o-mini",
        "modelType": "Language Model",
        "supportedInputs": ["text", "image"],
        "parameters": { "temperature": 0.7 },
        "customGatewayUrl": "https://your-gateway.example.com" // optional
      },
      "mcpServers": {
        "server-name": "https://example.com/sse"
      }
    }
  }
]

Auto-generated fields:
- id: "authorDID:idName"
- authorDID: from your authentication
`}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Preview</CardTitle>
            <CardDescription>
              Review the caps before creating them. Only valid caps will be
              created.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedData.validCaps.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">
                    ✅ {parsedData.validCaps.length} cap(s) ready to create
                  </div>
                  <div className="mt-2 space-y-1">
                    {parsedData.validCaps.map((cap, index) => (
                      <div
                        key={cap.idName || `cap-${index}`}
                        className="text-sm bg-muted p-2 rounded"
                      >
                        "{cap.metadata?.displayName || cap.idName}" (
                        {cap.idName || `Item ${index + 1}`})
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {parsedData.invalidCaps.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-3">
                    ❌ {parsedData.invalidCaps.length} invalid cap(s) found:
                  </div>
                  <div className="space-y-2">
                    {parsedData.invalidCaps.map((error, index) => (
                      <div
                        key={
                          error.cap?.idName || error.cap?.id || `error-${index}`
                        }
                        className="relative bg-muted p-3 rounded font-mono text-sm group"
                      >
                        <div className="pr-8">{error.error}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopyError(error.error)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Confirm button */}
            {parsedData.validCaps.length > 0 && (
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={handleConfirmUpload}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating
                    ? 'Creating Caps...'
                    : `Create ${parsedData.validCaps.length} Cap(s)`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setParsedData(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {hasResults && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadResults.success.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">
                    ✅ Successfully created {uploadResults.success.length}{' '}
                    cap(s) as drafts
                  </div>
                  <div className="mt-2 space-y-1">
                    {uploadResults.success.map((cap) => (
                      <div
                        key={cap.id}
                        className="text-sm bg-muted p-2 rounded"
                      >
                        "{cap.capData.metadata.displayName}" (
                        {cap.capData.idName})
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {uploadResults.errors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-3">
                    ❌ {uploadResults.errors.length} error(s) occurred:
                  </div>
                  <div className="space-y-2">
                    {uploadResults.errors.map((error, index) => (
                      <div
                        key={error.cap?.idName || `error-${index}`}
                        className="relative bg-muted p-3 rounded font-mono text-sm group"
                      >
                        <div className="pr-8">{error.error}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopyError(error.error)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
