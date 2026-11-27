import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
    clearSession,
    getHomeRouteByRole,
    getStoredUser,
    getToken
} from '../services/api'

export const ProtectedRoute = ({allowedRoles}) => {
    const location = useLocation()
    const token = getToken()
    const user = getStoredUser()

    if (!token || !user){
        clearSession()
        return <Navigate to="/login" replace state={{from:location}}/>
    }

    if (allowedRoles && !allowedRoles.includes(user.role)){
        return <Navigate to={getHomeRouteByRole(user.role)} replace />
    }
    
    return <Outlet />
}

export const PublicOnlyRoute = () => {
    const token = getToken()
    const user = getStoredUser()

    if(token && user){
        return <Navigate to= {getHomeRouteByRole(user.role)} replace />
    }
    return <Outlet />
}