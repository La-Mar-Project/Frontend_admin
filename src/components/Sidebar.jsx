import { Link, useNavigate } from 'react-router-dom';
import JJUBUL from '../assets/JJUBUL.png';

function Sidebar() {
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
    navigate('/home');
  };

  return (
    <aside className="fixed left-0 top-0 w-[256px] z-50 sidebar-responsive" style={{ height: '100vh', minHeight: '100vh', bottom: 0, overflowY: 'auto', backgroundColor: 'transparent' }}>
      {/* 로고 영역 */}
      <div className="h-[77px] ml-[53px] mt-[56px] w-[149px]" style={{ marginLeft: 'calc(53px * var(--scale))', marginTop: 'calc(56px * var(--scale))', width: 'calc(149px * var(--scale))', height: 'calc(77px * var(--scale))' }}>
        <div
          className="cursor-pointer z-10"
          onClick={handleLogoClick}
        >
          <img alt="JJUBUL 로고" className="object-contain" src={JJUBUL} style={{ width: 'calc(149px * var(--scale))', height: 'calc(42px * var(--scale))' }} />
        </div>
        <p className="font-semibold leading-[28px] text-[#2754da] text-[26px] tracking-[-0.52px]" style={{ fontSize: 'calc(26px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(5px * var(--scale))', marginTop: 'calc(7px * var(--scale))', letterSpacing: 'calc(-0.52px * var(--scale))' }}>
          관리자 페이지
        </p>
      </div>

      {/* 사이드바 메뉴 */}
      <div className="relative" style={{ height: 'calc(585px * var(--scale))', marginLeft: 'calc(25px * var(--scale))', marginTop: 'calc(109px * var(--scale))', width: 'calc(187px * var(--scale))' }}>
        {/* 운영관리 섹션 */}
        <p className="font-semibold leading-[28px] text-[#272c3c] text-[26px]" style={{ fontSize: 'calc(26px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(41px * var(--scale))' }}>
          운영관리
        </p>
        <Link
          to="/company-info"
          className="block leading-[28px] text-[#272c3c] text-[22px] hover:opacity-80"
          style={{ fontFamily: 'Pretendard', fontWeight: 500, fontSize: 'calc(22px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(43px * var(--scale))', marginTop: 'calc(21px * var(--scale))' }}
        >
          회사정보
        </Link>
        <Link
          to="/dashboard"
          className="block leading-[28px] text-[#272c3c] text-[22px] hover:opacity-80"
          style={{ fontFamily: 'Pretendard', fontWeight: 500, fontSize: 'calc(22px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(43px * var(--scale))', marginTop: 'calc(21px * var(--scale))' }}
        >
          대시보드
        </Link>
        <Link
          to="/sms"
          className="block leading-[28px] text-[#272c3c] text-[22px] hover:opacity-80"
          style={{ fontFamily: 'Pretendard', fontWeight: 500, fontSize: 'calc(22px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(43px * var(--scale))', marginTop: 'calc(21px * var(--scale))' }}
        >
          SMS 문구설정
        </Link>
        <Link
          to="/assistant-manager"
          className="block leading-[28px] text-[#272c3c] text-[22px] hover:opacity-80"
          style={{ fontFamily: 'Pretendard', fontWeight: 500, fontSize: 'calc(22px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(43px * var(--scale))', marginTop: 'calc(21px * var(--scale))' }}
        >
          보조관리자
        </Link>
        <Link
          to="/admin-log"
          className="block leading-[28px] text-[#272c3c] text-[22px] hover:opacity-80"
          style={{ fontFamily: 'Pretendard', fontWeight: 500, fontSize: 'calc(22px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(43px * var(--scale))', marginTop: 'calc(21px * var(--scale))' }}
        >
          관리자 접속 로그
        </Link>

        {/* 예약관리 섹션 */}
        <p className="font-semibold leading-[28px] text-[#272c3c] text-[26px]" style={{ fontSize: 'calc(26px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(41px * var(--scale))', marginTop: 'calc(67px * var(--scale))' }}>
          예약관리
        </p>
        <Link
          to="/ship-info"
          className="block leading-[28px] text-[#272c3c] text-[22px] hover:opacity-80"
          style={{ fontFamily: 'Pretendard', fontWeight: 500, fontSize: 'calc(22px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(43px * var(--scale))', marginTop: 'calc(21px * var(--scale))' }}
        >
          배 정보 관리
        </Link>
        <Link
          to="/reservation-calendar"
          className="block leading-[28px] text-[#272c3c] text-[22px] hover:opacity-80"
          style={{ fontFamily: 'Pretendard', fontWeight: 500, fontSize: 'calc(22px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(43px * var(--scale))', marginTop: 'calc(21px * var(--scale))' }}
        >
          예약달력
        </Link>
        <Link
          to="/reservation-management"
          className="block leading-[28px] text-[#272c3c] text-[22px] hover:opacity-80"
          style={{ fontFamily: 'Pretendard', fontWeight: 500, fontSize: 'calc(22px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(43px * var(--scale))', marginTop: 'calc(21px * var(--scale))' }}
        >
          예약관리
        </Link>
        <Link
          to="/pre-reservation-coupon"
          className="block leading-[28px] text-[#272c3c] text-[22px] hover:opacity-80"
          style={{ fontFamily: 'Pretendard', fontWeight: 500, fontSize: 'calc(22px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(43px * var(--scale))', marginTop: 'calc(21px * var(--scale))' }}
        >
          선예약쿠폰 관리
        </Link>
        <Link
          to="/sms-history"
          className="block leading-[28px] text-[#272c3c] text-[22px] hover:opacity-80"
          style={{ fontFamily: 'Pretendard', fontWeight: 500, fontSize: 'calc(22px * var(--scale))', lineHeight: 'calc(28px * var(--scale))', marginLeft: 'calc(43px * var(--scale))', marginTop: 'calc(21px * var(--scale))' }}
        >
          SMS 발송내역
        </Link>

        {/* Icons */}
        <svg className="absolute" style={{ left: 'calc(0px * var(--scale))', top: 'calc(2px * var(--scale))', width: 'calc(24px * var(--scale))', height: 'calc(24px * var(--scale))' }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 15L18.55 16.55C17.59 18.24 15.22 19.59 13 19.92V11H16V9H13V7.82C14.16 7.4 15 6.3 15 5C15 3.35 13.65 2 12 2C10.35 2 9 3.35 9 5C9 6.3 9.84 7.4 11 7.82V9H8V11H11V19.92C8.78 19.59 6.41 18.24 5.45 16.55L7 15L3 12V15C3 18.88 7.92 22 12 22C16.08 22 21 18.88 21 15V12L17 15ZM12 4C12.55 4 13 4.45 13 5C13 5.55 12.55 6 12 6C11.45 6 11 5.55 11 5C11 4.45 11.45 4 12 4Z" fill="#2754DA"/>
        </svg>
        <svg className="absolute" style={{ left: 'calc(0px * var(--scale))', top: 'calc(314px * var(--scale))', width: 'calc(24px * var(--scale))', height: 'calc(24px * var(--scale))' }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 22C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18ZM13 4L18 9H13V4ZM7 8H10V10H7V8ZM7 12H17V14H7V12ZM7 16H17V18H7V16Z" fill="#2754DA"/>
        </svg>
      </div>
    </aside>
  );
}

export default Sidebar;

