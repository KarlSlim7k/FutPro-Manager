'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logtoSignIn, logtoSignOut } from '@/app/logto-actions';

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function LogtoSignInButton({
  label,
  rolePreference,
  className,
}: {
  label?: string;
  rolePreference?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const defaultLabel = rolePreference ? 'Registrarse con Google' : 'Continuar con Google';
  const displayLabel = label ?? defaultLabel;

  return (
    <Button
      type="button"
      variant="secondary"
      className={
        className ||
        "w-full h-11 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm font-medium flex items-center justify-center gap-2.5 transition active:scale-[0.99]"
      }
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await logtoSignIn(rolePreference);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
      ) : (
        <GoogleIcon className="h-4 w-4 shrink-0" />
      )}
      <span className="truncate">{displayLabel}</span>
    </Button>
  );
}

export function LogtoSignOutButton() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await logtoSignOut();
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Cerrar sesión Logto
    </Button>
  );
}
