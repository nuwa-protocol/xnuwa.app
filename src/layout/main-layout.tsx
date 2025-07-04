'use client';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { FloatingSidebarLayout } from './components/floating-sidebar';
import Loading from './components/loading';

export default function MainLayout() {
  return (
    <>
      <script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        async
      />
      <Suspense fallback={<Loading />}>
        <FloatingSidebarLayout>
          <Outlet />
        </FloatingSidebarLayout>
      </Suspense>
    </>
  );
}
