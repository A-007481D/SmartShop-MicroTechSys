import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface RequireAuthProps {
    allowedRoles?: ('ADMIN' | 'CLIENT')[];
}

export default function RequireAuth({ allowedRoles }: RequireAuthProps) {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
