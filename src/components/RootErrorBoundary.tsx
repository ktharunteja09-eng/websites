import React, { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import { NotFoundPage } from '../pages/NotFoundPage';
import {
  isChunkOrJsonError,
  attemptReloadOnce,
  clearReloadGuard,
} from '../utils/errorHandler';

export const RootErrorBoundary: React.FC = () => {
  const error = useRouteError();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If this is a JSON parse error (e.g. HTML received for loader JSON) or dynamic chunk error,
    // reload once (guarded by sessionStorage so it never loops)
    if (isChunkOrJsonError(error)) {
      attemptReloadOnce(error);
    }
  }, [error]);

  const handleReload = () => {
    clearReloadGuard(true);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleBackHome = () => {
    clearReloadGuard(true);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleNavigateAdmin = () => {
    clearReloadGuard(true);
    if (typeof window !== 'undefined') {
      window.location.href = '/admin';
    }
  };

  return (
    <NotFoundPage
      isError={true}
      onReload={handleReload}
      onBackHome={handleBackHome}
      onNavigateAdmin={handleNavigateAdmin}
    />
  );
};

export default RootErrorBoundary;
