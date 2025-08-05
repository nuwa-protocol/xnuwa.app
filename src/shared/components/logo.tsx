import logoBasic from '@/assets/logo-basic.png';
import { useLanguage } from '@/shared/hooks/use-language';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl' | string;
  className?: string;
}

export function Logo({ size = 'xl', className = '' }: LogoProps) {
  const { t } = useLanguage();

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'w-16';
      case 'medium':
        return 'w-32';
      case 'large':
        return 'w-64';
      case 'xl':
        return 'w-80';
      default:
        return size.startsWith('w-') ? size : `w-${size}`;
    }
  };

  return (
    <div
      className={`flex flex-row gap-3 items-center text-lg font-semibold px-2 rounded-md ${className}`}
    >
      <img src={logoBasic} alt="logo" className={getSizeClass(size)} />
    </div>
  );
}
