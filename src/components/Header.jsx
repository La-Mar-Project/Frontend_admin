import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  
  // 현재 날짜 계산
  const today = new Date();
  
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
      navigate('/login');
    }
  };

  const handleHomepage = () => {
    window.open('https://example.com', '_blank');
  };

  return (
    <header className="fixed top-0 h-[58px] bg-[#FFFFFF] z-40 flex items-center header-responsive" style={{ paddingLeft: 'calc(42px * var(--scale))', paddingRight: 'calc(42px * var(--scale))' }}>
      <p className="font-medium leading-[28px] text-[#73757c] text-[20px] whitespace-nowrap" style={{ fontSize: 'calc(20px * var(--scale))', lineHeight: 'calc(28px * var(--scale))' }}>
        <span className="font-bold">닉네임</span>님 좋은 하루 되세요!
      </p>
      <p className="font-medium leading-[28px] text-[20px] text-[#73757c] whitespace-nowrap" style={{ marginLeft: 'calc(235px * var(--scale))', fontSize: 'calc(20px * var(--scale))', lineHeight: 'calc(28px * var(--scale))' }}>
        {formatDate(today)}
      </p>
      <div className="ml-auto flex" style={{ gap: 'calc(10px * var(--scale))' }}>
        <button 
          onClick={handleHomepage}
          className="h-[36px] px-[20px] py-[4px] rounded-[20px] font-medium leading-normal text-[20px] text-[#2754da] cursor-pointer hover:opacity-80"
          style={{
            height: 'calc(36px * var(--scale))',
            paddingLeft: 'calc(20px * var(--scale))',
            paddingRight: 'calc(20px * var(--scale))',
            paddingTop: 'calc(4px * var(--scale))',
            paddingBottom: 'calc(4px * var(--scale))',
            fontSize: 'calc(20px * var(--scale))',
            borderRadius: 'calc(20px * var(--scale))'
          }}
        >
          홈페이지 바로가기
        </button>
        <button 
          onClick={handleLogout}
          className="h-[36px] px-[20px] py-[4px] rounded-[20px] font-medium leading-normal text-[20px] text-[#2754da] cursor-pointer hover:opacity-80"
          style={{
            height: 'calc(36px * var(--scale))',
            paddingLeft: 'calc(20px * var(--scale))',
            paddingRight: 'calc(20px * var(--scale))',
            paddingTop: 'calc(4px * var(--scale))',
            paddingBottom: 'calc(4px * var(--scale))',
            fontSize: 'calc(20px * var(--scale))',
            borderRadius: 'calc(20px * var(--scale))'
          }}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header;

