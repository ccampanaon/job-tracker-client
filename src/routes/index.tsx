import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthPage } from '@/pages/AuthPage';
import { ListPage } from '@/pages/ListPage';
import { CompaniesPage } from '@/pages/CompaniesPage';
import { ApplicationDetailPage } from '@/pages/ApplicationDetailPage';

export const router = createBrowserRouter([
  { path: '/login', element: <AuthPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <ListPage /> },
          { path: '/companies', element: <CompaniesPage /> },
          { path: '/applications/:id', element: <ApplicationDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
