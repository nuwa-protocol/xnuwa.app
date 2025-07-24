'use client';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarLayout } from '@/features/sidebar/components';
import Loading from '@/shared/components/loading';

export default function MainLayout() {
  return (
    <>
      <script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        async
      />
      <Suspense fallback={<Loading />}>
        <SidebarLayout>
          <Outlet />
        </SidebarLayout>
      </Suspense>
    </>
  );
}
