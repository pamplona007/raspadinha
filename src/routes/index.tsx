import { createBrowserRouter, RouteObject } from 'react-router-dom';
import LayoutApp from 'src/components/LayoutApp';
import Home from 'src/pages/Home';

export const appRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Home />,
    },
];

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <LayoutApp />,
        children: appRoutes,
    },
];

const router = createBrowserRouter(routes);

export default router;
