import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

function ProtectedRoute({ children }: Props) {
  const token = sessionStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;