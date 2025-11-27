import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../utils/api';

function SMSHistory() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedShip, setSelectedShip] = useState('');
  const [smsHistoryData, setSmsHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  // SMS 내역 조회 함수
  const fetchSMSHistory = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      let queryParams = [];
      
      if (startDate) {
        queryParams.push(`from=${encodeURIComponent(startDate)}`);
      }
      if (endDate) {
        queryParams.push(`to=${encodeURIComponent(endDate)}`);
      }
      if (selectedType === 'SUCCESS' || selectedType === 'FAILURE') {
        queryParams.push(`result=${encodeURIComponent(selectedType)}`);
      }
      if (page !== undefined && page !== null) {
        queryParams.push(`pageable=${page}`);
      }
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const apiUrl = `/sms/search${queryString}`;
      console.log('[SMSHistory] API 요청 URL:', apiUrl);
      
      // GET 요청
      const response = await apiGet(apiUrl);
      
      console.log('[SMSHistory] API 응답 상태:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('[SMSHistory] SMS 내역 조회 결과:', result);
        
        // API 응답이 배열인지 객체인지 확인
        let smsData = [];
        
        if (Array.isArray(result)) {
          smsData = result;
        } else if (result.success && result.data) {
          // result.data가 배열인 경우
          if (Array.isArray(result.data)) {
            smsData = result.data;
          } 
          // result.data.content가 배열인 경우 (페이지네이션 응답)
          else if (result.data.content && Array.isArray(result.data.content)) {
            smsData = result.data.content;
          }
          // result.data가 객체이지만 content가 없는 경우
          else {
            smsData = [];
          }
        } else if (result.data) {
          smsData = Array.isArray(result.data) ? result.data : [];
        }
        
        const formattedData = smsData.map((sms, index) => {
          // 발송 시각 필드 매핑 (timeStamp 우선)
          const sendTimeValue = sms.timeStamp || 
                               sms.sendTime || 
                               sms.sentAt || 
                               sms.createdAt || 
                               sms.sentTime ||
                               sms.sendAt ||
                               sms.timestamp ||
                               sms.date ||
                               '';
          
          // 날짜 포맷팅 (ISO 형식인 경우)
          let formattedTime = sendTimeValue;
          if (sendTimeValue && sendTimeValue.includes('T')) {
            try {
              const date = new Date(sendTimeValue);
              if (!isNaN(date.getTime())) {
                formattedTime = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
              }
            } catch (e) {
              // 포맷팅 실패 시 원본 값 유지
            }
          }
          
          // SMS 종류 판단 (content에서 추출)
          let smsType = '사용중';
          if (sms.content) {
            if (sms.content.includes('예약 접수 확인')) {
              smsType = '예약접수';
            } else if (sms.content.includes('출항을 확정')) {
              smsType = '출항확정';
            } else if (sms.content.includes('예약 취소')) {
              smsType = '예약취소';
            } else if (sms.content.includes('출항보류')) {
              smsType = '출항보류';
            } else if (sms.content.includes('출항 취소')) {
              smsType = '출항취소';
            }
          }
          
          return {
          id: sms.id || sms.smsId || (page * 10 + index + 1),
            smsType: sms.smsType || sms.type || smsType,
          phone: sms.phone || sms.phoneNumber || sms.recipientPhone || '',
            sendTime: formattedTime,
          status: sms.status || (sms.result === 'SUCCESS' ? '발송완료' : sms.result === 'FAILURE' ? '발송실패' : '발송완료')
          };
        });
        
        setSmsHistoryData(formattedData);
      } else {
        console.error('[SMSHistory] SMS 내역 조회 실패:', response.status, response.statusText);
        console.error('[SMSHistory] 실패한 URL:', apiUrl);
        
        // 404나 405 같은 에러의 경우 빈 배열로 설정 (백엔드 API 미구현 가능성)
        setSmsHistoryData([]);
        if (response.status === 404) {
          console.warn('[SMSHistory] 백엔드 API가 아직 구현되지 않았을 수 있습니다: /sms/search');
          console.warn('[SMSHistory] 404 에러 - API 엔드포인트를 확인해주세요.');
        }
      }
    } catch (error) {
      console.error('[SMSHistory] SMS 내역 조회 오류:', error);
      setSmsHistoryData([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedType]);

  // 초기 로드
  useEffect(() => {
    fetchSMSHistory(0);
  }, [fetchSMSHistory]);

  const toggleRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (selectedRows.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (window.confirm(`${selectedRows.length}개 항목을 삭제하시겠습니까?`)) {
      setSelectedRows([]);
      // 삭제 후 목록 다시 불러오기
      fetchSMSHistory(currentPage);
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedType('');
    setSelectedShip('');
    setSelectedStatus('');
    setCurrentPage(0);
    // 필터 초기화 후 목록 다시 불러오기
    setTimeout(() => {
      fetchSMSHistory(0);
    }, 0);
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

  const handleSave = async () => {
    // 저장 버튼 클릭 시 검색
    await fetchSMSHistory(currentPage);
    alert('필터가 저장되었습니다.');
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(smsHistoryData.length / itemsPerPage);
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-[26px] px-[42px] py-[26px] pb-[300px]">
        <div className="flex flex-col gap-[10px] w-full mx-auto">
          <div className="flex flex-col gap-[10px] px-[60px] py-[40px] rounded-[20px] bg-[#F7F8FC] title-section" style={{ boxShadow: '0 4px 4px 0 rgba(39, 84, 218, 0.2)' }}>
            <h1 className="text-[30px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
              SMS 발송내역
            </h1>
            <p className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard', lineHeight: '23px' }}>
              SMS 발송내역 및 발송여부를 확인할 수 있습니다.
            </p>

            <div className="flex flex-col gap-[13px] pt-[10px]">
              <div className="flex items-center justify-between">
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
                        setShowStatusDropdown(false);
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
                        setShowStatusDropdown(false);
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

                <div className="flex items-center gap-[10px]">
                  <div className="flex items-center px-[10px] py-[8px] w-[67px]">
                    <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>발송여부</span>
                  </div>
                  <div className="flex items-center gap-[5px] h-[37px] relative">
                    <div 
                      className="flex justify-between items-center px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px] h-[37px] cursor-pointer"
                      onClick={() => {
                        setShowStatusDropdown(!showStatusDropdown);
                        setShowStartCalendar(false);
                        setShowEndCalendar(false);
                      }}
                    >
                      <span className={`text-[16px] font-normal ${selectedStatus ? 'text-[#272C3C]' : 'text-[#BDBDBD]'}`} style={{ fontFamily: 'Pretendard' }}>
                        {selectedStatus || '발송여부 선택'}
                      </span>
                      <svg width="20" height="27" viewBox="0 0 20 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 11L10 17L15 11" stroke="#BDBDBD" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {showStatusDropdown && (
                      <div className="absolute top-[45px] left-0 z-50 bg-white rounded-[10px] shadow-lg border border-[#E7E7E7] w-[184px]">
                        <div 
                          className="px-[15px] py-[10px] hover:bg-[#EEF4FF] cursor-pointer rounded-t-[10px]"
                          onClick={() => {
                            setSelectedStatus('성공');
                            setShowStatusDropdown(false);
                          }}
                        >
                          <p className="text-[#272C3C] font-pretendard text-[16px]">성공</p>
                        </div>
                        <div 
                          className="px-[15px] py-[10px] hover:bg-[#EEF4FF] cursor-pointer"
                          onClick={() => {
                            setSelectedStatus('실패');
                            setShowStatusDropdown(false);
                          }}
                        >
                          <p className="text-[#272C3C] font-pretendard text-[16px]">실패</p>
                        </div>
                        <div 
                          className="px-[15px] py-[10px] hover:bg-[#EEF4FF] cursor-pointer rounded-b-[10px]"
                          onClick={() => {
                            setSelectedStatus('');
                            setShowStatusDropdown(false);
                          }}
                        >
                          <p className="text-[#272C3C] font-pretendard text-[16px]">발송여부 선택</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center">
                <div className="flex px-[10px] items-center gap-[10px]">
                  <button
                    onClick={handleReset}
                    className="flex px-[20px] py-[9px] justify-center items-center gap-[10px] rounded-[20px] border border-[#BDBDBD] bg-white"
                  >
                    <span className="text-[16px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                      검색하기
                    </span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex px-[20px] py-[9px] justify-center items-center gap-[10px] rounded-[20px] border border-[#BDBDBD] bg-white"
                  >
                    <span className="text-[16px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                      저장하기
                    </span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex px-[20px] py-[9px] justify-center items-center gap-[10px] rounded-[20px] border border-[#BDBDBD] bg-white"
                  >
                    <span className="text-[16px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                      삭제하기
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[65px]">
          <div className="flex flex-col gap-[10px]">
            <div className="flex justify-center items-center px-[60px] py-[40px] gap-[10px]">
              <h2 className="text-[25px] font-bold text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                SMS 발송목록
              </h2>
            </div>

            <div className="flex flex-col gap-[40px] pl-[60px]">
              <div className="flex flex-col gap-[15px] w-[986px] items-end">
                <div className="flex items-center gap-[10px] px-[10px]">
                  <button
                    onClick={handleDelete}
                    className="flex h-[36px] px-[20px] py-[4px] justify-center items-center gap-[10px] rounded-[20px] border-2 border-[#DFE7F4] bg-[#EEF4FF]"
                  >
                    <span className="text-[18px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                      삭제하기
                    </span>
                  </button>
                </div>

                <div className="w-[986px] flex flex-col">
                  <div className="flex items-center">
                    <div className="flex w-[66px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>선택</span>
                    </div>
                    <div className="flex w-[66px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>순번</span>
                    </div>
                    <div className="flex w-[153px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>SMS 종류</span>
                    </div>
                    <div className="flex w-[243px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>연락처</span>
                    </div>
                    <div className="flex w-[200px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>발송시각</span>
                    </div>
                    <div className="flex w-[151px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>발송여부</span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex w-full py-[40px] justify-center items-center">
                      <span className="text-[18px] font-normal text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                        조회 중...
                      </span>
                    </div>
                  ) : smsHistoryData.length === 0 ? (
                    <div className="flex w-full py-[40px] justify-center items-center">
                      <span className="text-[18px] font-normal text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                        SMS 발송 내역이 없습니다.
                      </span>
                    </div>
                  ) : (
                    smsHistoryData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((row, index) => (
                      <div key={row.id || index} className="flex items-center">
                      <div className="flex w-[66px] h-[48px] px-[20px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white">
                        <div className="flex p-[10px] items-center gap-[10px]">
                          <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 44 44" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            className="cursor-pointer"
                            onClick={() => toggleRow(row.id)}
                          >
                            <path 
                              d="M16 10.5H28C31.0376 10.5 33.5 12.9624 33.5 16V28C33.5 31.0376 31.0376 33.5 28 33.5H16C12.9624 33.5 10.5 31.0376 10.5 28V16C10.5 12.9624 12.9624 10.5 16 10.5Z" 
                              fill={selectedRows.includes(row.id) ? "#1840B8" : "white"}
                              stroke="#1840B8"
                            />
                            {selectedRows.includes(row.id) && (
                              <path 
                                d="M18 22L21 25L26 19" 
                                stroke="white" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            )}
                          </svg>
                        </div>
                      </div>
                      <div className="flex w-[66px] h-[48px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white">
                          <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>{currentPage * itemsPerPage + index + 1}</span>
                      </div>
                      <div className="flex w-[153px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px]">
                          <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>{row.smsType || 'N/A'}</span>
                      </div>
                      <div className="flex w-[243px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px]">
                          <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{row.phone || 'N/A'}</span>
                      </div>
                      <div className="flex w-[200px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px]">
                          <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{row.sendTime || 'N/A'}</span>
                      </div>
                      <div className="flex w-[151px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px]">
                          <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>{row.status || 'N/A'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            {(() => {
              const totalPages = Math.ceil(smsHistoryData.length / itemsPerPage);
              if (smsHistoryData.length <= itemsPerPage || totalPages <= 0) return null;
              return (
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
        </div>
      </div>
    </Layout>
  );
}

export default SMSHistory;
