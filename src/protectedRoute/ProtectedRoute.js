import { Navigate, Outlet } from "react-router-dom"
import { useAuthContext } from "../context/AuthContext"

export const ProtectedRoute = () => {
    const { currentUser } = useAuthContext()
    return (
        currentUser ? <Outlet /> : <Navigate to="/login" />
    )
}