'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logtoSignIn, logtoSignOut } from '@/app/logto-actions';

export function LogtoSignInButton({ label = 'Continuar con Logto (Google / SMS)' }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await logtoSignIn();
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
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
