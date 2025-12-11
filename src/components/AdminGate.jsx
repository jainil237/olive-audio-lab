import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppButton, GlassCard } from './ui/primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const AdminGate = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isAuthenticated, user, logout } = useAuth();

  const goToLogin = () => {
    const redirect = encodeURIComponent(location.pathname + location.hash);
    navigate(`/login?redirect=${redirect}`);
  };

  if (!isAdmin) {
    return (
      <GlassCard className="bg-black/60 space-y-4 mt-10 max-w-xl">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Admin access required</h3>
          <p className="text-sm text-zinc-400">
            {isAuthenticated
              ? 'Your account does not have administrator permissions. Switch to an admin role to continue.'
              : 'Sign in with an administrator account to manage catalogue content.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AppButton variant="primary" onClick={goToLogin}>
            {isAuthenticated ? 'Use different account' : 'Sign in as admin'}
          </AppButton>
          {isAuthenticated && (
            <AppButton
              variant="ghost"
              className="text-red-400 hover:text-red-200"
              onClick={() => {
                logout();
                goToLogin();
              }}
            >
              Sign out {user?.name ? `(${user.name})` : ''}
            </AppButton>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="bg-black/60 space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Admin controls</h3>
          {user?.name && (
            <p className="text-xs text-zinc-400 mt-1">Signed in as {user.name}</p>
          )}
        </div>
        <AppButton
          variant="ghost"
          className="text-red-400 hover:text-red-200"
          onClick={() => {
            logout();
            goToLogin();
          }}
        >
          Sign out
        </AppButton>
      </div>
      <div className="space-y-6">{children}</div>
    </GlassCard>
  );
};

export default AdminGate;
