import { useState } from 'react';
import { Button } from '@/shared/components/ui';
import { useCapDevStore, type LocalCap } from '@/features/cap-dev/stores';
import { DashboardLayout, DashboardHeader } from './layout/dashboard-layout';
import { SectionTabs, tabIcons } from './layout/section-tabs';
import { MyCapsGallery } from './cap-management/my-caps-gallery';
import { CapBuilder } from './cap-creation/cap-builder';
import { SubmitForm } from './cap-submit/submit-form';
import { CapTestEnvironment } from './cap-debugging/cap-test-environment';
import { McpToolsSection } from './mcp-tools/mcp-tools-section';

type ActiveSection = 'mycaps' | 'create' | 'submit' | 'debug' | 'mcp';

export function CapDev() {
  const { localCaps } = useCapDevStore();
  const [activeSection, setActiveSection] = useState<ActiveSection>('mycaps');
  const [editingCap, setEditingCap] = useState<LocalCap | null>(null);
  const [selectedCapForAction, setSelectedCapForAction] = useState<LocalCap | null>(null);

  const handleEditCap = (cap: LocalCap) => {
    setEditingCap(cap);
    setActiveSection('create');
  };

  const handleDebugCap = (cap: LocalCap) => {
    setSelectedCapForAction(cap);
    setActiveSection('debug');
  };

  const handleSubmitCap = (cap: LocalCap) => {
    setSelectedCapForAction(cap);
    setActiveSection('submit');
  };

  const handleCreateNew = () => {
    setEditingCap(null);
    setActiveSection('create');
  };

  const handleSaveCap = (cap: LocalCap) => {
    setEditingCap(null);
    setActiveSection('mycaps');
  };

  const handleSubmitComplete = (success: boolean, capId?: string) => {
    if (success) {
      setSelectedCapForAction(null);
      setActiveSection('mycaps');
    }
  };

  const handleCancelEdit = () => {
    setEditingCap(null);
    setSelectedCapForAction(null);
    setActiveSection('mycaps');
  };

  const tabs = [
    {
      id: 'mycaps',
      label: 'My Caps',
      icon: tabIcons.mycaps,
      badge: localCaps.length > 0 ? localCaps.length.toString() : undefined,
      content: (
        <MyCapsGallery
          onEditCap={handleEditCap}
          onDebugCap={handleDebugCap}
          onSubmitCap={handleSubmitCap}
          onCreateNew={handleCreateNew}
        />
      ),
    },
    {
      id: 'create',
      label: 'Create',
      icon: tabIcons.create,
      content: (
        <CapBuilder
          editingCap={editingCap || undefined}
          onSave={handleSaveCap}
          onCancel={handleCancelEdit}
        />
      ),
    },
    {
      id: 'submit',
      label: 'Submit',
      icon: tabIcons.upload,
      content: selectedCapForAction ? (
        <SubmitForm
          cap={selectedCapForAction}
          onSubmit={handleSubmitComplete}
          onCancel={handleCancelEdit}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Select a cap from "My Caps" to submit it to the store</p>
          <Button onClick={() => setActiveSection('mycaps')} className="mt-4">
            Go to My Caps
          </Button>
        </div>
      ),
    },
    {
      id: 'debug',
      label: 'Debug',
      icon: tabIcons.debug,
      content: selectedCapForAction ? (
        <CapTestEnvironment
          cap={selectedCapForAction}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Select a cap from "My Caps" to debug and test it</p>
          <Button onClick={() => setActiveSection('mycaps')} className="mt-4">
            Go to My Caps
          </Button>
        </div>
      ),
    },
    {
      id: 'mcp',
      label: 'MCP Tools',
      icon: tabIcons.mcp,
      content: <McpToolsSection />,
    },
  ];

  const headerActions = (
    <div className="flex items-center space-x-2">
      <Button onClick={handleCreateNew} size="sm">
        Create New Cap
      </Button>
    </div>
  );

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Cap Development"
        description="Create, debug, and publish powerful AI capabilities with integrated MCP tools"
        actions={headerActions}
      />
      
      <SectionTabs
        defaultTab={activeSection}
        tabs={tabs}
      />
    </DashboardLayout>
  );
}
