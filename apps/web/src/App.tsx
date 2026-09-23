import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router';
import { PhoneFrame } from './components/PhoneFrame';
import { ChatScreen } from './screens/ChatScreen';
import { ExportScreen } from './screens/ExportScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SearchScreen } from './screens/SearchScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { useAppState } from './store/appState';

function RootLayout() {
  return (
    <PhoneFrame>
      <Outlet />
    </PhoneFrame>
  );
}

function MaysiIndex() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/maysi/chat', search }} replace />;
}

function RequireDisclosure() {
  const { settings } = useAppState();
  const { search } = useLocation();
  if (!settings.disclosureAccepted) {
    return <Navigate to={{ pathname: '/maysi/welcome', search }} replace />;
  }
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'search', element: <SearchScreen /> },
      {
        path: 'maysi',
        children: [
          { index: true, element: <MaysiIndex /> },
          { path: 'welcome', element: <WelcomeScreen /> },
          {
            element: <RequireDisclosure />,
            children: [
              { path: 'chat', element: <ChatScreen /> },
              { path: 'history', element: <HistoryScreen /> },
              { path: 'export', element: <ExportScreen /> },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
