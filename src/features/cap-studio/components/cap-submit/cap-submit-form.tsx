import { Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { Markdown } from '@/shared/components/markdown';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui';
import { useSubmitForm } from '../../hooks';
import type { LocalCap } from '../../types';

interface CapSubmitFormProps {
  cap: LocalCap;
}

export function CapSubmitForm({ cap }: CapSubmitFormProps) {
  const { handleCancel, handleSubmit, isSubmitting } = useSubmitForm({
    cap,
  });

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl h-full mx-auto m-6 flex flex-col gap-6 ">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Submit Agent to Store</h3>
            <p className="text-sm text-muted-foreground">
              Review and confirm the information before publishing @
              {cap.capData.idName} to the Nuwa Agent Store
            </p>
          </div>

          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        </div>

        {/* Agent Information - Read Only */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent Information</CardTitle>
            <CardDescription>Basic information about your agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Name
                </div>
                <p className="text-sm">{cap.capData.idName}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Display Name
                </div>
                <p className="text-sm">{cap.capData.metadata.displayName}</p>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Description
              </div>
              <p className="text-sm">
                {cap.capData.metadata.description || 'No description'}
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Tags
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {cap.capData.metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Homepage
                </div>
                <p className="text-sm">
                  {cap.capData.metadata.homepage || 'Not provided'}
                </p>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Repository
                </div>
                <p className="text-sm">
                  {cap.capData.metadata.repository || 'Not provided'}
                </p>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Thumbnail
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="w-32 h-32 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-800 flex items-center justify-center">
                  {cap.capData.metadata.thumbnail ? (
                    <img
                      src={cap.capData.metadata.thumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span className="text-xs">No thumbnail</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {cap.capData.metadata.thumbnail
                    ? 'Thumbnail ready for submission'
                    : 'No thumbnail provided'}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Model
              </div>
              <div className="mt-1 text-sm">
                <p className="font-medium break-all">
                  {cap.capData.core.model.providerId} • {cap.capData.core.model.modelId}
                </p>
                <p className="text-xs text-muted-foreground">
                  Context length: {cap.capData.core.model.contextLength} • Supported inputs: {cap.capData.core.model.supportedInputs.join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Introduction (Markdown) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Introduction</CardTitle>
            <CardDescription>
              Details and usage of your cap (Markdown)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(cap.capData.metadata.introduction ?? '').trim().length > 0 ? (
              <div className="prose dark:prose-invert max-w-none">
                <Markdown>{cap.capData.metadata.introduction}</Markdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No introduction</p>
            )}
          </CardContent>
        </Card>

        {/* Remote MCP - Read Only, mirrors edit card scopes */
        }
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Remote MCP</CardTitle>
            <CardDescription>
              Set up Remote MCP servers to provide tools for your agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(cap.capData.core.mcpServers).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(cap.capData.core.mcpServers).map(([name, url]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {url}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No Remote MCP servers configured</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Artifact - Read Only */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Artifact</CardTitle>
            <CardDescription>
              This artifact provides interactive UI for your agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cap.capData.core.artifact?.srcUrl ? (
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="text-muted-foreground">Source URL</div>
                  <a
                    href={cap.capData.core.artifact.srcUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {cap.capData.core.artifact.srcUrl}
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No artifact provided
              </p>
            )}
          </CardContent>
        </Card>

        {/* Author Information & Thumbnail merged into Agent Information above */}

        {/* Submit */}
        <Card className="border-none shadow-none">
          <CardContent>
            <div className="flex items-center justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                Ready to publish your agent to the store
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit to Store
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
