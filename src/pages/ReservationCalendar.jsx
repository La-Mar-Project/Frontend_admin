import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPatch } from '../utils/api';

function ReservationCalendar() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(9);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBoat, setSelectedBoat] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [boats, setBoats] = useState([]);
  const [selectedDayReservations, setSelectedDayReservations] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [reservationFilters, setReservationFilters] = useState([]); // CONFIRMED, DELAYED, CANCELLED 중복 선택 가능
  const [isHoliday, setIsHoliday] = useState(false);
  const [allReservations, setAllReservations] = useState([]); // 전체 예약 목록 저장

  // Calendar data - this would come from an API in a real application
  const calendarData = {
    2025: {
      9: [
        // Week 1
        { date: '8/31', day: 0, tide: '1물', type: '쭈갑', price: '90,000원', desc: '쭈꾸미 위주의 낚시', status: 'closed', remaining: 0, prevMonth: true },
        { date: 1, day: 1, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 2, day: 2, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 3, day: 3, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 4, day: 4, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 5, day: 5, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 6, day: 6, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        
        // Week 2
        { date: 7, day: 0, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 8, day: 1, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 9, day: 2, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 10, day: 3, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 11, day: 4, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 12, day: 5, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 13, day: 6, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        
        // Week 3
        { date: 14, day: 0, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 15, day: 1, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 16, day: 2, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 17, day: 3, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 18, day: 4, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 19, day: 5, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 20, day: 6, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        
        // Week 4
        { date: 21, day: 0, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 22, day: 1, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 23, day: 2, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 24, day: 3, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 25, day: 4, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 26, day: 5, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 27, day: 6, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        
        // Week 5
        { date: 28, day: 0, tide: '1물', type: '쭈갑', price: '90,000원', desc: '', status: 'closed', remaining: 0 },
        { date: 29, day: 1, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: 30, day: 2, tide: '2물', type: '쭈갑', price: '90,000원', desc: '', status: 'available', remaining: 17 },
        { date: '10/1', day: 3, tide: '1물', type: '쭈갑', price: '90,000원', desc: '쭈꾸미 위주의 낚시', status: 'closed', remaining: 0, nextMonth: true },
        { date: '10/2', day: 4, tide: '1물', type: '쭈갑', price: '90,000원', desc: '쭈꾸미 위주의 낚시', status: 'closed', remaining: 0, nextMonth: true },
        { date: '10/3', day: 5, tide: '1물', type: '쭈갑', price: '90,000원', desc: '쭈꾸미 위주의 낚시', status: 'closed', remaining: 0, nextMonth: true },
        { date: '10/4', day: 6, tide: '1물', type: '쭈갑', price: '90,000원', desc: '쭈꾸미 위주의 낚시', status: 'closed', remaining: 0, nextMonth: true },
      ]
    }
  };

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  // 배 리스트 불러오기
  useEffect(() => {
    const fetchBoats = async () => {
      try {
        const response = await apiGet('/ships?page=0&size=100');
        if (response.ok) {
          const result = await response.json();
          console.log('[ReservationCalendar] 배 목록 API 응답:', result);
          
          if (result.success && result.data && result.data.content) {
            // API 응답 구조에 맞게 데이터 변환
            const boatsData = result.data.content.map((item) => ({
              id: item.ship?.shipId || item.shipId,
              shipId: item.ship?.shipId || item.shipId,
              fishType: item.ship?.fishType || item.fishType || '',
              price: item.ship?.price || item.price || 0,
              maxHeadCount: item.ship?.maxHeadCount || item.maxHeadCount || 0,
              notification: item.ship?.notification || item.notification || ''
            }));
            
            console.log('[ReservationCalendar] 변환된 배 목록:', boatsData);
            setBoats(boatsData);
          } else {
            console.warn('[ReservationCalendar] 배 목록 데이터 없음');
            setBoats([]);
          }
        } else {
          console.error('[ReservationCalendar] 배 목록 조회 실패:', response.status);
        }
      } catch (error) {
        console.error('[ReservationCalendar] 배 리스트 불러오기 실패:', error);
      }
    };
    fetchBoats();
  }, []);

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
    const remainingDays = 42 - days.length; // 6주 (42일)
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

  const handleDateSelect = (day) => {
    const dateStr = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
    
    if (showStartCalendar) {
      setStartDate(dateStr);
      setShowStartCalendar(false);
    } else if (showEndCalendar) {
      setEndDate(dateStr);
      setShowEndCalendar(false);
    }
  };

  const handleDayClick = async (dayData) => {
    if (!dayData || dayData.prevMonth || dayData.nextMonth) return;
    
    // 배를 선택하지 않으면 아무런 반응 없음
    if (!selectedBoat) {
      alert('배를 먼저 선택해주세요.');
      return;
    }
    
    // 스케줄 정보 저장
    setSelectedSchedule(dayData);
    
    // 필터 초기화
    setReservationFilters([]);
    
    // 해당 날짜의 공휴일 상태 확인 (임시로 false, 실제로는 API에서 가져와야 함)
    setIsHoliday(false);
    
    // 예약 정보 가져오기
    try {
      const searchDate = `${year}-${String(month).padStart(2, '0')}-${String(dayData.date).padStart(2, '0')}`;
      console.log('[ReservationCalendar] 예약 조회 날짜:', searchDate);
      
      // /reservations API로 전체 예약 목록 가져오기 (date 파라미터 미지원)
      const response = await apiGet('/reservations');
      
      if (response.ok) {
        const result = await response.json();
        console.log('[ReservationCalendar] 예약 목록 API 응답:', result);
        
        let reservations = [];
        if (result.success && result.data) {
          // API 응답 데이터 변환 및 날짜 필터링
          const allReservationsData = Array.isArray(result.data) ? result.data : 
                                  (result.data.content ? result.data.content : []);
          
          reservations = allReservationsData
            .filter(reservation => {
              // 예약 날짜가 선택한 날짜와 일치하는지 확인
              // API 응답 구조에 따라 날짜 필드명이 다를 수 있음
              const reservationDate = reservation.departureDate || reservation.date || reservation.scheduleDate;
              return reservationDate && reservationDate.startsWith(searchDate);
            })
            .map(reservation => ({
              reservationPublicId: reservation.reservationPublicId || reservation.reservation_public_id,
              name: reservation.name || reservation.username || '예약자',
              count: reservation.headCount || reservation.head_count || 0,
              status: getProcessStatusText(reservation.process),
              process: reservation.process
            }));
        }
        
        // 전체 예약 목록 저장
        setAllReservations(reservations);
        
        setSelectedDayReservations({
          date: `${month}월 ${dayData.date}일`,
          dayOfWeek: daysOfWeek[dayData.day],
          type: dayData.type,
          price: dayData.price,
          capacity: '18명',
          desc: dayData.desc || '쭈꾸미 위주의 낚시',
          reservations: reservations
        });
        setShowReservationModal(true);
      } else {
        console.error('[ReservationCalendar] 예약 목록 조회 실패:', response.status);
        // 실패 시 빈 예약 목록으로 표시
        setAllReservations([]);
        setSelectedDayReservations({
          date: `${month}월 ${dayData.date}일`,
          dayOfWeek: daysOfWeek[dayData.day],
          type: dayData.type,
          price: dayData.price,
          capacity: '18명',
          desc: dayData.desc || '쭈꾸미 위주의 낚시',
          reservations: []
        });
        setShowReservationModal(true);
      }
    } catch (error) {
      console.error('[ReservationCalendar] 예약 정보 가져오기 오류:', error);
      // 에러 시 빈 예약 리스트로 모달 표시
      setAllReservations([]);
      setSelectedDayReservations({
        date: `${month}월 ${dayData.date}일`,
        dayOfWeek: daysOfWeek[dayData.day],
        type: dayData.type,
        price: dayData.price,
        capacity: '18명',
        desc: dayData.desc || '쭈꾸미 위주의 낚시',
        reservations: []
      });
      setShowReservationModal(true);
    }
  };
  
  // 예약 진행 상태를 한글 텍스트로 변환
  const getProcessStatusText = (process) => {
    const statusMap = {
      'RESERVE_COMPLETED': '예약접수',
      'DEPOSIT_COMPLETED': '입금확인',
      'CANCEL_REQUESTED': '취소접수',
      'CANCEL_COMPLETED': '취소완료'
    };
    return statusMap[process] || process || '예약접수';
  };
  
  // 예약 필터링 처리 (중복 선택 가능)
  const handleFilterToggle = (filter) => {
    let newFilters;
    
    if (reservationFilters.includes(filter)) {
      // 이미 선택된 필터면 제거
      newFilters = reservationFilters.filter(f => f !== filter);
    } else {
      // 선택되지 않은 필터면 추가
      newFilters = [...reservationFilters, filter];
    }
    
    setReservationFilters(newFilters);
    
    let filteredReservations = [...allReservations];
    
    if (newFilters.length > 0) {
      // 선택된 필터가 있으면 해당 필터들에 해당하는 예약만 표시
      filteredReservations = allReservations.filter(reservation => {
        if (newFilters.includes('CONFIRMED') && reservation.process === 'DEPOSIT_COMPLETED') {
          return true;
        }
        if (newFilters.includes('DELAYED') && reservation.process === 'RESERVE_COMPLETED') {
          return true;
        }
        if (newFilters.includes('CANCELLED') && 
            (reservation.process === 'CANCEL_REQUESTED' || reservation.process === 'CANCEL_COMPLETED')) {
          return true;
        }
        return false;
      });
    }
    // 선택된 필터가 없으면 전체 표시
    
    if (selectedDayReservations) {
      setSelectedDayReservations({
        ...selectedDayReservations,
        reservations: filteredReservations
      });
    }
  };
  
  // 예약 상태 변경 처리
  const handleProcessChange = async (reservationPublicId, newProcess) => {
    try {
      console.log('[ReservationCalendar] 예약 상태 변경:', reservationPublicId, newProcess);
      
      const response = await apiPatch(`/reservations/${reservationPublicId}/process`, {
        process: newProcess
      });
      
      if (response.ok) {
        alert('예약 상태가 변경되었습니다.');
        // 예약 정보 다시 불러오기
        if (selectedSchedule) {
          handleDayClick(selectedSchedule);
        }
      } else {
        const errorData = await response.json();
        alert(`예약 상태 변경 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('[ReservationCalendar] 예약 상태 변경 오류:', error);
      alert('예약 상태 변경 중 오류가 발생했습니다.');
    }
  };
  
  // 모달 닫기 처리
  const handleCloseModal = () => {
    // 공휴일 설정이 체크되어 있으면 해당 날짜를 공휴일로 설정
    if (isHoliday && selectedSchedule) {
      // TODO: 실제로는 API를 호출하여 서버에 공휴일 설정을 저장해야 함
      console.log('[ReservationCalendar] 공휴일 설정:', selectedSchedule);
      alert(`${month}월 ${selectedSchedule.date}일이 공휴일로 설정되었습니다.`);
    }
    
    setShowReservationModal(false);
    setIsHoliday(false);
    setReservationFilters([]);
  };

  const handlePrevYear = () => setYear(year - 1);
  const handleNextYear = () => setYear(year + 1);
  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const currentMonthData = calendarData[year]?.[month] || [];
  
  // Split data into weeks
  const weeks = [];
  for (let i = 0; i < currentMonthData.length; i += 7) {
    weeks.push(currentMonthData.slice(i, i + 7));
  }

  const renderDayCell = (dayData) => {
    if (!dayData) return <div className="w-[156px]" />;

    const isOtherMonth = dayData.prevMonth || dayData.nextMonth;
    const bgColor = isOtherMonth ? 'bg-[#F2F2F2]' : 'bg-white';
    const dateColor = dayData.day === 0 ? 'text-[#ED2626]' : dayData.day === 6 ? 'text-[#2754DA]' : 'text-[#272C3C]';
    
    return (
      <div 
        className={`flex flex-col w-[156px] py-[15px] justify-center items-start gap-[13px] border-r-2 border-b-2 border-[#E7E7E7] ${isOtherMonth ? 'border-l-2' : ''} ${bgColor} ${!isOtherMonth ? 'cursor-pointer hover:bg-[#F7F8FC]' : ''}`}
        onClick={() => handleDayClick(dayData)}
      >
        {/* Date and tide */}
        <div className="flex w-[155px] px-[20px] justify-between items-center">
          <div className="flex justify-center items-center gap-[10px]">
            <p className={`font-pretendard text-[20px] font-bold leading-normal ${dateColor}`}>
              {dayData.date}
            </p>
          </div>
          <div className="flex justify-center items-center gap-[10px]">
            <p className="text-[#272C3C] font-pretendard text-[18px] font-medium leading-normal">
              {dayData.tide}
            </p>
          </div>
        </div>

        {/* Type and price */}
        <div className={`flex h-[56px] px-[25px] flex-col items-start gap-[2px] ${dayData.desc ? 'gap-[2px]' : ''}`}>
          <p className="self-stretch text-[#272C3C] font-pretendard text-[16px] font-medium leading-normal">
            {dayData.type}
          </p>
          <p className="self-stretch text-[#272C3C] font-pretendard text-[16px] font-medium leading-normal">
            {dayData.price}
          </p>
          {dayData.desc && (
            <p className="self-stretch text-[#73757C] font-pretendard text-[12px] font-medium leading-normal">
              {dayData.desc}
            </p>
          )}
        </div>

        {/* Booking button */}
        <div className="flex px-[36px] flex-col justify-center items-center gap-[10px] self-stretch">
          <div className={`flex py-[10px] px-[21px] flex-col justify-center items-center gap-[3px] self-stretch rounded-[5px] ${
            dayData.status === 'closed' ? 'bg-[#73757C]' : 'bg-[#2754DA]'
          }`}>
            <p className="text-[#FDFDFD] font-pretendard text-[16px] font-bold leading-normal">
              {dayData.status === 'closed' ? '예약마감' : '예약하기'}
            </p>
            <p className="text-[#FDFDFD] font-pretendard text-[14px] font-medium leading-normal">
              (잔여 {dayData.remaining})
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="flex w-full max-w-[1183px] flex-col justify-end items-start bg-white py-[26px]">
        {/* Header section */}
        <div className="flex px-[42px] flex-col items-start gap-[10px] self-stretch">
          <div className="flex w-full mx-auto py-[40px] px-[60px] flex-col justify-center items-start gap-[10px] rounded-[20px] bg-[#F7F8FC] shadow-[0_4px_4px_0_rgba(39,84,218,0.2)] title-section">
            <h1 className="text-[#272C3C] font-pretendard text-[30px] font-bold leading-normal">
              예약달력
            </h1>
            <p className="text-[#272C3C] font-pretendard text-[18px] font-normal leading-normal">
              예약달력을 관리할 수 있습니다. <br />
              아래의 날짜 설정기능을 이용해 기간별 배 지정을 간편히 할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Filter section */}
        <div className="flex px-[42px] flex-col items-start gap-[65px] mt-[26px]">
          <div className="flex flex-col items-start gap-[10px]">
            <div className="flex pl-[60px] flex-col justify-center items-start gap-[40px] self-stretch">
              <div className="flex w-[986px] flex-col items-end gap-[15px]">
                {/* Date and Type filters */}
                <div className="flex flex-col items-start gap-[13px] self-stretch">
                  {/* Date range */}
                  <div className="flex w-[800px] justify-between items-center">
                    <div className="flex items-start gap-[10px]">
                      <div className="flex w-[67px] py-[8px] px-[10px] items-center gap-[10px]">
                        <p className="text-[#272C3C] font-pretendard text-[18px] font-normal leading-normal">날짜</p>
                      </div>
                      <div className="flex items-center gap-[12px] relative">
                        <div className="flex items-center">
                          <div 
                            className="flex w-[184px] py-[9px] px-[20px] items-center gap-[10px] rounded-[10px] border border-[#BDBDBD] bg-white cursor-pointer"
                            onClick={() => setShowStartCalendar(!showStartCalendar)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                            </svg>
                            <p className={`font-pretendard text-[16px] font-normal leading-normal ${startDate ? 'text-[#272C3C]' : 'text-[#BDBDBD]'}`}>
                              {startDate || '시작날짜'}
                            </p>
                          </div>
                          <div className="flex w-[28px] py-[9px] px-[10px] flex-col justify-center items-center gap-[10px]">
                            <p className="text-[#BDBDBD] font-pretendard text-[16px] font-semibold leading-normal">-</p>
                          </div>
                          <div 
                            className="flex w-[184px] py-[9px] px-[20px] items-center gap-[10px] rounded-[10px] border border-[#BDBDBD] bg-white cursor-pointer"
                            onClick={() => setShowEndCalendar(!showEndCalendar)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                            </svg>
                            <p className={`font-pretendard text-[16px] font-normal leading-normal ${endDate ? 'text-[#272C3C]' : 'text-[#BDBDBD]'}`}>
                              {endDate || '끝날짜'}
                            </p>
                          </div>
                        </div>
                        
                        {/* 시작날짜 캘린더 팝업 */}
                        {showStartCalendar && (
                          <div className="absolute top-[45px] left-[80px] z-50 bg-white rounded-[10px] shadow-lg p-[20px] border border-[#E7E7E7]">
                            <div className="flex items-center justify-between mb-[15px]">
                              <button onClick={() => setMonth(month > 1 ? month - 1 : 12)} className="text-[#2754DA] text-[20px] font-bold">&lt;&lt;</button>
                              <button onClick={() => setMonth(month > 1 ? month - 1 : 12)} className="text-[#2754DA] text-[20px] font-bold">&lt;</button>
                              <p className="text-[#2754DA] text-[18px] font-medium">{month}월</p>
                              <button onClick={() => setMonth(month < 12 ? month + 1 : 1)} className="text-[#2754DA] text-[20px] font-bold">&gt;</button>
                              <button onClick={() => setMonth(month < 12 ? month + 1 : 1)} className="text-[#2754DA] text-[20px] font-bold">&gt;&gt;</button>
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
                                    ${day.isCurrentMonth && startDate && startDate.includes(`${day.year}-${String(day.month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`) ? 'bg-[#2754DA] text-white' : ''}
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
                              이전달
                            </button>
                          </div>
                        )}
                        
                        {/* 끝날짜 캘린더 팝업 */}
                        {showEndCalendar && (
                          <div className="absolute top-[45px] left-[290px] z-50 bg-white rounded-[10px] shadow-lg p-[20px] border border-[#E7E7E7]">
                            <div className="flex items-center justify-between mb-[15px]">
                              <button onClick={() => setMonth(month > 1 ? month - 1 : 12)} className="text-[#2754DA] text-[20px] font-bold">&lt;&lt;</button>
                              <button onClick={() => setMonth(month > 1 ? month - 1 : 12)} className="text-[#2754DA] text-[20px] font-bold">&lt;</button>
                              <p className="text-[#2754DA] text-[18px] font-medium">{month}월</p>
                              <button onClick={() => setMonth(month < 12 ? month + 1 : 1)} className="text-[#2754DA] text-[20px] font-bold">&gt;</button>
                              <button onClick={() => setMonth(month < 12 ? month + 1 : 1)} className="text-[#2754DA] text-[20px] font-bold">&gt;&gt;</button>
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
                                    ${day.isCurrentMonth && endDate && endDate.includes(`${day.year}-${String(day.month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`) ? 'bg-[#2754DA] text-white' : ''}
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
                              이전달
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Type selector */}
                  <div className="flex h-[37px] items-start gap-[10px] relative">
                    <div className="flex w-[67px] py-[8px] px-[10px] items-center gap-[10px]">
                      <p className="text-[#272C3C] font-pretendard text-[18px] font-normal leading-normal">타입</p>
                    </div>
                    <div className="flex h-[37px] items-center gap-[5px]">
                      <div 
                        className="flex w-[184px] h-[37px] py-[9px] px-[10px] pr-[20px] justify-between items-center rounded-[10px] border border-[#BDBDBD] bg-white cursor-pointer"
                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      >
                        <p className={`font-pretendard text-[16px] font-normal leading-normal ${selectedType ? 'text-[#272C3C]' : 'text-[#BDBDBD]'}`}>
                          {selectedType || '타입 선택'}
                        </p>
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      {showTypeDropdown && (
                        <div className="absolute top-[45px] left-[80px] z-50 bg-white rounded-[10px] shadow-lg border border-[#E7E7E7] w-[184px]">
                          <div 
                            className="px-[15px] py-[10px] hover:bg-[#EEF4FF] cursor-pointer rounded-t-[10px]"
                            onClick={() => {
                              setSelectedType('일반예약');
                              setShowTypeDropdown(false);
                            }}
                          >
                            <p className="text-[#272C3C] font-pretendard text-[16px]">일반예약</p>
                          </div>
                          <div 
                            className="px-[15px] py-[10px] hover:bg-[#EEF4FF] cursor-pointer rounded-b-[10px]"
                            onClick={() => {
                              setSelectedType('선예약');
                              setShowTypeDropdown(false);
                            }}
                          >
                            <p className="text-[#272C3C] font-pretendard text-[16px]">선예약</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Boat selector and Save button */}
                <div className="flex justify-between items-center self-stretch">
                  <div className="flex items-start gap-[10px]">
                    <div className="flex w-[67px] py-[8px] px-[10px] items-center gap-[10px]">
                      <p className="text-[#272C3C] font-pretendard text-[18px] font-normal leading-normal">배</p>
                    </div>
                    <div className="flex w-[184px] h-[37px] py-[9px] px-[10px] pr-[20px] justify-between items-center rounded-[10px] border border-[#BDBDBD] bg-white">
                      <select 
                        className="text-[#BDBDBD] font-pretendard text-[16px] font-normal leading-normal border-none outline-none bg-transparent flex-1 cursor-pointer"
                        value={selectedBoat}
                        onChange={(e) => setSelectedBoat(e.target.value)}
                      >
                        <option key="default" value="">배 선택</option>
                        {boats.map((boat, index) => (
                          <option key={boat.id || `boat-${index}`} value={boat.id}>
                            {boat.fishType} - {boat.price ? boat.price.toLocaleString() : '0'}원 (최대 {boat.maxHeadCount}명)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex px-[10px] items-center gap-[10px]">
                    <button className="flex py-[9px] px-[20px] justify-center items-center gap-[10px] rounded-[20px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                      <span className="text-[#1840B8] font-pretendard text-[16px] font-medium leading-normal">저장하기</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar section */}
        <div className="flex py-[30px] px-[42px] flex-col items-center gap-[50px]">
          {/* Year/Month navigation */}
          <div className="flex px-[303px] flex-col justify-center items-start gap-[18px]">
            {/* Year selector */}
            <div className="flex items-center gap-[58px] self-stretch">
              <button 
                onClick={handlePrevYear}
                className="flex w-[104px] py-[10px] px-[16px] justify-center items-center gap-[6px] rounded-[10px] bg-[#EEF4FF]"
              >
                <svg width="104" height="41" viewBox="0 0 104 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="104" height="41" rx="10" fill="#EEF4FF"/>
                  <path d="M16.7797 21.733C15.9187 21.1365 15.9187 19.8635 16.7797 19.267L23.8958 14.3368C24.8906 13.6476 26.25 14.3596 26.25 15.5698V25.4302C26.25 26.6404 24.8906 27.3524 23.8958 26.6632L16.7797 21.733Z" fill="#272C3C"/>
                  <path d="M23.0645 21.3223C22.4904 20.9246 22.4904 20.0754 23.0645 19.6777L30.1807 14.748C30.8439 14.2886 31.75 14.7635 31.75 15.5703V25.4297C31.75 26.2365 30.8439 26.7114 30.1807 26.252L23.0645 21.3223Z" fill="#272C3C" stroke="#272C3C"/>
                  <text fill="#272C3C" fontFamily="Pretendard" fontSize="18" x="42" y="26.8984">이전해</text>
                </svg>
              </button>
              
              <div className="flex py-[5px] px-[12px] pl-[15px] justify-center items-center gap-[10px] rounded-[10px]">
                <p className="text-[#121212] font-pretendard text-[30px] font-normal leading-normal">{year}년</p>
                <svg width="24" height="21" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.3594 13.8525C9.76657 14.751 8.44827 14.751 7.85541 13.8525L0.249952 2.32611C-0.408086 1.32883 0.307147 8.89308e-08 1.50197 1.93385e-07L16.7129 1.52317e-06C17.9077 1.62762e-06 18.6229 1.32883 17.9649 2.32612L10.3594 13.8525Z" fill="#2754DA"/>
                </svg>
              </div>

              <button 
                onClick={handleNextYear}
                className="flex w-[104px] py-[10px] px-[16px] justify-center items-center gap-[6px] rounded-[10px] bg-[#EEF4FF]"
              >
                <svg width="104" height="41" viewBox="0 0 104 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="104" height="41" rx="10" fill="#EEF4FF"/>
                  <text fill="#272C3C" fontFamily="Pretendard" fontSize="18" x="15" y="26.8984">다음해</text>
                  <path d="M87.2203 21.733C88.0813 21.1365 88.0813 19.8635 87.2203 19.267L80.1042 14.3368C79.1094 13.6476 77.75 14.3596 77.75 15.5698V25.4302C77.75 26.6404 79.1094 27.3524 80.1042 26.6632L87.2203 21.733Z" fill="#272C3C"/>
                  <path d="M80.9355 21.3223C81.5096 20.9246 81.5096 20.0754 80.9355 19.6777L73.8193 14.748C73.1561 14.2886 72.25 14.7635 72.25 15.5703V25.4297C72.25 26.2365 73.1561 26.7114 73.8193 26.252L80.9355 21.3223Z" fill="#272C3C" stroke="#272C3C"/>
                </svg>
              </button>
            </div>

            {/* Month selector */}
            <div className="flex items-center gap-[58px] self-stretch">
              <button 
                onClick={handlePrevMonth}
                className="flex w-[104px] py-[10px] px-[16px] justify-center items-center gap-[6px] rounded-[10px] bg-[#EEF4FF]"
              >
                <svg width="18" height="15" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.644906 7.66561C-0.216105 7.06908 -0.216104 5.79615 0.644906 5.19962L7.76099 0.269456C8.7558 -0.419764 10.1152 0.292219 10.1152 1.50245V11.3628C10.1152 12.573 8.75579 13.285 7.76099 12.5958L0.644906 7.66561Z" fill="#272C3C"/>
                </svg>
                <span className="text-[#272C3C] font-pretendard text-[18px] font-medium leading-normal">이전달</span>
              </button>

              <div className="flex w-[155px] py-[5px] px-[12px] pl-[16px] justify-center items-center gap-[10px] rounded-[10px]">
                <p className="text-[#121212] font-pretendard text-[40px] font-medium leading-normal">{month}월</p>
                <svg width="24" height="21" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.3594 13.8525C9.76657 14.751 8.44827 14.751 7.85541 13.8525L0.249952 2.32611C-0.408086 1.32883 0.307147 8.89308e-08 1.50197 1.93385e-07L16.7129 1.52317e-06C17.9077 1.62762e-06 18.6229 1.32883 17.9649 2.32612L10.3594 13.8525Z" fill="#2754DA"/>
                </svg>
              </div>

              <button 
                onClick={handleNextMonth}
                className="flex w-[104px] py-[10px] px-[16px] justify-center items-center gap-[6px] rounded-[10px] bg-[#EEF4FF]"
              >
                <span className="text-[#272C3C] font-pretendard text-[18px] font-medium leading-normal">다음달</span>
                <svg width="18" height="15" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.47033 7.66561C10.3313 7.06908 10.3313 5.79615 9.47033 5.19962L2.35424 0.269456C1.35944 -0.419764 0 0.292219 0 1.50245V11.3628C0 12.573 1.35944 13.285 2.35424 12.5958L9.47033 7.66561Z" fill="#272C3C"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="flex flex-col justify-center items-start self-stretch">
            {/* Days of week header */}
            <div className="flex items-center self-stretch">
              {daysOfWeek.map((day, index) => (
                <div key={index} className="flex w-[156px] py-[10px] px-[10px] flex-col justify-center items-center gap-[10px] bg-[#F2F2F2]">
                  <p className={`font-pretendard text-[20px] font-medium leading-normal ${
                    index === 0 ? 'text-[#ED2626]' : index === 6 ? 'text-[#2754DA]' : 'text-[#272C3C]'
                  }`}>
                    {day}
                  </p>
                </div>
              ))}
            </div>

            {/* Calendar weeks */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex items-center self-stretch">
                {week.map((dayData, dayIndex) => (
                  <div key={dayIndex}>
                    {renderDayCell(dayData)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 예약 정보 모달 */}
      {showReservationModal && selectedDayReservations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-[20px] p-[40px] w-[800px] max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-[20px]">
              <div>
                <div className="flex items-center gap-[20px]">
                  <h2 className="text-[#272C3C] font-pretendard text-[28px] font-bold">
                    {selectedDayReservations.date} ({selectedDayReservations.dayOfWeek})
                  </h2>
                  {/* 공휴일 설정하기 체크박스 */}
                  <div className="flex items-center gap-[8px]">
                    <label className="flex items-center gap-[8px] cursor-pointer">
                      <span className="text-[#272C3C] font-pretendard text-[16px]">공휴일 설정하기</span>
                      <div 
                        className={`w-[24px] h-[24px] rounded-[4px] flex items-center justify-center cursor-pointer transition-colors ${
                          isHoliday ? 'bg-[#ED2626]' : 'bg-white border-2 border-[#BDBDBD]'
                        }`}
                        onClick={() => setIsHoliday(!isHoliday)}
                      >
                        {isHoliday && (
                          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 6L6 11L15 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-[15px] mt-[10px]">
                  <p className="text-[#272C3C] font-pretendard text-[18px]">{selectedDayReservations.type}</p>
                  <p className="text-[#272C3C] font-pretendard text-[18px]">{selectedDayReservations.price}</p>
                  <p className="text-[#272C3C] font-pretendard text-[18px]">{selectedDayReservations.capacity}</p>
                  <p className="text-[#73757C] font-pretendard text-[16px]">{selectedDayReservations.desc}</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-[#272C3C] text-[24px] font-bold hover:text-[#2754DA]"
              >
                ×
              </button>
            </div>

            {/* 출항 필터 버튼들 (중복 선택 가능) */}
            <div className="flex gap-[10px] mb-[30px]">
              <button 
                onClick={() => handleFilterToggle('CONFIRMED')}
                className={`px-[20px] py-[12px] rounded-[10px] font-medium transition-colors ${
                  reservationFilters.includes('CONFIRMED')
                    ? 'bg-[#E0E0E0] text-[#272C3C] border-2 border-[#272C3C]' 
                    : 'bg-[#F5F5F5] text-[#5A5A5A] hover:bg-[#E8E8E8]'
                }`}
              >
                출항확정
              </button>
              <button 
                onClick={() => handleFilterToggle('DELAYED')}
                className={`px-[20px] py-[12px] rounded-[10px] font-medium transition-colors ${
                  reservationFilters.includes('DELAYED')
                    ? 'bg-[#E0E0E0] text-[#272C3C] border-2 border-[#272C3C]' 
                    : 'bg-[#F5F5F5] text-[#5A5A5A] hover:bg-[#E8E8E8]'
                }`}
              >
                출항보류
              </button>
              <button 
                onClick={() => handleFilterToggle('CANCELLED')}
                className={`px-[20px] py-[12px] rounded-[10px] font-medium transition-colors ${
                  reservationFilters.includes('CANCELLED')
                    ? 'bg-[#E0E0E0] text-[#272C3C] border-2 border-[#272C3C]' 
                    : 'bg-[#F5F5F5] text-[#5A5A5A] hover:bg-[#E8E8E8]'
                }`}
              >
                출항취소
              </button>
            </div>

            {/* 예약자 리스트 테이블 */}
            <div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#E7E7E7]">
                    <th className="py-[15px] px-[10px] text-left text-[#272C3C] font-pretendard text-[18px] font-medium">
                      예약자
                    </th>
                    <th className="py-[15px] px-[10px] text-center text-[#272C3C] font-pretendard text-[18px] font-medium">
                      예약인원
                    </th>
                    <th className="py-[15px] px-[10px] text-center text-[#272C3C] font-pretendard text-[18px] font-medium">
                      진행현황
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDayReservations.reservations.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-[30px] text-center text-[#73757C] font-pretendard text-[16px]">
                        예약 정보가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    selectedDayReservations.reservations.map((reservation, idx) => (
                      <tr key={idx} className="border-b border-[#E7E7E7]">
                        <td className="py-[15px] px-[10px] text-left text-[#272C3C] font-pretendard text-[16px]">
                          {reservation.name}
                        </td>
                        <td className="py-[15px] px-[10px] text-center text-[#272C3C] font-pretendard text-[16px]">
                          {reservation.count}
                        </td>
                        <td className="py-[15px] px-[10px] text-center">
                          <span className={`font-pretendard text-[16px] ${
                            reservation.status === '예약접수' ? 'text-[#FFA500]' : 
                            reservation.status === '입금확인' ? 'text-[#272C3C]' :
                            reservation.status === '취소접수' ? 'text-[#ED2626]' :
                            reservation.status === '취소완료' ? 'text-[#73757C]' :
                            'text-[#272C3C]'
                          }`}>
                            {reservation.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 닫기 버튼 */}
            <div className="flex justify-center mt-[30px]">
              <button 
                onClick={handleCloseModal}
                className="px-[40px] py-[12px] bg-[#EEF4FF] text-[#2754DA] rounded-[10px] font-medium hover:bg-[#DFE7F4]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ReservationCalendar;
