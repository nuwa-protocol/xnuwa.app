import { ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Form,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui';
import { useEditForm } from '../../hooks';
import { CapStudioStore } from '../../stores';
import { getErrorDescription } from '../../utils';
import { ArtifactTab } from './artifact';
import { GeneralTab } from './general';
import { IntroductionTab } from './introduction';
import { McpTab } from './mcp';
import { ModelTab } from './model';
import { PromptTab } from './prompt';

export function CapEdit({ id }: { id?: string }) {
  const { localCaps } = CapStudioStore();
  const editingCap = id ? localCaps.find((cap) => cap.id === id) : undefined;

  const tabs = [
    { value: 'general', label: 'General' },
    { value: 'introduction', label: 'Introduction' },
    { value: 'model', label: 'Model' },
    { value: 'prompt', label: 'Prompt' },
    { value: 'mcp', label: 'MCP' },
    { value: 'artifact', label: 'Artifact' },
  ];

  const [currentTab, setCurrentTab] = useState('general');

  const currentTabIndex = tabs.findIndex((tab) => tab.value === currentTab);
  const previousTab = currentTabIndex > 0 ? tabs[currentTabIndex - 1] : null;
  const nextTab =
    currentTabIndex < tabs.length - 1 ? tabs[currentTabIndex + 1] : null;

  const handleTabChange = (tabValue: string) => {
    setCurrentTab(tabValue);
  };

  const { form, handleFormSave, handleFormCancel, isSaving } = useEditForm({
    editingCap,
  });

  return (
    <div className="h-full w-full flex flex-col max-w-4xl mx-auto">
      {/* Header - Title, Save Button, and Tab Triggers */}
      <header className="flex-shrink-0 bg-background px-6 py-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {editingCap ? 'Edit Cap' : 'Create New Cap'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {editingCap ? 'Update your Cap' : 'Build a new Cap from scratch'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleFormCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSaving}
              onClick={form.handleSubmit(
                (data) => handleFormSave(data),
                (error) => {
                  toast.error('Please complete the fields or fix the errors', {
                    description: getErrorDescription(error),
                  });
                  console.error(error);
                },
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingCap ? 'Update Cap' : 'Create Cap'}
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="introduction">Introduction</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="mcp">MCP</TabsTrigger>
            <TabsTrigger value="artifact">Artifact</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Main Content - Tab Content */}
      <main className="flex-1 overflow-hidden">
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="h-full flex flex-col"
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => handleFormSave(data))}
              className="h-full flex flex-col"
            >
              <TabsContent
                value="general"
                className="flex-1 p-6 overflow-y-auto hide-scrollbar"
              >
                <GeneralTab form={form} />
              </TabsContent>

              <TabsContent
                value="introduction"
                className="flex-1 p-6 overflow-y-auto hide-scrollbar"
              >
                <IntroductionTab form={form} />
              </TabsContent>

              <TabsContent
                value="model"
                className="flex-1 p-6 overflow-y-auto hide-scrollbar"
              >
                <ModelTab form={form} />
              </TabsContent>

              <TabsContent
                value="prompt"
                className="flex-1 p-6 overflow-y-auto hide-scrollbar"
              >
                <PromptTab form={form} />
              </TabsContent>

              <TabsContent
                value="mcp"
                className="flex-1 p-6 overflow-y-auto hide-scrollbar"
              >
                <McpTab form={form} />
              </TabsContent>

              <TabsContent
                value="artifact"
                className="flex-1 p-6 overflow-y-auto hide-scrollbar"
              >
                <ArtifactTab form={form} />
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </main>

      {/* Footer - Tab Control Buttons */}
      <footer className="flex-shrink-0 border-t bg-background px-6 py-4">
        <div className="flex justify-between">
          {previousTab && (
            <Button
              variant="outline"
              onClick={() => handleTabChange(previousTab.value)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {previousTab.label}
            </Button>
          )}

          {nextTab ? (
            <Button
              onClick={() => handleTabChange(nextTab.value)}
              className={!previousTab ? 'ml-auto' : ''}
            >
              {nextTab.label}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSaving}
              onClick={form.handleSubmit(
                (data) => handleFormSave(data),
                (error) => {
                  toast.error('Please complete the fields or fix the errors', {
                    description: getErrorDescription(error),
                  });
                  console.error(error);
                },
              )}
              className={!previousTab ? 'ml-auto' : ''}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingCap ? 'Update Cap' : 'Create Cap'}
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
