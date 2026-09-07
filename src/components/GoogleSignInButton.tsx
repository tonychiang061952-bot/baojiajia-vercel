import { useEffect, useRef } from 'react';
import { useGoogleAuth } from '../auth/GoogleAuthProvider';

type Props = {
  text?: 'signin_with' | 'continue_with';
  className?: string;
};

export function GoogleSignInButton({ text = 'signin_with', className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { configured, gisReady } = useGoogleAuth();

  useEffect(() => {
    // 一定要等 gisReady：Google 的 script 載好之後，initialize() 還要等 provider 的輪詢跑到。
    // 在那個空窗期呼叫 renderButton，Google 會直接不畫按鈕（只在 console 留一行警告），
    // 而且這個 effect 不會自己重試——訪客就會看到一塊空白，完全沒得登入。
    if (!configured || !gisReady || !ref.current || !window.google?.accounts?.id) return;
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
  }, [configured, gisReady, text]);

  if (!configured) {
    return <p className="text-sm text-red-600">尚未設定 Google OAuth Client ID。</p>;
  }

  return <div ref={ref} className={className} />;
}
