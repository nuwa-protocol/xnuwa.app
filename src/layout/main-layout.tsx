import { Outlet } from 'react-router-dom';
import { SidebarLayout } from '@/features/sidebar/components';

export default function MainLayout() {


  return (
    <>
      <script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        async
      />
      <SidebarLayout>
        <Outlet />
      </SidebarLayout>
    </>
  );
}
