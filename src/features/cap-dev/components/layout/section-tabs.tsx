import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui';
import { 
  Code2, 
  Upload, 
  Bug, 
  Folder, 
  Settings2,
  Sparkles
} from 'lucide-react';

interface SectionTab {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
  badge?: string | number;
}

interface SectionTabsProps {
  defaultTab?: string;
  tabs: SectionTab[];
}

export function SectionTabs({ defaultTab, tabs }: SectionTabsProps) {
  return (
    <Tabs defaultValue={defaultTab || tabs[0]?.id} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/50 backdrop-blur-sm">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex items-center gap-2 py-2.5 px-3 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {tab.badge}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="mt-6 space-y-6"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export const tabIcons = {
  mycaps: <Folder className="h-4 w-4" />,
  create: <Sparkles className="h-4 w-4" />,
  upload: <Upload className="h-4 w-4" />,
  debug: <Bug className="h-4 w-4" />,
  mcp: <Code2 className="h-4 w-4" />,
  settings: <Settings2 className="h-4 w-4" />
};