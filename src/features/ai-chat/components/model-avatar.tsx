import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { BotIcon } from 'lucide-react';
import type { OpenRouterModel } from '../types';

interface ModelAvatarProps {
  model: OpenRouterModel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'size-5',
  md: 'size-8',
  lg: 'size-12',
};

const iconSizeMap = {
  sm: 'size-3',
  md: 'size-5',
  lg: 'size-7',
};

function getIconSlug(model: OpenRouterModel): string {
  return model.id.split('/')[0];
}

export const ModelAvatar: React.FC<ModelAvatarProps> = ({ 
  model, 
  size = 'md', 
  className = '' 
}) => {
  return (
    <Avatar className={`${sizeMap[size]} ${className}`}>
      <AvatarImage
        src={`https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${getIconSlug(model)}.svg`}
        alt={`${model.name} icon`}
      />
      <AvatarFallback>
        <BotIcon className={`${iconSizeMap[size]} text-muted-foreground`} />
      </AvatarFallback>
    </Avatar>
  );
};