import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

function AdminLog() {
  // usestate 선언
  // 날짜, 타입, 관리자명, 선택된 항목
  const [startDate, setStartDate] = useState(''); // 시작날짜
  const [endDate, setEndDate] = useState(''); // 끝날짜
  const [selectedType, setSelectedType] = useState(''); // 타입
  const [adminName, setAdminName] = useState(''); // 관리자명
  const [selectedItems, setSelectedItems] = useState([]); // 선택된 항목
  const [accessLogs, setAccessLogs] = useState([]); // 접속 기록
  const [filteredLogs, setFilteredLogs] = useState([]); // 필터링된 기록
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  // localStorage에서 접속 기록 불러오기
  useEffect(() => {
    const loadAccessLogs = () => {
      const logs = JSON.parse(localStorage.getItem('adminAccessLogs') || '[]');
      setAccessLogs(logs);
      setFilteredLogs(logs);
    };
    
    loadAccessLogs();
    
    // 주기적으로 업데이트 (다른 탭에서 로그인/로그아웃한 경우 대비)
    const interval = setInterval(loadAccessLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedType('');
    setAdminName('');
    setFilteredLogs(accessLogs);
  };

  const handleSearch = () => {
    let filtered = [...accessLogs];

    // 날짜 필터링
    if (startDate) {
      filtered = filtered.filter(log => {
        // log.date 형식: "2025.01.01" -> "20250101"
        const logDate = log.date.replace(/\./g, '');
        // startDate 형식: "2025-01-01" -> "20250101"
        const start = startDate.replace(/-/g, '');
        return logDate >= start;
      });
    }
    if (endDate) {
      filtered = filtered.filter(log => {
        const logDate = log.date.replace(/\./g, '');
        const end = endDate.replace(/-/g, '');
        return logDate <= end;
      });
    }

    // 타입 필터링
    if (selectedType) {
      filtered = filtered.filter(log => log.type === selectedType);
    }

    // 관리자명 필터링
    if (adminName) {
      filtered = filtered.filter(log => 
        log.name.toLowerCase().includes(adminName.toLowerCase()) ||
        log.userId.toLowerCase().includes(adminName.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
    setCurrentPage(0);
  };

  const handleDelete = () => {
    if (selectedItems.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (window.confirm(`${selectedItems.length}개의 항목을 삭제하시겠습니까?`)) {
      const updatedLogs = accessLogs.filter(log => !selectedItems.includes(log.id));
      localStorage.setItem('adminAccessLogs', JSON.stringify(updatedLogs));
      setAccessLogs(updatedLogs);
      setFilteredLogs(updatedLogs);
      setSelectedItems([]);
      setCurrentPage(0);
    }
  };

  // 캘린더 생성 함수
  const generateCalendarDays = (year, month) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const prevLastDay = new Date(year, month - 1, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();
    
    const days = [];
    
    // 이전 달 날짜
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        month: month - 1,
        year: year,
        isPrevMonth: true
      });
    }
    
    // 현재 달 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        month: month,
        year: year,
        isCurrentMonth: true
      });
    }
    
    // 다음 달 날짜
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        month: month + 1,
        year: year,
        isNextMonth: true
      });
    }
    
    return days;
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (day) => {
    const dateStr = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
    
    if (showStartCalendar) {
      setStartDate(dateStr);
      setShowStartCalendar(false);
      if (!endDate || dateStr > endDate) {
        setEndDate('');
      }
    } else if (showEndCalendar) {
      if (startDate && dateStr < startDate) {
        alert('끝날짜는 시작날짜보다 이후여야 합니다.');
        return;
      }
      setEndDate(dateStr);
      setShowEndCalendar(false);
    }
  };

  // 날짜 범위 확인 함수
  const isDateInRange = (day) => {
    if (!startDate || !endDate) return false;
    const dateStr = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
    return dateStr >= startDate && dateStr <= endDate;
  };

  const isStartDate = (day) => {
    if (!startDate) return false;
    const dateStr = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
    return dateStr === startDate;
  };

  const isEndDate = (day) => {
    if (!endDate) return false;
    const dateStr = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
    return dateStr === endDate;
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-[26px] px-[42px] py-[26px]">
        <div className="flex flex-col gap-[10px] w-full mx-auto">
          <div 
            className="flex flex-col gap-[10px] px-[60px] py-[40px] rounded-[20px] title-section" 
            style={{ 
              background: 'rgba(247, 248, 252, 1)',
              boxShadow: '0 4px 4px 0 rgba(39, 84, 218, 0.2)'
            }}
          >
            <h1 className="text-[30px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
              관리자 접속기록
            </h1>
            <p className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard', lineHeight: '23px' }}>
              관리자 아이디의 접속기록입니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[65px]">
          <div className="flex flex-col gap-[10px]">
            <div className="flex justify-center items-center px-[60px] py-[40px]">
              <h2 className="text-[25px] font-bold text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                관리자 접속기록
              </h2>
            </div>

            <div className="flex flex-col gap-[40px] pl-[60px] pr-[64px]">
              <div className="flex flex-col gap-[15px] w-full max-w-[986px]">
                <div className="flex flex-col gap-[13px]">
                  <div className="flex items-center gap-[10px]">
                    <div className="flex items-center px-[10px] py-[8px] w-[67px]">
                      <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>날짜</span>
                    </div>
                    <div className="flex items-center gap-[12px] relative">
                      <div 
                        className="flex items-center gap-[10px] px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px] cursor-pointer"
                        onClick={() => {
                          setShowStartCalendar(!showStartCalendar);
                          setShowEndCalendar(false);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                        </svg>
                        <span className={`text-[16px] font-normal ${startDate ? 'text-[#272C3C]' : 'text-[#BDBDBD]'} flex-1`} style={{ fontFamily: 'Pretendard' }}>
                          {startDate || '시작날짜'}
                        </span>
                      </div>
                      <div className="flex justify-center items-center px-[10px] py-[9px] w-[28px]">
                        <span className="text-[16px] font-semibold text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>-</span>
                      </div>
                      <div 
                        className="flex items-center gap-[10px] px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px] cursor-pointer"
                        onClick={() => {
                          setShowEndCalendar(!showEndCalendar);
                          setShowStartCalendar(false);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                        </svg>
                        <span className={`text-[16px] font-normal ${endDate ? 'text-[#272C3C]' : 'text-[#BDBDBD]'} flex-1`} style={{ fontFamily: 'Pretendard' }}>
                          {endDate || '끝날짜'}
                        </span>
                      </div>
                      
                      {/* 시작날짜 캘린더 팝업 */}
                      {showStartCalendar && (
                        <div className="absolute top-[45px] left-0 z-50 bg-white rounded-[10px] shadow-lg p-[20px] border border-[#E7E7E7]">
                          <div className="flex items-center justify-between mb-[15px]">
                            <button onClick={() => setYear(year - 1)} className="text-[#2754DA] text-[20px] font-bold">&lt;&lt;</button>
                            <button onClick={() => {
                              if (month === 1) {
                                setMonth(12);
                                setYear(year - 1);
                              } else {
                                setMonth(month - 1);
                              }
                            }} className="text-[#2754DA] text-[20px] font-bold">&lt;</button>
                            <p className="text-[#2754DA] text-[18px] font-medium">{year}년 {month}월</p>
                            <button onClick={() => {
                              if (month === 12) {
                                setMonth(1);
                                setYear(year + 1);
                              } else {
                                setMonth(month + 1);
                              }
                            }} className="text-[#2754DA] text-[20px] font-bold">&gt;</button>
                            <button onClick={() => setYear(year + 1)} className="text-[#2754DA] text-[20px] font-bold">&gt;&gt;</button>
                          </div>
                          <div className="grid grid-cols-7 gap-[5px]">
                            {daysOfWeek.map((day, idx) => (
                              <div key={idx} className="text-center text-[14px] font-medium py-[5px]">{day}</div>
                            ))}
                            {generateCalendarDays(year, month).map((day, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleDateSelect(day)}
                                className={`text-center text-[14px] py-[8px] cursor-pointer rounded
                                  ${day.isPrevMonth || day.isNextMonth ? 'text-[#BDBDBD]' : 'text-[#272C3C]'}
                                  ${isStartDate(day) ? 'bg-[#2754DA] text-white' : ''}
                                  ${isEndDate(day) ? 'bg-[#2754DA] text-white' : ''}
                                  ${isDateInRange(day) && !isStartDate(day) && !isEndDate(day) ? 'bg-[#EEF4FF]' : ''}
                                  hover:bg-[#EEF4FF]`}
                              >
                                {day.date}
                              </div>
                            ))}
                          </div>
                          <button 
                            onClick={() => setShowStartCalendar(false)}
                            className="mt-[15px] w-full py-[8px] bg-[#EEF4FF] text-[#2754DA] rounded-[5px] font-medium"
                          >
                            닫기
                          </button>
                        </div>
                      )}
                      
                      {/* 끝날짜 캘린더 팝업 */}
                      {showEndCalendar && (
                        <div className="absolute top-[45px] left-[210px] z-50 bg-white rounded-[10px] shadow-lg p-[20px] border border-[#E7E7E7]">
                          <div className="flex items-center justify-between mb-[15px]">
                            <button onClick={() => setYear(year - 1)} className="text-[#2754DA] text-[20px] font-bold">&lt;&lt;</button>
                            <button onClick={() => {
                              if (month === 1) {
                                setMonth(12);
                                setYear(year - 1);
                              } else {
                                setMonth(month - 1);
                              }
                            }} className="text-[#2754DA] text-[20px] font-bold">&lt;</button>
                            <p className="text-[#2754DA] text-[18px] font-medium">{year}년 {month}월</p>
                            <button onClick={() => {
                              if (month === 12) {
                                setMonth(1);
                                setYear(year + 1);
                              } else {
                                setMonth(month + 1);
                              }
                            }} className="text-[#2754DA] text-[20px] font-bold">&gt;</button>
                            <button onClick={() => setYear(year + 1)} className="text-[#2754DA] text-[20px] font-bold">&gt;&gt;</button>
                          </div>
                          <div className="grid grid-cols-7 gap-[5px]">
                            {daysOfWeek.map((day, idx) => (
                              <div key={idx} className="text-center text-[14px] font-medium py-[5px]">{day}</div>
                            ))}
                            {generateCalendarDays(year, month).map((day, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleDateSelect(day)}
                                className={`text-center text-[14px] py-[8px] cursor-pointer rounded
                                  ${day.isPrevMonth || day.isNextMonth ? 'text-[#BDBDBD]' : 'text-[#272C3C]'}
                                  ${isStartDate(day) ? 'bg-[#2754DA] text-white' : ''}
                                  ${isEndDate(day) ? 'bg-[#2754DA] text-white' : ''}
                                  ${isDateInRange(day) && !isStartDate(day) && !isEndDate(day) ? 'bg-[#EEF4FF]' : ''}
                                  hover:bg-[#EEF4FF]`}
                              >
                                {day.date}
                              </div>
                            ))}
                          </div>
                          <button 
                            onClick={() => setShowEndCalendar(false)}
                            className="mt-[15px] w-full py-[8px] bg-[#EEF4FF] text-[#2754DA] rounded-[5px] font-medium"
                          >
                            닫기
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-[10px] h-[37px] relative">
                    <div className="flex items-center px-[10px] py-[8px] w-[67px]">
                      <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>타입</span>
                    </div>
                    <div className="flex items-center gap-[5px] h-[37px]">
                      <div 
                        className="flex justify-between items-center px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px] h-[37px] cursor-pointer"
                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      >
                        <span className={`text-[16px] font-normal ${selectedType ? 'text-[#272C3C]' : 'text-[#BDBDBD]'}`} style={{ fontFamily: 'Pretendard' }}>
                          {selectedType || '타입 선택'}
                        </span>
                        <svg width="20" height="27" viewBox="0 0 20 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 11L10 17L15 11" stroke="#BDBDBD" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {showTypeDropdown && (
                        <div className="absolute top-[45px] left-[80px] z-50 bg-white rounded-[10px] shadow-lg border border-[#E7E7E7] w-[184px]">
                          <div 
                            className="px-[15px] py-[10px] hover:bg-[#EEF4FF] cursor-pointer rounded-t-[10px]"
                            onClick={() => {
                              setSelectedType('로그인');
                              setShowTypeDropdown(false);
                            }}
                          >
                            <p className="text-[#272C3C] font-pretendard text-[16px]">로그인</p>
                          </div>
                          <div 
                            className="px-[15px] py-[10px] hover:bg-[#EEF4FF] cursor-pointer rounded-b-[10px]"
                            onClick={() => {
                              setSelectedType('로그아웃');
                              setShowTypeDropdown(false);
                            }}
                          >
                            <p className="text-[#272C3C] font-pretendard text-[16px]">로그아웃</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-start gap-[10px]">
                    <div className="flex justify-center items-center px-[10px] py-[8px]">
                      <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>관리자</span>
                    </div>
                    <div className="flex items-center gap-[5px]">
                      <div className="flex items-center gap-[10px] px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px]">
                        <input 
                          type="text" 
                          placeholder="관리자명 입력" 
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="text-[16px] font-normal text-[#BDBDBD] bg-transparent outline-none w-full" 
                          style={{ fontFamily: 'Pretendard' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-[10px] px-[10px]">
                    <button 
                      onClick={handleResetFilters}
                      className="flex justify-center items-center px-[20px] py-[9px] rounded-[20px] border-2 border-[#DFE7F4] bg-[#EEF4FF]"
                    >
                      <span className="text-[16px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>필터 초기화하기</span>
                    </button>
                    <button 
                      onClick={handleSearch}
                      className="flex justify-center items-center px-[20px] py-[9px] rounded-[20px] border-2 border-[#DFE7F4] bg-[#EEF4FF]"
                    >
                      <span className="text-[16px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>검색하기</span>
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="flex justify-center items-center px-[20px] py-[9px] rounded-[20px] border-2 border-[#DFE7F4] bg-[#EEF4FF]"
                    >
                      <span className="text-[16px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>삭제하기</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full max-w-[986px]">
                <div className="flex items-center">
                  <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-[#EEF4FF] w-[66px] h-[45px]">
                    <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>선택</span>
                  </div>
                  <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-[#EEF4FF] w-[66px] h-[45px]">
                    <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>순번</span>
                  </div>
                  <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-[#EEF4FF] w-[200px] h-[45px]">
                    <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis text-center" style={{ fontFamily: 'Pretendard' }}>아이디</span>
                  </div>
                  <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-[#EEF4FF] w-[155px] h-[45px]">
                    <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>타입</span>
                  </div>
                  <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-[#EEF4FF] w-[155px] h-[45px]">
                    <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis text-center" style={{ fontFamily: 'Pretendard' }}>이름</span>
                  </div>
                  <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-[#EEF4FF] w-[194px] h-[45px]">
                    <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis text-center" style={{ fontFamily: 'Pretendard' }}>접속일시</span>
                  </div>
                  <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-[#EEF4FF] w-[150px] h-[45px]">
                    <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>접속여부</span>
                  </div>
                </div>

                {filteredLogs.length === 0 ? (
                  <div className="flex justify-center items-center py-[40px] border-2 border-[#DFE7F4] bg-white">
                    <span className="text-[18px] font-normal text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                      접속 기록이 없습니다.
                    </span>
                  </div>
                ) : (
                  filteredLogs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((item, index) => (
                    <div key={item.id} className="flex items-center">
                      <div className="flex justify-center items-center px-[20px] border-2 border-[#DFE7F4] bg-white w-[66px] h-[48px]">
                        <div className="flex items-center p-[10px]">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="w-[24px] h-[24px] appearance-none border-2 border-[#1840B8] rounded-[4px] bg-white cursor-pointer checked:bg-white relative"
                            style={{
                              backgroundImage: selectedItems.includes(item.id) ? 'none' : 'none'
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-white w-[66px] h-[48px]">
                        <span className="text-[18px] font-normal text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>{filteredLogs.length - (currentPage * itemsPerPage + index)}</span>
                      </div>
                      <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-white w-[200px] h-[48px]">
                        <span className="text-[18px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{item.userId}</span>
                      </div>
                      <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-white w-[155px] h-[48px]">
                        <span className="text-[18px] font-normal text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>{item.type}</span>
                      </div>
                      <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-white w-[155px] h-[48px]">
                        <span className="text-[18px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{item.name}</span>
                      </div>
                      <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-white w-[194px] h-[48px]">
                        <span className="text-[18px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{item.dateTime || item.date}</span>
                      </div>
                      <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-white w-[150px] h-[48px]">
                        <span className="text-[18px] font-normal text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>{item.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {(() => {
            const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
            return filteredLogs.length > itemsPerPage && totalPages > 0 && (
              <div className="flex w-full max-w-[1056px] py-[50px] justify-center items-center gap-[10px] bg-white">
                <div className="flex items-center gap-[20px]">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 11L10 20.5L20 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M30 11L20 20.5L30 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="30" height="41" viewBox="0 0 30 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 11L10 20.5L20 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-[4px]">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex w-[40px] px-[10px] py-[10px] flex-col justify-center items-center gap-[10px] rounded-[5px] ${
                          currentPage === pageNum ? 'border border-[#73757C] bg-[#F2F2F2]' : ''
                        }`}
                      >
                        <div className="text-center font-medium text-[18px] leading-normal text-[#73757C]" 
                             style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                          {pageNum + 1}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-[20px]">
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="30" height="41" viewBox="0 0 30 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 11L20 20.5L10 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 11L11.5 20.5L1.5 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.5 11L21.5 20.5L11.5 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </Layout>
  );
}

export default AdminLog;
