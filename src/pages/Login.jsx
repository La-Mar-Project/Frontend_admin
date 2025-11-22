import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const success = login(username, password);
    
    if (success) {
      navigate('/home');
    } else {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
      setPassword('');
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
            className="w-full py-[16px] rounded-[10px] bg-[#2754DA] text-white font-pretendard text-[18px] font-bold hover:bg-[#1840B8] transition-colors mt-[10px]"
          >
            로그인
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


