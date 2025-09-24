import { BanknoteArrowDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { AITransactionList } from './ai-transaction-list';
import { DepositTransctionList } from './deposit-transaction-list';

export function Transactions() {
  const [activeTab, setActiveTab] = useState<
    'ai-transactions' | 'deposit-transactions'
  >('ai-transactions');

  return (
    <Card>
      <CardHeader className="sr-only">
        <CardTitle className="sr-only">Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as 'ai-transactions' | 'deposit-transactions')
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="ai-transactions"
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI Usage
            </TabsTrigger>
            <TabsTrigger
              value="deposit-transactions"
              className="flex items-center gap-2"
            >
              <BanknoteArrowDown className="h-4 w-4" />
              Deposits
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="ai-transactions"
            className="mt-6 max-h-[50vh] overflow-y-auto space-y-2"
          >
            <AITransactionList />
          </TabsContent>

          <TabsContent
            value="deposit-transactions"
            className="mt-6 max-h-[50vh] overflow-y-auto space-y-2"
          >
            <DepositTransctionList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
