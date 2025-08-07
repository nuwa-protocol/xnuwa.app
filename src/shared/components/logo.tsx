import logoAppBlack from '@/assets/logo-app-black.png';
import logoAppBrand from '@/assets/logo-app-brand.png';
import logoAppGradient from '@/assets/logo-app-gradient.png';
import logoAppGradientPink from '@/assets/logo-app-gradient-pink.png';
import logoAppWhite from '@/assets/logo-app-white.png';
import logoBasic from '@/assets/logo-basic.png';
import logoBasicBlack from '@/assets/logo-basic-black.png';
import logoBasicDark from '@/assets/logo-basic-dark.png';
import logoBasicGradient from '@/assets/logo-basic-gradient.png';
import logoBasicGradientPink from '@/assets/logo-basic-gradient-pink.png';
import logoBasicSolid from '@/assets/logo-basic-solid.png';
import logoBasicWhite from '@/assets/logo-basic-white.png';
import logoSpecialBlack from '@/assets/logo-special-black.png';
import logoSpecialBrand from '@/assets/logo-special-brand.png';
import logoSpecialBrandDark from '@/assets/logo-special-brand-dark.png';
import logoSpecialGradient from '@/assets/logo-special-gradient.png';
import logoSpecialGradientPink from '@/assets/logo-special-gradient-pink.png';
import logoSpecialSolid from '@/assets/logo-special-solid.png';
import logoSpecialWhite from '@/assets/logo-special-white.png';
import logoVerticalBlack from '@/assets/logo-vertical-black.png';
import logoVerticalBrand from '@/assets/logo-vertical-brand.png';
import logoVerticalBrandDark from '@/assets/logo-vertical-brand-dark.png';
import logoVerticalGradient from '@/assets/logo-vertical-gradient.png';
import logoVerticalGradientPink from '@/assets/logo-vertical-gradient-pink.png';
import logoVerticalInverse from '@/assets/logo-vertical-inverse.png';
import logoVerticalSolid from '@/assets/logo-vertical-solid.png';
import { useTheme } from '@/shared/components/theme-provider';

type LogoVariant =
  | 'basic'
  | 'basic-white'
  | 'basic-black'
  | 'basic-gradient'
  | 'basic-gradient-pink'
  | 'basic-solid'
  | 'vertical-brand'
  | 'vertical-brand-dark'
  | 'vertical-inverse'
  | 'vertical-black'
  | 'vertical-gradient'
  | 'vertical-gradient-pink'
  | 'vertical-solid'
  | 'special-brand'
  | 'special-brand-dark'
  | 'special-white'
  | 'special-black'
  | 'special-gradient'
  | 'special-gradient-pink'
  | 'special-solid'
  | 'app-black'
  | 'app-brand'
  | 'app-gradient'
  | 'app-gradient-pink'
  | 'app-white';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  className?: string;
  variant?: LogoVariant;
  autoTheme?: boolean;
  onClick?: () => void;
}

export function Logo({
  size = 'xl',
  className = '',
  variant = 'basic',
  autoTheme = true,
  onClick,
}: LogoProps) {
  const { resolvedTheme } = useTheme();

  const getLogoSrc = () => {
    if (autoTheme && variant === 'basic') {
      return resolvedTheme === 'dark' ? logoBasicDark : logoBasic;
    }

    switch (variant) {
      case 'basic':
        return logoBasic;
      case 'basic-white':
        return logoBasicWhite;
      case 'basic-black':
        return logoBasicBlack;
      case 'basic-gradient':
        return logoBasicGradient;
      case 'basic-gradient-pink':
        return logoBasicGradientPink;
      case 'basic-solid':
        return logoBasicSolid;
      case 'vertical-brand':
        return logoVerticalBrand;
      case 'vertical-brand-dark':
        return logoVerticalBrandDark;
      case 'vertical-inverse':
        return logoVerticalInverse;
      case 'vertical-black':
        return logoVerticalBlack;
      case 'vertical-gradient':
        return logoVerticalGradient;
      case 'vertical-gradient-pink':
        return logoVerticalGradientPink;
      case 'vertical-solid':
        return logoVerticalSolid;
      case 'special-brand':
        return logoSpecialBrand;
      case 'special-brand-dark':
        return logoSpecialBrandDark;
      case 'special-white':
        return logoSpecialWhite;
      case 'special-black':
        return logoSpecialBlack;
      case 'special-gradient':
        return logoSpecialGradient;
      case 'special-gradient-pink':
        return logoSpecialGradientPink;
      case 'special-solid':
        return logoSpecialSolid;
      case 'app-black':
        return logoAppBlack;
      case 'app-brand':
        return logoAppBrand;
      case 'app-gradient':
        return logoAppGradient;
      case 'app-gradient-pink':
        return logoAppGradientPink;
      case 'app-white':
        return logoAppWhite;
      default:
        return logoBasic;
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'sm':
        return 'w-16';
      case 'md':
        return 'w-32';
      case 'lg':
        return 'w-64';
      case 'xl':
        return 'w-80';
      default:
        return size.startsWith('w-') ? size : `w-${size}`;
    }
  };

  if (onClick) {
    return (
      <button type="button" onClick={onClick}>
        <img src={getLogoSrc()} alt="logo" className={getSizeClass(size)} />
      </button>
    );
  }

  return (
    <div
      className={`flex flex-row gap-3 items-center text-lg font-semibold px-2 rounded-md ${className}`}
    >
      <img src={getLogoSrc()} alt="logo" className={getSizeClass(size)} />
    </div>
  );
}
