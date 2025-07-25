import { PathBreadcrumb } from './path-breadcrumb';

export default function Header() {
  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 justify-between">
      <PathBreadcrumb />
      <div className="flex-1" />
    </header>
  );
}
