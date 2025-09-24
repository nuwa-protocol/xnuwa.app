import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logoAppBrand from '@/assets/logo-app-brand.png';
import logoTexts from '@/assets/logo-text.png';
import logoTextsDark from '@/assets/logo-text-dark.png';
import { useTheme } from '@/shared/components/theme-provider';
import { useSidebar } from './sidebar';

export const SidebarLogo = () => {
  const navigate = useNavigate();
  const { open } = useSidebar();
  const { resolvedTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      className="absolute z-20 flex items-center pt-1 gap-1"
    >
      <img
        src={logoAppBrand}
        alt="Nuwa AI"
        className="h-8 w-9 shrink-0 translate-y-0 -translate-x-0.5"
      />
      {open && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-medium whitespace-pre text-black dark:text-white"
        >
          <img
            src={resolvedTheme === 'dark' ? logoTextsDark : logoTexts}
            alt="Nuwa AI"
            className="h-4 shrink-0"
          />
        </motion.span>
      )}
    </button>
  );
};
