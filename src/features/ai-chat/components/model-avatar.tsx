import React from 'react';
import { BotIcon } from 'lucide-react';
import type { OpenRouterModel } from '../types';
import { Img } from 'react-image';

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
  sm: 'size-5',
  md: 'size-8',
  lg: 'size-12',
};



export const ModelAvatar: React.FC<ModelAvatarProps> = ({
  model,
  size = 'md',
  className = ''
}) => {

  const iconSlug = model.name.split(':')[0];
  const iconSrc = `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${iconSlug}-color.svg`
  const iconSrcBw = `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${iconSlug}.svg`
  return (
    <Img
      src={[iconSrc, iconSrcBw]}
      className={`${sizeMap[size]} ${className}`}
      loading="lazy"
      loader={<BotIcon className={`${iconSizeMap[size]}`} />}
      unloader={<BotIcon className={`${iconSizeMap[size]}`} />}
    />
  );
};