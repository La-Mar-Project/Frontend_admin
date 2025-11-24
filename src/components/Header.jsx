import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';

function Header() {
  const navigate = useNavigate();
  
  // 현재 날짜 계산
  const today = new Date();
  
  // 현재 로그인한 사용자 정보
  const currentUser = getCurrentUser() || '관리자';
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}(${weekday})`;
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/login');
    }
  };

  const handleHomepage = () => {
    window.open('https://example.com', '_blank');
  };

  return (
    <header className="fixed top-0 h-[58px] bg-[#FFFFFF] z-40 flex items-center header-responsive" style={{ paddingLeft: '42px', paddingRight: '42px' }}>
      <p className="font-medium leading-[28px] text-[#73757c] text-[20px] whitespace-nowrap">
        <span className="font-bold">{currentUser}</span>님 좋은 하루 되세요!
      </p>
      <p className="font-medium leading-[28px] text-[20px] text-[#73757c] whitespace-nowrap" style={{ marginLeft: '50px' }}>
        {formatDate(today)}
      </p>
      <div className="ml-auto flex gap-[10px]">
        <button 
          onClick={handleHomepage}
          className="h-[36px] px-[20px] py-[4px] rounded-[20px] font-medium leading-normal text-[20px] text-[#2754da] cursor-pointer hover:opacity-80"
        >
          예약자페이지 바로가기
        </button>
        <button 
          onClick={handleLogout}
          className="h-[36px] px-[20px] py-[4px] rounded-[20px] font-medium leading-normal text-[20px] text-[#2754da] cursor-pointer hover:opacity-80"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header;

