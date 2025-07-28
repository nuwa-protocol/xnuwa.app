import { FileText, Globe, Plus, Tag, User, X } from 'lucide-react';
import { useId, useState } from 'react';
import type { RemoteCap } from '@/features/cap-store/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@/shared/components/ui';

interface MetadataEditorProps {
  metadata: Partial<RemoteCap>;
  onChange: (metadata: Partial<RemoteCap>) => void;
}

const commonTags = [
  'productivity',
  'development',
  'content',
  'analysis',
  'automation',
  'communication',
  'research',
  'creative',
  'utility',
  'education',
  'business',
  'personal',
];

const commonLicenses = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'BSD-3-Clause',
  'ISC',
  'CC-BY-4.0',
  'Proprietary',
];

export function MetadataEditor({ metadata, onChange }: MetadataEditorProps) {
  const [customKeywords, setCustomKeywords] = useState<string[]>(
    metadata.description
      ?.split(',')
      .map((k) => k.trim())
      .filter(Boolean) || [],
  );
  const [newKeyword, setNewKeyword] = useState('');

  // Generate unique IDs for form elements
  const nameId = useId();
  const versionId = useId();
  const descriptionId = useId();
  const tagId = useId();
  const authorId = useId();
  const licenseId = useId();
  const homepageId = useId();
  const repositoryId = useId();
  const changelogId = useId();
  const minVersionId = useId();
  const compatibilityId = useId();

  const updateMetadata = (updates: Partial<RemoteCap>) => {
    onChange({ ...metadata, ...updates });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !customKeywords.includes(newKeyword.trim())) {
      const updated = [...customKeywords, newKeyword.trim()];
      setCustomKeywords(updated);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    const updated = customKeywords.filter((k) => k !== keyword);
    setCustomKeywords(updated);
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Essential metadata for your cap listing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={nameId}>Display Name</Label>
              <Input
                id={nameId}
                value={metadata.name || ''}
                onChange={(e) => updateMetadata({ name: e.target.value })}
                placeholder="My Awesome Cap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={versionId}>Version</Label>
              <Input
                id={versionId}
                value={metadata.version || ''}
                onChange={(e) => updateMetadata({ version: e.target.value })}
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={descriptionId}>Description</Label>
            <Textarea
              id={descriptionId}
              value={metadata.description || ''}
              onChange={(e) => updateMetadata({ description: e.target.value })}
              placeholder="Describe what your cap does and how it helps users..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={tagId}>Category</Label>
              <Select
                value={metadata.tag || ''}
                onValueChange={(value) => updateMetadata({ tag: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {commonTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={authorId}>Author</Label>
              <Input
                id={authorId}
                value={metadata.author || ''}
                onChange={(e) => updateMetadata({ author: e.target.value })}
                placeholder="Your Name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keywords & Tags</CardTitle>
          <CardDescription>
            Help users discover your cap with relevant keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeywordKeyPress}
              placeholder="Add keyword..."
              className="flex-1"
            />
            <Button onClick={addKeyword} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {customKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customKeywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-sm">
                  {keyword}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                    onClick={() => removeKeyword(keyword)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          <div>
            <Label className="text-sm text-muted-foreground">
              Suggested Keywords
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {commonTags
                .filter((tag) => !customKeywords.includes(tag))
                .slice(0, 8)
                .map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => {
                      setCustomKeywords((prev) => [...prev, tag]);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Author & Legal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <User className="h-4 w-4 mr-2" />
            Author & Legal
          </CardTitle>
          <CardDescription>Legal and attribution information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={licenseId}>License</Label>
            <Select
              value={metadata.version || 'MIT'}
              onValueChange={(value) => updateMetadata({ version: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {commonLicenses.map((license) => (
                  <SelectItem key={license} value={license}>
                    {license}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={homepageId}>Homepage (Optional)</Label>
              <Input
                id={homepageId}
                value={(metadata as any).homepage || ''}
                onChange={(e) =>
                  updateMetadata({ homepage: e.target.value } as any)
                }
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={repositoryId}>Repository (Optional)</Label>
              <Input
                id={repositoryId}
                value={(metadata as any).repository || ''}
                onChange={(e) =>
                  updateMetadata({ repository: e.target.value } as any)
                }
                placeholder="https://github.com/user/repo"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            Publishing Options
          </CardTitle>
          <CardDescription>
            Control how your cap is published and distributed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Public Listing</Label>
              <p className="text-sm text-muted-foreground">
                Make this cap discoverable in the public store
              </p>
            </div>
            <Switch
              checked={(metadata as any).isPublic !== false}
              onCheckedChange={(checked) =>
                updateMetadata({ isPublic: checked } as any)
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Allow Forking</Label>
              <p className="text-sm text-muted-foreground">
                Let other users create modified versions of your cap
              </p>
            </div>
            <Switch
              checked={(metadata as any).allowForking !== false}
              onCheckedChange={(checked) =>
                updateMetadata({ allowForking: checked } as any)
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Community Support</Label>
              <p className="text-sm text-muted-foreground">
                Enable community discussions and issue reporting
              </p>
            </div>
            <Switch
              checked={(metadata as any).communitySupport !== false}
              onCheckedChange={(checked) =>
                updateMetadata({ communitySupport: checked } as any)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Advanced Metadata
          </CardTitle>
          <CardDescription>
            Additional information for better discoverability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={changelogId}>Changelog (Optional)</Label>
            <Textarea
              id={changelogId}
              value={(metadata as any).changelog || ''}
              onChange={(e) =>
                updateMetadata({ changelog: e.target.value } as any)
              }
              placeholder="## v1.0.0&#10;- Initial release&#10;- Added feature X&#10;- Fixed bug Y"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={minVersionId}>Min Nuwa Version</Label>
              <Input
                id={minVersionId}
                value={(metadata as any).minNuwaVersion || ''}
                onChange={(e) =>
                  updateMetadata({ minNuwaVersion: e.target.value } as any)
                }
                placeholder="1.0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={compatibilityId}>Compatibility</Label>
              <Select
                value={(metadata as any).compatibility || 'stable'}
                onValueChange={(value) =>
                  updateMetadata({ compatibility: value } as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="alpha">Alpha</SelectItem>
                  <SelectItem value="experimental">Experimental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
