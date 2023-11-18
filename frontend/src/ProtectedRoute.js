import { Route, Navigate } from 'react-router-dom';

function ProtectedRoute({ element, ...rest }) {
  const isAuthenticated = false;  // Replace this with your actual authentication check

  return isAuthenticated ? (
    <Route {...rest} element={element} />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default ProtectedRoute;
