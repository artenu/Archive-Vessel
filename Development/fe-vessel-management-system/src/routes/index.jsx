import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '../layouts/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { FinanceJobsPage } from '../pages/FinanceJobsPage'
import { JobCreatePage } from '../pages/JobCreatePage'
import { JobDetailPage } from '../pages/JobDetailPage'
import { LoginPage } from '../pages/LoginPage'
import { MasterDataPage } from '../pages/MasterDataPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OperationalJobsPage } from '../pages/OperationalJobsPage'
import { PekerjaanPage } from '../pages/PekerjaanPage'
import { SalesJobsPage } from '../pages/SalesJobsPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { UserManagementPage } from '../pages/UserManagementPage'
import { ProtectedRoute, PublicOnlyRoute, RoleRoute } from './guards'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: <LoginPage />, handle: { crumb: 'Login' } }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            path: 'dashboard',
            element: (
              <RoleRoute path="/dashboard">
                <DashboardPage />
              </RoleRoute>
            ),
            handle: { crumb: 'Dashboard' },
          },
          {
            path: 'pekerjaan',
            element: (
              <RoleRoute path="/pekerjaan">
                <PekerjaanPage />
              </RoleRoute>
            ),
            handle: { crumb: 'Daftar Pekerjaan' },
          },
          {
            path: 'pekerjaan/:jobId',
            element: (
              <RoleRoute path="/pekerjaan">
                <JobDetailPage />
              </RoleRoute>
            ),
            handle: { crumb: 'Detail Pekerjaan' },
          },
          {
            path: 'sales/jobs',
            element: (
              <RoleRoute path="/sales/jobs">
                <SalesJobsPage />
              </RoleRoute>
            ),
            handle: { crumb: 'Job Sales' },
          },
          {
            path: 'sales/jobs/new',
            element: (
              <RoleRoute path="/sales/jobs">
                <JobCreatePage />
              </RoleRoute>
            ),
            handle: { crumb: 'Buat Job Sales' },
          },
          {
            path: 'sales/jobs/:jobId/edit',
            element: (
              <RoleRoute path="/sales/jobs">
                <JobCreatePage />
              </RoleRoute>
            ),
            handle: { crumb: 'Edit Job Sales' },
          },
          {
            path: 'operational/jobs',
            element: (
              <RoleRoute path="/operational/jobs">
                <OperationalJobsPage />
              </RoleRoute>
            ),
            handle: { crumb: 'Job Operational' },
          },
          {
            path: 'finance/jobs',
            element: (
              <RoleRoute path="/finance/jobs">
                <FinanceJobsPage />
              </RoleRoute>
            ),
            handle: { crumb: 'Job Finance' },
          },
          {
            path: 'master-data',
            element: (
              <RoleRoute path="/master-data">
                <MasterDataPage />
              </RoleRoute>
            ),
            handle: { crumb: 'Master Data' },
          },
          {
            path: 'pengguna',
            element: (
              <RoleRoute path="/pengguna">
                <UserManagementPage />
              </RoleRoute>
            ),
            handle: { crumb: 'User Management' },
          },
          { path: 'unauthorized', element: <UnauthorizedPage />, handle: { crumb: 'Unauthorized' } },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
