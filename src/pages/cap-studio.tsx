import { useLocation } from 'react-router-dom';
import { CapStudio } from '@/features/cap-studio/components';
import { BatchCreate } from '@/features/cap-studio/components/batch-create';
import { CapEdit } from '@/features/cap-studio/components/cap-edit';
import { Submit } from '@/features/cap-studio/components/cap-submit';
import { MCPDebug } from '@/features/cap-studio/components/mcp';

// Single entry page for all Cap Studio routes. We pick which
// sub-component to render based on the URL pathname so the router
// can point every cap-studio path to this file.
export default function CapStudioPage() {
  const { pathname } = useLocation();

  // Normalize path for checks (remove trailing slash if any)
  const path =
    pathname.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;

  if (path === '/cap-studio') return <CapStudio />;
  if (path.startsWith('/cap-studio/create')) return <CapEdit />;
  if (path.startsWith('/cap-studio/batch-create')) return <BatchCreate />;
  if (path.startsWith('/cap-studio/edit/'))
    return <CapEdit id={path.split('/').pop() || ''} />;
  if (path.startsWith('/cap-studio/submit/'))
    return <Submit id={path.split('/').pop() || ''} />;
  if (path.startsWith('/cap-studio/mcp')) return <MCPDebug />;

  // Fallback to main studio for unknown subpaths
  return <CapStudio />;
}
