import { motion } from 'framer-motion';
import type React from 'react';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useLocale } from '@/shared/locales/use-locale';
import { cn } from '@/shared/utils';
import type { Model } from '../../types';
import { getModelName, getProviderName } from '../../utils';
import { ProviderAvatar } from './provider-avatar';

interface ModelCardProps {
  model: Model;
  isSelected: boolean;
  onClick: (model: Model) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  isSelected,
  onClick,
}) => {
  const { t } = useLocale();

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={cn(
          'hover:bg-accent transition-colors cursor-pointer h-full',
          isSelected && 'bg-accent border-primary',
        )}
        onClick={() => onClick(model)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <ProviderAvatar provider={model.providerName} size="md" />
              <div>
                <CardTitle className="text-base">
                  {getModelName(model)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {getProviderName(model)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardFooter className=" flex flex-col items-start pt-0 space-y-2">
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>
              ${Number(model.pricing.input_per_million_tokens.toPrecision(3))}{' '}
              {t('aiProvider.modelCard.pricing.inputTokens')}
            </span>
          </div>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>
              ${Number(model.pricing.output_per_million_tokens.toPrecision(3))}{' '}
              {t('aiProvider.modelCard.pricing.outputTokens')}
            </span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
