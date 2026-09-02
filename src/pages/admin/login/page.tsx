import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAuth } from '../../../auth/GoogleAuthProvider';
import { GoogleSignInButton } from '../../../components/GoogleSignInButton';
import { SEO } from '../../../components/SEO';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, loading } = useGoogleAuth();

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin', { replace: true });
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center px-4">
      <SEO title="後台登入 | 保家佳" description="保家佳後台管理系統登入頁面" keywords={[]} url="/admin/login" noindex />
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4">
            <i className="ri-shield-user-line text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">後台管理系統</h1>
          <p className="text-gray-600">請使用已授權的 Google 帳號登入</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {user && user.role !== 'admin' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              {user.email} 尚未被授權使用後台。
            </div>
          )}
          <div className="flex justify-center">
            {loading ? <i className="ri-loader-4-line animate-spin text-2xl text-teal-600"></i> : <GoogleSignInButton text="continue_with" />}
          </div>
          <p className="text-sm text-gray-600 text-center border-t border-gray-200 pt-6">
            後台只允許預先設定的 Google 管理員帳號存取。
          </p>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 whitespace-nowrap">
            <i className="ri-arrow-left-line"></i>返回首頁
          </button>
        </div>
      </div>
    </div>
  );
}
