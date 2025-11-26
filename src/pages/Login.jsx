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
        // 인증 서버 URL 가져오기 (환경 변수 또는 기본값)
        const authApiBaseUrl = import.meta.env.VITE_AUTH_API_BASE_URL || 'https://jjubul-auth.duckdns.org';
        const authUrl = `${authApiBaseUrl}/auth/admin`;
        
        console.log('[2단계] 백엔드 토큰 요청 시작');
        console.log('[2단계] 인증 서버 URL:', authApiBaseUrl);
        console.log('[2단계] 요청 URL:', authUrl);
        console.log('[2단계] Authorization 헤더:', `Basic ${btoa(`${username}:${password}`)}`);
        
        // 인증 서버는 별도 도메인이므로 직접 fetch 사용
        // 쿠키를 받기 위해 credentials: 'include' 추가
        const response = await fetch(authUrl, {
          method: 'GET',
          credentials: 'include', // 쿠키를 포함하여 요청/응답
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${username}:${password}`)}`
          }
        });

        console.log('[2단계] 백엔드 응답 상태:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.ok) {
          // 응답 헤더에서 토큰 확인 (Authorization 헤더 또는 Set-Cookie 등)
          const responseHeaders = Object.fromEntries(response.headers.entries());
          // 헤더 키를 소문자로 변환하여 확인 (대소문자 구분 없이)
          const lowerCaseHeaders = {};
          response.headers.forEach((value, key) => {
            lowerCaseHeaders[key.toLowerCase()] = value;
          });
          
          // 모든 헤더 키 확인
          const allHeaderKeys = Array.from(response.headers.keys());
          console.log('[2단계] 응답 헤더 (원본):', responseHeaders);
          console.log('[2단계] 응답 헤더 (소문자):', lowerCaseHeaders);
          console.log('[2단계] 모든 헤더 키:', allHeaderKeys);
          
          // Set-Cookie 헤더 확인 (배열일 수 있음)
          const setCookieHeader = response.headers.get('Set-Cookie') || response.headers.get('set-cookie');
          const setCookieArray = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
          console.log('[2단계] Set-Cookie 헤더 확인:', {
            'set-cookie (단일)': lowerCaseHeaders['set-cookie'],
            'Set-Cookie (get)': setCookieHeader,
            'Set-Cookie (배열)': setCookieArray,
            'getSetCookie() 사용 가능': !!response.headers.getSetCookie,
            모든SetCookie: allHeaderKeys.filter(k => k.toLowerCase().includes('cookie'))
          });
          
          // document.cookie 확인 (브라우저에 저장된 쿠키)
          console.log('[2단계] 브라우저 쿠키 (document.cookie):', document.cookie);
          console.log('[2단계] 쿠키 상세 분석:', {
            쿠키존재: !!document.cookie,
            쿠키길이: document.cookie.length,
            쿠키분할: document.cookie ? document.cookie.split(';') : []
          });
          
          // 응답 본문 확인
          const result = await response.json();
          backendResponse = result;
          console.log('[2단계] 백엔드 응답 데이터:', result);
          console.log('[2단계] 응답 구조:', {
            success: result.success,
            hasData: !!result.data,
            hasToken: !!(result.data && result.data.token),
            dataKeys: result.data ? Object.keys(result.data) : [],
            전체응답키: Object.keys(result)
          });
          
          // 토큰 추출 (여러 가능한 위치에서 확인)
          console.log('[2단계] 토큰 추출 시작 - 응답 전체 구조:', JSON.stringify(result, null, 2));
          
          // 1. result.data.token
          if (result.data && result.data.token) {
            token = result.data.token;
            console.log('[2단계] 토큰 위치: result.data.token');
          }
          // 2. result.data.accessToken
          else if (result.data && result.data.accessToken) {
            token = result.data.accessToken;
            console.log('[2단계] 토큰 위치: result.data.accessToken');
          }
          // 3. result.data.access_token
          else if (result.data && result.data.access_token) {
            token = result.data.access_token;
            console.log('[2단계] 토큰 위치: result.data.access_token');
          }
          // 4. result.token
          else if (result.token) {
            token = result.token;
            console.log('[2단계] 토큰 위치: result.token');
          }
          // 5. result.accessToken
          else if (result.accessToken) {
            token = result.accessToken;
            console.log('[2단계] 토큰 위치: result.accessToken');
          }
          // 6. result.access_token
          else if (result.access_token) {
            token = result.access_token;
            console.log('[2단계] 토큰 위치: result.access_token');
          }
          // 7. 응답 헤더에서 확인 (Authorization 또는 X-Access-Token 등)
          else if (lowerCaseHeaders['authorization']) {
            const authHeader = lowerCaseHeaders['authorization'];
            token = authHeader.replace(/^Bearer\s+/i, '');
            console.log('[2단계] 토큰 위치: 응답 헤더 Authorization');
          }
          else if (lowerCaseHeaders['x-access-token']) {
            token = lowerCaseHeaders['x-access-token'];
            console.log('[2단계] 토큰 위치: 응답 헤더 X-Access-Token');
          }
          // 7. Set-Cookie 헤더에서 확인 (배열 지원) - 위에서 선언한 변수 재사용
          if (setCookieArray.length > 0 || setCookieHeader) {
            const cookiesToCheck = setCookieArray.length > 0 ? setCookieArray.join('; ') : setCookieHeader;
            console.log('[2단계] Set-Cookie 헤더에서 쿠키 확인:', cookiesToCheck);
            console.log('[2단계] Set-Cookie 배열:', setCookieArray);
            
            // 쿠키에서 access_token, token, accessToken 등 찾기
            const cookiePatterns = [
              /(?:access_token|accessToken)=([^;,\s]+)/i,
              /(?:token)=([^;,\s]+)/i,
              /(?:auth_token|authToken)=([^;,\s]+)/i,
              /(?:jwt|JWT)=([^;,\s]+)/i
            ];
            
            for (const pattern of cookiePatterns) {
              const match = cookiesToCheck.match(pattern);
              if (match) {
                token = decodeURIComponent(match[1]);
                console.log('[2단계] ✅ 토큰 위치: Set-Cookie 헤더에서 추출');
                break;
              }
            }
          }
          // 8. document.cookie에서 확인 (브라우저에 저장된 쿠키)
          else if (document.cookie) {
            console.log('[2단계] document.cookie에서 확인:', document.cookie);
            const cookiePatterns = [
              /(?:access_token|accessToken)=([^;,\s]+)/i,
              /(?:token)=([^;,\s]+)/i,
              /(?:auth_token|authToken)=([^;,\s]+)/i,
              /(?:jwt|JWT)=([^;,\s]+)/i
            ];
            
            for (const pattern of cookiePatterns) {
              const match = document.cookie.match(pattern);
              if (match) {
                token = decodeURIComponent(match[1]);
                console.log('[2단계] ✅ 토큰 위치: document.cookie에서 추출');
                break;
              }
            }
          }
          
          if (token) {
            // 토큰에 "Bearer "가 포함되어 있으면 제거 (api.js에서 추가하므로)
            token = token.replace(/^Bearer\s+/i, '');
            console.log('[2단계] ✅ 백엔드 토큰 받음:', {
              token: token.substring(0, 30) + '...',
              tokenLength: token.length,
              token전체: token
            });
          } else {
            console.warn('[2단계] ⚠️ 백엔드 응답에 토큰이 없음');
            console.warn('[2단계] 토큰 추출 시도 결과:', {
              'result.data': result.data,
              'result.data?.token': result.data?.token,
              'result.data?.accessToken': result.data?.accessToken,
              'result.token': result.token,
              'result.accessToken': result.accessToken,
              '헤더 Authorization': lowerCaseHeaders['authorization'],
              '헤더 X-Access-Token': lowerCaseHeaders['x-access-token'],
              '헤더 Set-Cookie': lowerCaseHeaders['set-cookie'],
              'document.cookie': document.cookie ? '있음' : '없음'
            });
            console.warn('[2단계] 백엔드 응답 전체:', result);
          }
        } else {
          const errorText = await response.text().catch(() => '');
          console.warn('[2단계] 백엔드 응답 실패:', {
            status: response.status,
            statusText: response.statusText,
            errorText: errorText.substring(0, 200)
          });
        }
      } catch (apiError) {
        console.warn('[2단계] 백엔드 토큰 요청 실패 (로컬 인증으로 진행):', apiError);
        // 백엔드 토큰 요청 실패해도 로컬 인증이 성공했으면 계속 진행
      }

      // 3. 토큰 저장 (백엔드 토큰이 필수)
      console.log('[3단계] 토큰 저장 시작');
      if (token) {
        // 토큰에 "Bearer "가 포함되어 있으면 제거 (api.js에서 추가하므로)
        const cleanToken = token.replace(/^Bearer\s+/i, '');
        localStorage.setItem('adminToken', cleanToken);
        console.log('[3단계] ✅ 백엔드 토큰 저장 완료:', {
          저장된토큰: cleanToken.substring(0, 30) + '...',
          토큰길이: cleanToken.length,
          토큰전체: cleanToken,
          localStorage확인: localStorage.getItem('adminToken')?.substring(0, 30) + '...'
        });
      } else {
        // 백엔드 토큰이 없으면 로그인 실패
        console.error('[3단계] ❌ 백엔드에서 토큰을 받아오지 못했습니다.');
        console.error('[3단계] 백엔드 응답:', backendResponse);
        console.error('[3단계] document.cookie:', document.cookie);
        throw new Error('백엔드 인증에 실패했습니다. 토큰을 받아오지 못했습니다.');
      }
      
      localStorage.setItem('adminUsername', username);
      localStorage.setItem('adminType', isLocalAuth ? 'main' : 'assistant');
      
      // 저장된 토큰 확인
      const savedToken = localStorage.getItem('adminToken');
      console.log('[3단계] 저장된 사용자 정보:', {
        username: localStorage.getItem('adminUsername'),
        adminType: localStorage.getItem('adminType'),
        hasToken: !!savedToken,
        저장된토큰: savedToken ? savedToken.substring(0, 30) + '...' : '없음',
        토큰전체: savedToken
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


