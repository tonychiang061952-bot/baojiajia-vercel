import { useEffect, useRef } from 'react';
import { useGoogleAuth } from '../auth/GoogleAuthProvider';

type Props = {
  text?: 'signin_with' | 'continue_with';
  className?: string;
};

export function GoogleSignInButton({ text = 'signin_with', className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { configured } = useGoogleAuth();

  useEffect(() => {
    if (!configured || !ref.current || !window.google?.accounts.id) return;
    ref.current.replaceChildren();
    window.google.accounts.id.renderButton(ref.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text,
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 280,
      locale: 'zh-TW',
    });
  }, [configured, text]);

  if (!configured) {
    return <p className="text-sm text-red-600">尚未設定 Google OAuth Client ID。</p>;
  }

  return <div ref={ref} className={className} />;
}
