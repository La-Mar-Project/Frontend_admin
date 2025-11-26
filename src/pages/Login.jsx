import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import { apiGet } from '../utils/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('=== [로그인 시작] ===');
      console.log('입력된 정보:', { username, password: '***' });
      
      // 1. 먼저 로컬 인증 체크 (admin1/1111)
      const isLocalAuth = (username === 'admin1' && password === '1111');
      console.log('[1단계] 로컬 인증 체크:', { isLocalAuth, username });
      
      if (!isLocalAuth) {
        // 보조 관리자 계정 확인
        const assistantAuth = JSON.parse(localStorage.getItem('assistantAuth') || '{}');
        console.log('[1단계] 보조 관리자 계정 확인:', { assistantAuth });
        const assistant = assistantAuth[username];
        if (!assistant || assistant.active !== '활성' || assistant.password !== password) {
          throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
        console.log('[1단계] 보조 관리자 인증 성공:', assistant);
      } else {
        console.log('[1단계] 메인 관리자 인증 성공 (admin1/1111)');
      }

      // 2. 로컬 인증 성공 시 백엔드에서 토큰 받아오기
      let token = null;
      let backendResponse = null;
      try {
        console.log('[2단계] 백엔드 토큰 요청 시작');
        console.log('[2단계] 요청 URL: /auth/admin');
        console.log('[2단계] Authorization 헤더:', `Basic ${btoa(`${username}:${password}`)}`);
        
        const response = await apiGet('/auth/admin', {
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`
        });

        console.log('[2단계] 백엔드 응답 상태:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.ok) {
          const result = await response.json();
          backendResponse = result;
          console.log('[2단계] 백엔드 응답 데이터:', result);
          console.log('[2단계] 응답 구조:', {
            success: result.success,
            hasData: !!result.data,
            hasToken: !!(result.data && result.data.token),
            dataKeys: result.data ? Object.keys(result.data) : []
          });
          
          if (result.success && result.data && result.data.token) {
            token = result.data.token;
            console.log('[2단계] 백엔드 토큰 받음:', {
              token: token.substring(0, 20) + '...',
              tokenLength: token.length
            });
          } else {
            console.warn('[2단계] 백엔드 응답에 토큰이 없음:', result);
          }
        } else {
          console.warn('[2단계] 백엔드 응답 실패:', response.status, response.statusText);
        }
      } catch (apiError) {
        console.warn('[2단계] 백엔드 토큰 요청 실패 (로컬 인증으로 진행):', apiError);
        // 백엔드 토큰 요청 실패해도 로컬 인증이 성공했으면 계속 진행
      }

      // 3. 토큰 저장 (백엔드 토큰이 있으면 사용, 없으면 로컬 토큰 생성)
      console.log('[3단계] 토큰 저장 시작');
      if (token) {
        localStorage.setItem('adminToken', token);
        console.log('[3단계] 백엔드 토큰 저장 완료');
      } else {
        // 백엔드 토큰이 없으면 로컬 토큰 생성
        const localToken = btoa(`${username}:${Date.now()}`);
        localStorage.setItem('adminToken', localToken);
        console.log('[3단계] 로컬 토큰 생성 및 저장:', {
          token: localToken.substring(0, 20) + '...',
          tokenLength: localToken.length
        });
      }
      
      localStorage.setItem('adminUsername', username);
      localStorage.setItem('adminType', isLocalAuth ? 'main' : 'assistant');
      
      console.log('[3단계] 저장된 사용자 정보:', {
        username: localStorage.getItem('adminUsername'),
        adminType: localStorage.getItem('adminType'),
        hasToken: !!localStorage.getItem('adminToken')
      });
      
      // 4. 로그인 성공 처리 (접속 기록 등)
      console.log('[4단계] 로그인 성공 처리 시작');
      login(username, password);
      console.log('[4단계] 접속 기록 저장 완료');
      
      console.log('=== [로그인 완료] ===');
      console.log('최종 저장된 데이터:', {
        adminToken: localStorage.getItem('adminToken')?.substring(0, 20) + '...',
        adminUsername: localStorage.getItem('adminUsername'),
        adminType: localStorage.getItem('adminType')
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('로그인 오류:', error);
      setError(error.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EEF4FF] to-[#DFE7F4]">
      <div className="bg-white rounded-[20px] shadow-[0_4px_20px_0_rgba(39,84,218,0.15)] p-[60px] w-[480px]">
        {/* 로고/제목 */}
        <div className="flex flex-col items-center mb-[40px]">
          <div className="flex items-center gap-[10px] mb-[20px]">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#2754DA"/>
              <path d="M20 10C14.477 10 10 14.477 10 20C10 25.523 14.477 30 20 30C25.523 30 30 25.523 30 20C30 14.477 25.523 10 20 10ZM20 28C15.589 28 12 24.411 12 20C12 15.589 15.589 12 20 12C24.411 12 28 15.589 28 20C28 24.411 24.411 28 20 28Z" fill="white"/>
              <path d="M20 14C16.686 14 14 16.686 14 20C14 23.314 16.686 26 20 26C23.314 26 26 23.314 26 20C26 16.686 23.314 14 20 14Z" fill="white"/>
            </svg>
            <h1 className="text-[#2754DA] font-pretendard text-[32px] font-bold">쭈불</h1>
          </div>
          <p className="text-[#272C3C] font-pretendard text-[18px] font-medium">관리자 로그인</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
          {/* 아이디 입력 */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[#272C3C] font-pretendard text-[16px] font-medium">
              아이디
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="w-full py-[14px] px-[20px] rounded-[10px] border-2 border-[#E7E7E7] bg-white text-[#272C3C] font-pretendard text-[16px] outline-none focus:border-[#2754DA] transition-colors"
              required
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[#272C3C] font-pretendard text-[16px] font-medium">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full py-[14px] px-[20px] rounded-[10px] border-2 border-[#E7E7E7] bg-white text-[#272C3C] font-pretendard text-[16px] outline-none focus:border-[#2754DA] transition-colors"
              required
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-[#FFF0F0] border border-[#ED2626] rounded-[8px] py-[12px] px-[16px]">
              <p className="text-[#ED2626] font-pretendard text-[14px]">{error}</p>
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-[16px] rounded-[10px] bg-[#2754DA] text-white font-pretendard text-[18px] font-bold hover:bg-[#1840B8] transition-colors mt-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 하단 정보 */}
        <div className="mt-[30px] text-center">
          <p className="text-[#73757C] font-pretendard text-[14px]">
            관리자 계정으로만 접속 가능합니다
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;


