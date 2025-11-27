import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPatch, apiPost, apiDelete } from '../utils/api';

function ReservationCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
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
  const [calendarData, setCalendarData] = useState([]); // 실제 API에서 가져온 달력 데이터
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [selectedReservationDetail, setSelectedReservationDetail] = useState(null); // 선택된 예약 상세 정보
  const [showReservationDetailModal, setShowReservationDetailModal] = useState(false); // 예약 상세 정보 모달
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth() + 1);
  const [showMainYearDropdown, setShowMainYearDropdown] = useState(false);
  const [showMainMonthDropdown, setShowMainMonthDropdown] = useState(false);

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 년도 목록 생성 (현재 년도 기준 ±50년)
  const generateYearList = () => {
    const currentYear = today.getFullYear();
    const years = [];
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      years.push(i);
    }
    return years;
  };

  // 월 목록 생성
  const generateMonthList = () => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMainYearDropdown || showMainMonthDropdown) {
        const target = event.target;
        const isYearDropdown = target.closest('.main-year-dropdown');
        const isMonthDropdown = target.closest('.main-month-dropdown');
        const isYearButton = target.closest('.main-year-button');
        const isMonthButton = target.closest('.main-month-button');
        
        if (!isYearDropdown && !isYearButton && showMainYearDropdown) {
          setShowMainYearDropdown(false);
        }
        if (!isMonthDropdown && !isMonthButton && showMainMonthDropdown) {
          setShowMainMonthDropdown(false);
        }
      }
    };

    if (showMainYearDropdown || showMainMonthDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMainYearDropdown, showMainMonthDropdown]);

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

  // 해당 월의 스케줄 데이터 불러오기
  useEffect(() => {
    const fetchCalendarData = async () => {
      setIsLoadingCalendar(true);
      try {
        // 해당 월의 시작일과 종료일 계산
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        
        // ISO 타임스탬프 형식으로 변환 (from: 해당 월 1일 00:00:00, to: 해당 월 마지막일 23:59:59)
        const fromDate = `${year}-${String(month).padStart(2, '0')}-01T00:00:00`;
        const toDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}T23:59:59`;
        
        console.log('[ReservationCalendar] 스케줄 조회:', { from: fromDate, to: toDate });
        
        // /schedules/main API를 사용하여 달력 데이터 가져오기
        let schedules = [];
        
        try {
          // /schedules/main API 호출 (from, to 파라미터 사용 - ISO 타임스탬프 형식)
          const mainResponse = await apiGet(`/schedules/main?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`);
          
          if (mainResponse.ok) {
            const mainResult = await mainResponse.json();
            console.log('[ReservationCalendar] /schedules/main API 응답:', mainResult);
            console.log('[ReservationCalendar] /schedules/main API 응답 타입:', typeof mainResult);
            console.log('[ReservationCalendar] /schedules/main API 응답이 배열인가?', Array.isArray(mainResult));
            console.log('[ReservationCalendar] mainResult.data:', mainResult.data);
            console.log('[ReservationCalendar] mainResult.data?.content:', mainResult.data?.content);
            console.log('[ReservationCalendar] mainResult.data?.content 타입:', typeof mainResult.data?.content);
            console.log('[ReservationCalendar] mainResult.data?.content이 배열인가?', Array.isArray(mainResult.data?.content));
            
            // API 응답이 배열인지 객체인지 확인
            if (Array.isArray(mainResult)) {
              // 응답이 배열인 경우
              schedules = mainResult;
              console.log('[ReservationCalendar] 배열 형태 응답, 스케줄 개수:', schedules.length);
            } else if (mainResult.success && mainResult.data) {
              // 응답이 객체이고 success/data 구조인 경우
              // 실제 API 응답: data.schedules에 배열이 있음
              if (Array.isArray(mainResult.data)) {
                schedules = mainResult.data;
                console.log('[ReservationCalendar] data가 배열인 경우, 스케줄 개수:', schedules.length);
              } else if (mainResult.data.schedules && Array.isArray(mainResult.data.schedules)) {
                schedules = mainResult.data.schedules;
                console.log('[ReservationCalendar] data.schedules가 배열인 경우, 스케줄 개수:', schedules.length);
              } else if (mainResult.data.content && Array.isArray(mainResult.data.content)) {
                schedules = mainResult.data.content;
                console.log('[ReservationCalendar] data.content가 배열인 경우, 스케줄 개수:', schedules.length);
              } else {
                schedules = [];
                console.log('[ReservationCalendar] data 구조를 찾을 수 없음, data:', mainResult.data);
              }
            } else if (mainResult.data) {
              // data 필드만 있는 경우
              if (Array.isArray(mainResult.data)) {
                schedules = mainResult.data;
              } else if (mainResult.data.schedules && Array.isArray(mainResult.data.schedules)) {
                schedules = mainResult.data.schedules;
              } else if (mainResult.data.content && Array.isArray(mainResult.data.content)) {
                schedules = mainResult.data.content;
              } else {
                schedules = [];
              }
              console.log('[ReservationCalendar] data 필드만 있는 응답, 스케줄 개수:', schedules.length);
            } else {
              schedules = [];
              console.log('[ReservationCalendar] 응답 구조를 파악할 수 없음');
            }
            
            console.log('[ReservationCalendar] 생성된 스케줄 개수:', schedules.length);
            console.log('[ReservationCalendar] 생성된 스케줄:', schedules);
          } else {
            // 에러 응답의 본문 확인
            let errorMessage = `HTTP ${mainResponse.status}`;
            try {
              const errorData = await mainResponse.json();
              console.error('[ReservationCalendar] /schedules/main API 조회 실패 - 응답 본문:', errorData);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
              const errorText = await mainResponse.text();
              console.error('[ReservationCalendar] /schedules/main API 조회 실패 - 응답 텍스트:', errorText.substring(0, 500));
            }
            console.warn('[ReservationCalendar] /schedules/main API 조회 실패:', mainResponse.status, errorMessage);
            // 에러가 발생해도 빈 배열로 설정하여 달력이 깨지지 않도록 함
            schedules = [];
          }
        } catch (error) {
          console.error('[ReservationCalendar] /schedules/main API 조회 중 예외 발생:', error);
          // 에러가 발생해도 빈 배열로 설정하여 달력이 깨지지 않도록 함
          schedules = [];
        }
          
        // 달력 데이터 생성
        const calendarDays = generateCalendarDays(year, month);
        console.log('[ReservationCalendar] 생성된 캘린더 날짜 개수:', calendarDays.length);
        console.log('[ReservationCalendar] 스케줄 개수:', schedules.length);
        
        const monthData = calendarDays.map((day, index) => {
          // 날짜 객체 생성 (요일 계산용)
          const dayDate = new Date(day.year, day.month - 1, day.date);
          const dayOfWeek = dayDate.getDay();
          
          // 해당 날짜의 스케줄 찾기
          const dateStr = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
          const schedule = schedules.find(s => {
            // /main API 응답 구조: departure 필드 사용
            const scheduleDate = s.departure;
            if (!scheduleDate) return false;
            // ISO 형식인 경우
            if (scheduleDate.includes('T')) {
              return scheduleDate.startsWith(dateStr);
            }
            // 날짜만 있는 경우
            return scheduleDate.startsWith(dateStr);
          });
          
          if (schedule) {
            // /schedules/main API 응답 구조에 맞게 데이터 추출
            const fishType = schedule.fishType || schedule.ship?.fishType || '쭈갑';
            const price = schedule.price || schedule.ship?.price || 90000;
            const remainingHeadCount = schedule.remainingHeadCount !== undefined ? schedule.remainingHeadCount : 0;
            const tideNumber = schedule.tide || 1;
            const tide = tideNumber === 1 ? '1물' : tideNumber === 2 ? '2물' : `${tideNumber}물`;
            
            // schedulePublicId는 schedulePublicId 필드에서 가져오기
            const schedulePublicId = schedule.schedulePublicId || (schedule.id ? String(schedule.id) : null);
            
            // 배 정보에서 notification 가져오기
            const notification = schedule.ship?.notification || schedule.notification || '쭈꾸미 위주의 낚시';
            
            return {
              date: day.isPrevMonth ? `${day.month}/${day.date}` : 
                    day.isNextMonth ? `${day.month}/${day.date}` : day.date,
              year: day.year,
              month: day.month,
              day: dayOfWeek,
              tide: tide,
              type: fishType,
              price: price ? `${price.toLocaleString()}원` : '90,000원',
              desc: notification,
              status: remainingHeadCount > 0 ? 'available' : 'closed',
              remaining: remainingHeadCount,
              prevMonth: day.isPrevMonth,
              nextMonth: day.isNextMonth,
              schedulePublicId: schedulePublicId,
              scheduleData: schedule
            };
          } else {
            // 스케줄이 없는 날짜
            return {
              date: day.isPrevMonth ? `${day.month}/${day.date}` : 
                    day.isNextMonth ? `${day.month}/${day.date}` : day.date,
              year: day.year,
              month: day.month,
              day: dayOfWeek,
              tide: '',
              type: '',
              price: '',
              desc: '',
              status: 'closed',
              remaining: 0,
              prevMonth: day.isPrevMonth,
              nextMonth: day.isNextMonth
            };
          }
        });
        
        console.log('[ReservationCalendar] 생성된 달력 데이터 개수:', monthData.length);
        console.log('[ReservationCalendar] 달력 데이터 샘플 (첫 3개):', monthData.slice(0, 3));
        setCalendarData(monthData);
      } catch (error) {
        console.error('[ReservationCalendar] 스케줄 데이터 불러오기 실패:', error);
        // 에러 시 빈 달력 데이터 생성
        const calendarDays = generateCalendarDays(year, month);
        const monthData = calendarDays.map((day) => {
          const dayDate = new Date(day.year, day.month - 1, day.date);
          return {
            date: day.isPrevMonth ? `${day.month}/${day.date}` : 
                  day.isNextMonth ? `${day.month}/${day.date}` : day.date,
            day: dayDate.getDay(),
            tide: '',
            type: '',
            price: '',
            desc: '',
            status: 'closed',
            remaining: 0,
            prevMonth: day.isPrevMonth,
            nextMonth: day.isNextMonth
          };
        });
        setCalendarData(monthData);
      } finally {
        setIsLoadingCalendar(false);
      }
    };
    
    fetchCalendarData();
  }, [year, month]);

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
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
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
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth === 13) {
      nextMonth = 1;
      nextYear = year + 1;
    }
    
    const remainingDays = 42 - days.length; // 6주 (42일)
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        month: nextMonth,
        year: nextYear,
        isNextMonth: true
      });
    }
    
    return days;
  };

  const handleDateSelect = (day) => {
    // 캘린더에서 선택한 날짜의 실제 연도/월 사용
    const actualYear = day.year || calendarYear;
    const actualMonth = day.month || calendarMonth;
    const dateStr = `${actualYear}-${String(actualMonth).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
    
    if (showStartCalendar) {
      // 시작날짜가 없으면 시작날짜로 설정
      if (!startDate) {
        setStartDate(dateStr);
        if (endDate && dateStr > endDate) {
          setEndDate('');
        }
      } 
      // 시작날짜가 있고, 선택한 날짜가 시작날짜와 같으면 아무것도 하지 않음
      else if (startDate === dateStr && !endDate) {
        // 같은 날짜를 다시 클릭하면 초기화
        setStartDate('');
      }
      // 시작날짜가 있고, 선택한 날짜가 시작날짜보다 이후면 끝날짜로 설정
      else if (startDate && dateStr > startDate) {
        setEndDate(dateStr);
        setShowStartCalendar(false);
      }
      // 시작날짜가 있고, 선택한 날짜가 시작날짜보다 이전이면 새로운 시작날짜로 설정
      else if (startDate && dateStr < startDate) {
        setStartDate(dateStr);
        setEndDate('');
      }
      // 시작날짜와 끝날짜가 모두 있고, 같은 날짜를 클릭하면 초기화
      else if (startDate === dateStr && endDate) {
        setStartDate('');
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

  const handleDayClick = async (dayData) => {
    if (!dayData || dayData.prevMonth || dayData.nextMonth) return;
    
    // 달력에 스케줄 데이터가 없으면 아무 반응 없음
    // schedulePublicId가 없거나, 스케줄 정보가 없으면 early return
    let schedulePublicId = dayData.schedulePublicId || dayData.scheduleData?.schedulePublicId || dayData.scheduleData?.id;
    
    // 스케줄 데이터가 없으면 아무 반응 없음
    if (!schedulePublicId) {
      console.log('[ReservationCalendar] 해당 날짜에 스케줄 데이터가 없습니다. 아무 반응 없음.');
      return;
    }
    
    // 스케줄 정보 저장
    setSelectedSchedule(dayData);
    
    // 필터 초기화
    setReservationFilters([]);
    
    // 해당 날짜의 공휴일 상태 확인 (임시로 false, 실제로는 API에서 가져와야 함)
    setIsHoliday(false);
    
    // 스케줄 상세 정보 가져오기
    try {
      // dayData에서 year, month, date 추출
      const dayYear = dayData.year || year;
      const dayMonth = dayData.month || month;
      const dayNumber = typeof dayData.date === 'string' ? parseInt(dayData.date.replace(/[^0-9]/g, '')) : dayData.date;
      console.log('[ReservationCalendar] 날짜 클릭:', { dayYear, dayMonth, dayNumber });
      console.log('[ReservationCalendar] dayData:', dayData);
      
      // 숫자일 경우 문자열로 변환
      schedulePublicId = String(schedulePublicId);
      console.log('[ReservationCalendar] schedulePublicId:', schedulePublicId);
      
      // 숫자일 경우 문자열로 변환
      schedulePublicId = String(schedulePublicId);
      console.log('[ReservationCalendar] schedulePublicId:', schedulePublicId);
      
      // /schedules/{schedulePublicId} API로 스케줄 상세 정보 가져오기
      const scheduleResponse = await apiGet(`/schedules/${schedulePublicId}`);
      
      if (scheduleResponse.ok) {
        const scheduleResult = await scheduleResponse.json();
        console.log('[ReservationCalendar] 스케줄 상세 API 응답:', scheduleResult);
        
        let scheduleDetail = null;
        let reservations = [];
        
        // API 응답 구조 확인
        if (scheduleResult.success && scheduleResult.data) {
          scheduleDetail = scheduleResult.data;
          
          // 예약 목록 추출
          if (scheduleDetail.reservations && Array.isArray(scheduleDetail.reservations)) {
            reservations = scheduleDetail.reservations.map((reservation, index) => {
              const reservationId = reservation.reservationPublicId || 
                                   reservation.reservation_public_id || 
                                   reservation.reservation_id || 
                                   reservation.id;
              const reservationIdStr = reservationId ? String(reservationId) : null;
              
              return {
                reservationPublicId: reservationIdStr,
                name: reservation.nickname || reservation.username || reservation.name || reservation.userName || `예약자${index + 1}`,
                count: reservation.headCount || reservation.head_count || 0,
                status: getProcessStatusText(reservation.process),
                process: reservation.process,
                phone: reservation.phone || reservation.phoneNumber || reservation.phone_number || '',
                totalPrice: reservation.totalPrice || reservation.price || 0,
                memo: reservation.request || reservation.memo || reservation.notification || reservation.description || '',
                shipFishType: reservation.shipFishType || reservation.ship?.fishType || reservation.fishType || ''
              };
            });
          }
        } else if (Array.isArray(scheduleResult)) {
          // 배열 형태 응답인 경우
          scheduleDetail = scheduleResult[0];
        } else if (scheduleResult.data) {
          scheduleDetail = scheduleResult.data;
        }
        
        console.log('[ReservationCalendar] 스케줄 상세 정보:', scheduleDetail);
        console.log('[ReservationCalendar] 예약 목록:', reservations);
        
        // 배 정보 가져오기
        const ship = scheduleDetail?.ship || {};
        const schedule = scheduleDetail?.schedule || {};
        const maxHeadCount = ship.maxHeadCount || 18;
        const fishType = ship.fishType || dayData.type || '쭈갑';
        const price = ship.price || scheduleDetail?.price || 90000;
        const notification = ship.notification || '쭈꾸미 위주의 낚시';
        
        // 예약 정보가 없으면 아무 반응도 없음
        if (reservations.length === 0 && !scheduleDetail) {
          console.log('[ReservationCalendar] 스케줄 상세 정보가 없어서 모달을 표시하지 않습니다.');
          return;
        }
        
        // 전체 예약 목록 저장
        setAllReservations(reservations);
        
        setSelectedDayReservations({
          date: `${dayMonth}월 ${dayNumber}일`,
          dayOfWeek: daysOfWeek[dayData.day],
          type: fishType,
          price: `${price.toLocaleString()}원`,
          capacity: `${maxHeadCount}명`,
          desc: notification,
          reservations: reservations,
          schedulePublicId: schedulePublicId,
          scheduleDetail: scheduleDetail
        });
        
        console.log('[ReservationCalendar] selectedDayReservations 설정 완료, 모달 표시');
        setShowReservationModal(true);
      } else {
        // 에러 응답의 본문 확인
        let errorMessage = `HTTP ${scheduleResponse.status}`;
        try {
          const errorData = await scheduleResponse.json();
          console.error('[ReservationCalendar] 스케줄 상세 조회 실패 - 응답 본문:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await scheduleResponse.text();
          console.error('[ReservationCalendar] 스케줄 상세 조회 실패 - 응답 텍스트:', errorText.substring(0, 500));
        }
        console.error('[ReservationCalendar] 스케줄 상세 조회 실패:', scheduleResponse.status, errorMessage);
        alert(`스케줄 상세 정보를 불러올 수 없습니다: ${errorMessage}`);
      }
    } catch (error) {
      console.error('[ReservationCalendar] 스케줄 상세 정보 가져오기 오류:', error);
      alert('스케줄 상세 정보를 가져오는 중 오류가 발생했습니다.');
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
  
  // 예약 상세 정보 조회
  const handleReservationClick = async (reservationPublicId) => {
    if (!reservationPublicId) {
      console.warn('[ReservationCalendar] reservationPublicId가 없습니다.');
      return;
    }

    try {
      console.log('[ReservationCalendar] 예약 상세 정보 조회:', reservationPublicId);
      const response = await apiGet(`/reservations/${reservationPublicId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('[ReservationCalendar] 예약 상세 정보 API 응답:', result);
        
        if (result.success && result.data) {
          setSelectedReservationDetail(result.data);
          setShowReservationDetailModal(true);
        } else {
          alert('예약 상세 정보를 불러올 수 없습니다.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`예약 상세 정보 조회 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('[ReservationCalendar] 예약 상세 정보 조회 오류:', error);
      alert('예약 상세 정보 조회 중 오류가 발생했습니다.');
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

  // 출항 확정 API 호출 (Home.jsx와 동일)
  const handleConfirmDeparture = async () => {
    console.log('[ReservationCalendar] 출항 확정 버튼 클릭');
    const schedulePublicId = selectedDayReservations?.schedulePublicId;
    console.log('[ReservationCalendar] schedulePublicId:', schedulePublicId);
    console.log('[ReservationCalendar] selectedDayReservations:', selectedDayReservations);
    
    if (!schedulePublicId) {
      console.warn('[ReservationCalendar] schedulePublicId가 없습니다.');
      alert('출항 스케줄 정보가 없습니다.');
      return;
    }

    // Home.jsx의 기본 출항 확정 메시지 템플릿
    const confirmMessages = [
      { id: 1, title: '출항확정 1', content: '안녕하세요! 내일은 기상예보가 갱신되어 좋아졌기에 출항을 확정합니다. 출항시간은 6시10분입니다. 승선명부를 회신해주세요.', selected: true }
    ];

    const selectedMessages = confirmMessages.filter(sms => sms.selected);
    console.log('[ReservationCalendar] 선택된 출항 확정 메시지 개수:', selectedMessages.length);
    console.log('[ReservationCalendar] 선택된 출항 확정 메시지:', selectedMessages);
    
    if (selectedMessages.length === 0) {
      console.warn('[ReservationCalendar] 체크된 메시지가 없습니다.');
      alert('체크된 메시지를 선택해주세요.');
      return;
    }

    try {
      // 체크된 각 메시지에 대해 API 호출
      for (const message of selectedMessages) {
        const apiUrl = `/schedules/${schedulePublicId}/departure/confirmation`;
        const requestBody = {
          scheduleStatus: 'CONFIRMED',
          content: message.content
        };
        
        console.log('[ReservationCalendar] 출항 확정 API 요청 시작');
        console.log('[ReservationCalendar] API URL:', apiUrl);
        console.log('[ReservationCalendar] 요청 본문:', requestBody);
        
        const response = await apiPost(apiUrl, requestBody);
        
        console.log('[ReservationCalendar] 출항 확정 API 응답:', response);
        console.log('[ReservationCalendar] 응답 상태:', response.status, response.statusText);
        console.log('[ReservationCalendar] 응답 OK:', response.ok);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[ReservationCalendar] 출항 확정 API 오류 응답:', errorData);
          throw new Error(errorData.message || '출항 확정 요청 실패');
        }
        
        const responseData = await response.json().catch(() => ({}));
        console.log('[ReservationCalendar] 출항 확정 API 성공 응답:', responseData);
      }

      console.log('[ReservationCalendar] 출항 확정 메시지 전송 완료:', selectedMessages.length, '개');
      alert(`${selectedMessages.length}개의 출항 확정 메시지가 전송되었습니다.`);
      // 예약 정보 다시 불러오기
      if (selectedSchedule) {
        handleDayClick(selectedSchedule);
      }
    } catch (error) {
      console.error('[ReservationCalendar] 출항 확정 요청 실패:', error);
      console.error('[ReservationCalendar] 에러 상세:', error.message, error.stack);
      alert(`출항 확정 요청 실패: ${error.message}`);
    }
  };

  // 출항 보류 API 호출 (Home.jsx와 동일)
  const handlePendingDeparture = async () => {
    console.log('[ReservationCalendar] 출항 보류 버튼 클릭');
    const schedulePublicId = selectedDayReservations?.schedulePublicId;
    console.log('[ReservationCalendar] schedulePublicId:', schedulePublicId);
    console.log('[ReservationCalendar] selectedDayReservations:', selectedDayReservations);
    
    if (!schedulePublicId) {
      console.warn('[ReservationCalendar] schedulePublicId가 없습니다.');
      alert('출항 스케줄 정보가 없습니다.');
      return;
    }

    // Home.jsx의 기본 출항 보류 메시지 템플릿
    const pendingMessages = [
      { id: 1, title: '출항보류 1', content: '안녕하세요, 라마르호입니다. 내일은 기상악화 예보가 있어서 오늘 오후 2~3시까지 대기 후 기상예보가 갱신되면 출항여부를 안내드리겠습니다.', selected: true },
      { id: 2, title: '출항보류 2', content: '안녕하세요, 라마르호입니다. 내일은 기상악화 예보가 있어서 오늘 오후 2~3시까지 대기 후 기상예보가 갱신되면 출항여부를 안내드리겠습니다. 혹시 멀미나 건강이 좋지 않은 분들은 오늘 오전11시까지 취소 신청해주시면 환불해드리겠습니다. 감사합니다.', selected: false }
    ];

    const selectedMessages = pendingMessages.filter(sms => sms.selected);
    console.log('[ReservationCalendar] 선택된 출항 보류 메시지 개수:', selectedMessages.length);
    console.log('[ReservationCalendar] 선택된 출항 보류 메시지:', selectedMessages);
    
    if (selectedMessages.length === 0) {
      console.warn('[ReservationCalendar] 체크된 메시지가 없습니다.');
      alert('체크된 메시지를 선택해주세요.');
      return;
    }

    try {
      // 체크된 각 메시지에 대해 API 호출
      for (const message of selectedMessages) {
        const apiUrl = `/schedules/${schedulePublicId}/departure/delay`;
        const requestBody = {
          scheduleStatus: 'DELAYED',
          content: message.content
        };
        
        console.log('[ReservationCalendar] 출항 보류 API 요청 시작');
        console.log('[ReservationCalendar] API URL:', apiUrl);
        console.log('[ReservationCalendar] 요청 본문:', requestBody);
        
        const response = await apiPost(apiUrl, requestBody);
        
        console.log('[ReservationCalendar] 출항 보류 API 응답:', response);
        console.log('[ReservationCalendar] 응답 상태:', response.status, response.statusText);
        console.log('[ReservationCalendar] 응답 OK:', response.ok);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[ReservationCalendar] 출항 보류 API 오류 응답:', errorData);
          throw new Error(errorData.message || '출항 연기 요청 실패');
        }
        
        const responseData = await response.json().catch(() => ({}));
        console.log('[ReservationCalendar] 출항 보류 API 성공 응답:', responseData);
      }

      console.log('[ReservationCalendar] 출항 보류 메시지 전송 완료:', selectedMessages.length, '개');
      alert(`${selectedMessages.length}개의 출항 연기 메시지가 전송되었습니다.`);
      // 예약 정보 다시 불러오기
      if (selectedSchedule) {
        handleDayClick(selectedSchedule);
      }
    } catch (error) {
      console.error('[ReservationCalendar] 출항 연기 요청 실패:', error);
      console.error('[ReservationCalendar] 에러 상세:', error.message, error.stack);
      alert(`출항 연기 요청 실패: ${error.message}`);
    }
  };

  // 출항 취소 API 호출 (Home.jsx와 동일)
  const handleCancelDeparture = async () => {
    console.log('[ReservationCalendar] 출항 취소 버튼 클릭');
    const schedulePublicId = selectedDayReservations?.schedulePublicId;
    console.log('[ReservationCalendar] schedulePublicId:', schedulePublicId);
    console.log('[ReservationCalendar] selectedDayReservations:', selectedDayReservations);
    
    if (!schedulePublicId) {
      console.warn('[ReservationCalendar] schedulePublicId가 없습니다.');
      alert('출항 스케줄 정보가 없습니다.');
      return;
    }

    // Home.jsx의 기본 출항 취소 메시지 템플릿
    const cancelMessages = [
      { id: 1, title: '출항취소 1', content: '안녕하세요, 라마르호입니다. 내일은 아쉽게도 기상악화로 인해 출항이 취소되었습니다. 환불계좌를 회신해주세요. 다음에 더 좋은날 뵙겠습니다.', selected: true }
    ];

    const selectedMessages = cancelMessages.filter(sms => sms.selected);
    console.log('[ReservationCalendar] 선택된 출항 취소 메시지 개수:', selectedMessages.length);
    console.log('[ReservationCalendar] 선택된 출항 취소 메시지:', selectedMessages);
    
    if (selectedMessages.length === 0) {
      console.warn('[ReservationCalendar] 체크된 메시지가 없습니다.');
      alert('체크된 메시지를 선택해주세요.');
      return;
    }

    try {
      // 체크된 각 메시지에 대해 API 호출
      for (const message of selectedMessages) {
        const apiUrl = `/schedules/${schedulePublicId}/departure/cancel`;
        const requestBody = {
          scheduleStatus: 'CANCELED',
          content: message.content
        };
        
        console.log('[ReservationCalendar] 출항 취소 API 요청 시작');
        console.log('[ReservationCalendar] API URL:', apiUrl);
        console.log('[ReservationCalendar] 요청 본문:', requestBody);
        
        const response = await apiPost(apiUrl, requestBody);
        
        console.log('[ReservationCalendar] 출항 취소 API 응답:', response);
        console.log('[ReservationCalendar] 응답 상태:', response.status, response.statusText);
        console.log('[ReservationCalendar] 응답 OK:', response.ok);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[ReservationCalendar] 출항 취소 API 오류 응답:', errorData);
          throw new Error(errorData.message || '출항 취소 요청 실패');
        }
        
        const responseData = await response.json().catch(() => ({}));
        console.log('[ReservationCalendar] 출항 취소 API 성공 응답:', responseData);
      }

      console.log('[ReservationCalendar] 출항 취소 메시지 전송 완료:', selectedMessages.length, '개');
      alert(`${selectedMessages.length}개의 출항 취소 메시지가 전송되었습니다.`);
      // 예약 정보 다시 불러오기
      if (selectedSchedule) {
        handleDayClick(selectedSchedule);
      }
    } catch (error) {
      console.error('[ReservationCalendar] 출항 취소 요청 실패:', error);
      console.error('[ReservationCalendar] 에러 상세:', error.message, error.stack);
      alert(`출항 취소 요청 실패: ${error.message}`);
    }
  };

  // 스케줄 저장하기 (스케줄 생성 API)
  const handleSaveShip = async () => {
    if (!selectedBoat) {
      alert('배를 선택해주세요.');
      return;
    }

    if (!startDate || !endDate) {
      alert('날짜 범위를 선택해주세요.');
      return;
    }

    // startDate와 endDate에서 연도 추출하여 ISO 형식으로 변환
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const startYear = startDateObj.getFullYear();
    const endYear = endDateObj.getFullYear();
    
    // ISO 형식으로 변환 (YYYY-MM-DDTHH:mm:ss)
    const startDateISO = `${startDate}T00:00:00`;
    const endDateISO = `${endDate}T23:59:59`;

    try {
      console.log('[ReservationCalendar] 스케줄 생성 API 요청 시작');
      console.log('[ReservationCalendar] 요청 데이터:', {
        startDate: startDateISO,
        endDate: endDateISO,
        shipId: parseInt(selectedBoat)
      });
      
      const response = await apiPost('/schedules', {
        startDate: startDateISO,
        endDate: endDateISO,
        shipId: parseInt(selectedBoat)
      });

      console.log('[ReservationCalendar] 스케줄 생성 API 응답:', response);
      console.log('[ReservationCalendar] 응답 상태:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('[ReservationCalendar] 스케줄 생성 API 성공 응답:', result);
        
        if (result.success) {
          alert('스케줄이 생성되었습니다.');
          // 달력 데이터 다시 불러오기
          const calendarDays = generateCalendarDays(year, month);
          const firstDay = new Date(year, month - 1, 1);
          const lastDay = new Date(year, month, 0);
          const fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
          const toDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
          
          // 스케줄 데이터 다시 불러오기
          try {
            const reservationsResponse = await apiGet('/reservations');
            if (reservationsResponse.ok) {
              const reservationsResult = await reservationsResponse.json();
              // 달력 데이터 갱신을 위해 useEffect 트리거
              setYear(year);
              setMonth(month);
            }
          } catch (error) {
            console.error('[ReservationCalendar] 스케줄 생성 후 데이터 갱신 실패:', error);
          }
        } else {
          alert('스케줄 생성에 실패했습니다: ' + (result.message || '알 수 없는 오류'));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ReservationCalendar] 스케줄 생성 API 오류 응답:', errorData);
        alert('스케줄 생성에 실패했습니다: ' + (errorData.message || response.statusText));
      }
    } catch (error) {
      console.error('[ReservationCalendar] 스케줄 생성 중 오류 발생:', error);
      alert('스케줄 생성 중 오류가 발생했습니다.');
    }
  };

  // 스케줄 삭제하기 (스케줄 삭제 API)
  const handleDeleteShip = async () => {
    if (!selectedBoat) {
      alert('배를 선택해주세요.');
      return;
    }

    if (!startDate || !endDate) {
      alert('날짜 범위를 선택해주세요.');
      return;
    }

    // 날짜 범위와 배를 기반으로 스케줄 찾기
    let schedulePublicId = null;
    
    try {
      // 예약 데이터에서 해당 날짜 범위와 배에 해당하는 스케줄 찾기
      const reservationsResponse = await apiGet('/reservations');
      if (reservationsResponse.ok) {
        const reservationsResult = await reservationsResponse.json();
        let allReservations = [];
        
        if (Array.isArray(reservationsResult)) {
          allReservations = reservationsResult;
        } else if (reservationsResult.success && reservationsResult.data) {
          allReservations = Array.isArray(reservationsResult.data) ? reservationsResult.data : 
                          (reservationsResult.data.content ? reservationsResult.data.content : []);
        }
        
        // 날짜 범위와 배에 해당하는 예약 찾기
        const matchingReservation = allReservations.find(reservation => {
          const reservationDate = reservation.scheduleDeparture || reservation.departureDate || reservation.date || reservation.scheduleDate;
          if (!reservationDate) return false;
          const dateKey = reservationDate.split('T')[0];
          const matchesDate = dateKey >= startDate && dateKey <= endDate;
          
          const reservationShipId = reservation.ship?.shipId || reservation.shipId;
          const matchesShip = String(reservationShipId) === String(selectedBoat);
          
          return matchesDate && matchesShip;
        });
        
        if (matchingReservation) {
          schedulePublicId = matchingReservation.schedulePublicId || 
                            matchingReservation.schedule_public_id ||
                            matchingReservation.schedule?.schedulePublicId;
        }
      }
      
      // 스케줄을 찾지 못한 경우, 달력 데이터에서 찾기
      if (!schedulePublicId) {
        const matchingDay = calendarData.find(day => {
          if (day.prevMonth || day.nextMonth) return false;
          const dayDate = `${year}-${String(month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
          return dayDate >= startDate && dayDate <= endDate && day.schedulePublicId;
        });
        
        if (matchingDay) {
          schedulePublicId = matchingDay.schedulePublicId;
        }
      }
      
      if (!schedulePublicId) {
        alert('해당 날짜 범위와 배에 대한 스케줄을 찾을 수 없습니다.');
        return;
      }
      
      if (!window.confirm('선택한 스케줄을 삭제하시겠습니까?')) {
        return;
      }

      console.log('[ReservationCalendar] 스케줄 삭제 API 요청 시작');
      console.log('[ReservationCalendar] 삭제할 schedulePublicId:', schedulePublicId);
      
      const response = await apiDelete(`/schedules/${schedulePublicId}`);

      console.log('[ReservationCalendar] 스케줄 삭제 API 응답:', response);
      console.log('[ReservationCalendar] 응답 상태:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        console.log('[ReservationCalendar] 스케줄 삭제 API 성공 응답:', result);
        
        alert('스케줄이 삭제되었습니다.');
        // 달력 데이터 다시 불러오기
        setYear(year);
        setMonth(month);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ReservationCalendar] 스케줄 삭제 API 오류 응답:', errorData);
        alert('스케줄 삭제에 실패했습니다: ' + (errorData.message || response.statusText));
      }
    } catch (error) {
      console.error('[ReservationCalendar] 스케줄 삭제 중 오류 발생:', error);
      alert('스케줄 삭제 중 오류가 발생했습니다.');
    }
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

  // Split data into weeks
  const weeks = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
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
        {/* Header and Filter section in one card */}
        <div className="flex px-[42px] flex-col items-start gap-[10px] self-stretch">
          <div className="flex w-full mx-auto py-[40px] px-[60px] flex-col justify-center items-start gap-[40px] rounded-[20px] bg-[#F7F8FC] shadow-[0_4px_4px_0_rgba(39,84,218,0.2)]">
            {/* Title and Description */}
            <div className="flex flex-col items-start gap-[10px]">
              <h1 className="text-[#272C3C] font-pretendard text-[30px] font-bold leading-normal">
                예약달력
              </h1>
              <p className="text-[#272C3C] font-pretendard text-[18px] font-normal leading-normal">
                예약달력을 관리할 수 있습니다. <br />
                아래의 날짜 설정기능을 이용해 기간별 배 지정을 간편히 할 수 있습니다.
              </p>
            </div>

            {/* Filter section */}
            <div className="flex w-full flex-col gap-[15px]">
              {/* Date and Type in one row */}
              <div className="flex justify-between items-center self-stretch">
                {/* Date range - Left side */}
                <div className="flex items-start gap-[10px]">
                  <div className="flex w-[67px] py-[8px] px-[10px] items-center gap-[10px]">
                    <p className="text-[#272C3C] font-pretendard text-[18px] font-normal leading-normal">날짜</p>
                  </div>
                  <div className="flex items-center gap-[12px] relative">
                    <div className="flex items-center">
                      <div 
                        className="flex w-[184px] py-[9px] px-[20px] items-center gap-[10px] rounded-[10px] border border-[#BDBDBD] bg-white cursor-pointer"
                        onClick={() => {
                          setShowStartCalendar(!showStartCalendar);
                          setShowEndCalendar(false);
                          if (!showStartCalendar) {
                            // 캘린더 열 때 현재 선택된 날짜의 연도/월로 설정
                            if (startDate) {
                              const dateObj = new Date(startDate);
                              setCalendarYear(dateObj.getFullYear());
                              setCalendarMonth(dateObj.getMonth() + 1);
                            } else {
                              setCalendarYear(year);
                              setCalendarMonth(month);
                            }
                          }
                        }}
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
                        onClick={() => {
                          setShowEndCalendar(!showEndCalendar);
                          setShowStartCalendar(false);
                          if (!showEndCalendar) {
                            // 캘린더 열 때 현재 선택된 날짜의 연도/월로 설정
                            if (endDate) {
                              const dateObj = new Date(endDate);
                              setCalendarYear(dateObj.getFullYear());
                              setCalendarMonth(dateObj.getMonth() + 1);
                            } else if (startDate) {
                              const dateObj = new Date(startDate);
                              setCalendarYear(dateObj.getFullYear());
                              setCalendarMonth(dateObj.getMonth() + 1);
                            } else {
                              setCalendarYear(year);
                              setCalendarMonth(month);
                            }
                          }
                        }}
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
                      <div className="absolute top-[45px] left-0 z-50 bg-white rounded-[10px] shadow-lg p-[20px] border border-[#E7E7E7]">
                        {/* 년도 선택 행 */}
                        <div className="flex items-center justify-between mb-[10px] relative">
                          <button 
                            onClick={() => {
                              if (calendarYear > today.getFullYear() - 50) {
                                setCalendarYear(calendarYear - 1);
                              }
                            }}
                            className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[5px] hover:bg-[#EEF4FF] text-[#2754DA] text-[14px] font-medium"
                            disabled={calendarYear <= today.getFullYear() - 50}
                          >
                            <span>&lt;&lt;</span>
                            <span>이전해</span>
                          </button>
                          <div className="relative">
                            <div 
                              className="flex items-center gap-[5px] px-[15px] py-[5px] cursor-pointer hover:bg-[#EEF4FF] rounded-[5px]"
                              onClick={() => {
                                setShowYearDropdown(!showYearDropdown);
                                setShowMonthDropdown(false);
                              }}
                            >
                              <p className="text-[#2754DA] text-[18px] font-medium">{calendarYear}년</p>
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L6 6L11 1" stroke="#2754DA" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </div>
                            {showYearDropdown && (
                              <div className="absolute top-[35px] left-0 bg-white rounded-[10px] shadow-lg border border-[#E7E7E7] w-[120px] max-h-[150px] overflow-y-auto z-10">
                                {generateYearList().map((y) => (
                                  <div
                                    key={y}
                                    onClick={() => {
                                      setCalendarYear(y);
                                      setShowYearDropdown(false);
                                    }}
                                    className={`px-[15px] py-[8px] cursor-pointer hover:bg-[#EEF4FF] ${
                                      y === calendarYear ? 'bg-[#EEF4FF] font-bold' : ''
                                    }`}
                                  >
                                    <p className="text-[#272C3C] text-[14px]">{y}년</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              if (calendarYear < today.getFullYear() + 50) {
                                setCalendarYear(calendarYear + 1);
                              }
                            }}
                            className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[5px] hover:bg-[#EEF4FF] text-[#2754DA] text-[14px] font-medium"
                            disabled={calendarYear >= today.getFullYear() + 50}
                          >
                            <span>다음해</span>
                            <span>&gt;&gt;</span>
                          </button>
                        </div>
                        
                        {/* 월 선택 행 */}
                        <div className="flex items-center justify-between mb-[15px] relative">
                          <button 
                            onClick={() => {
                              if (calendarMonth === 1) {
                                setCalendarMonth(12);
                                setCalendarYear(calendarYear - 1);
                              } else {
                                setCalendarMonth(calendarMonth - 1);
                              }
                            }}
                            className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[5px] hover:bg-[#EEF4FF] text-[#2754DA] text-[14px] font-medium"
                          >
                            <span>&lt;</span>
                            <span>이전달</span>
                          </button>
                          <div className="relative">
                            <div 
                              className="flex items-center gap-[5px] px-[15px] py-[5px] cursor-pointer hover:bg-[#EEF4FF] rounded-[5px]"
                              onClick={() => {
                                setShowMonthDropdown(!showMonthDropdown);
                                setShowYearDropdown(false);
                              }}
                            >
                              <p className="text-[#2754DA] text-[18px] font-medium">{calendarMonth}월</p>
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L6 6L11 1" stroke="#2754DA" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </div>
                            {showMonthDropdown && (
                              <div className="absolute top-[35px] left-0 bg-white rounded-[10px] shadow-lg border border-[#E7E7E7] w-[100px] max-h-[180px] overflow-y-auto z-10">
                                {generateMonthList().map((m) => (
                                  <div
                                    key={m}
                                    onClick={() => {
                                      setCalendarMonth(m);
                                      setShowMonthDropdown(false);
                                    }}
                                    className={`px-[15px] py-[8px] cursor-pointer hover:bg-[#EEF4FF] ${
                                      m === calendarMonth ? 'bg-[#EEF4FF] font-bold' : ''
                                    }`}
                                  >
                                    <p className="text-[#272C3C] text-[14px]">{m}월</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              if (calendarMonth === 12) {
                                setCalendarMonth(1);
                                setCalendarYear(calendarYear + 1);
                              } else {
                                setCalendarMonth(calendarMonth + 1);
                              }
                            }}
                            className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[5px] hover:bg-[#EEF4FF] text-[#2754DA] text-[14px] font-medium"
                          >
                            <span>다음달</span>
                            <span>&gt;</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-[5px]">
                          {daysOfWeek.map((day, idx) => (
                            <div key={idx} className="text-center text-[14px] font-medium py-[5px]">{day}</div>
                          ))}
                          {generateCalendarDays(calendarYear, calendarMonth).map((day, idx) => (
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
                          onClick={() => {
                            setShowStartCalendar(false);
                            setShowYearDropdown(false);
                            setShowMonthDropdown(false);
                          }}
                          className="mt-[15px] w-full py-[8px] bg-[#EEF4FF] text-[#2754DA] rounded-[5px] font-medium"
                        >
                          닫기
                        </button>
                      </div>
                    )}
                    
                    {/* 끝날짜 캘린더 팝업 */}
                    {showEndCalendar && (
                      <div className="absolute top-[45px] left-[210px] z-50 bg-white rounded-[10px] shadow-lg p-[20px] border border-[#E7E7E7]">
                        {/* 년도 선택 행 */}
                        <div className="flex items-center justify-between mb-[10px] relative">
                          <button 
                            onClick={() => {
                              if (calendarYear > today.getFullYear() - 50) {
                                setCalendarYear(calendarYear - 1);
                              }
                            }}
                            className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[5px] hover:bg-[#EEF4FF] text-[#2754DA] text-[14px] font-medium"
                            disabled={calendarYear <= today.getFullYear() - 50}
                          >
                            <span>&lt;&lt;</span>
                            <span>이전해</span>
                          </button>
                          <div className="relative">
                            <div 
                              className="flex items-center gap-[5px] px-[15px] py-[5px] cursor-pointer hover:bg-[#EEF4FF] rounded-[5px]"
                              onClick={() => {
                                setShowYearDropdown(!showYearDropdown);
                                setShowMonthDropdown(false);
                              }}
                            >
                              <p className="text-[#2754DA] text-[18px] font-medium">{calendarYear}년</p>
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L6 6L11 1" stroke="#2754DA" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </div>
                            {showYearDropdown && (
                              <div className="absolute top-[35px] left-0 bg-white rounded-[10px] shadow-lg border border-[#E7E7E7] w-[120px] max-h-[150px] overflow-y-auto z-10">
                                {generateYearList().map((y) => (
                                  <div
                                    key={y}
                                    onClick={() => {
                                      setCalendarYear(y);
                                      setShowYearDropdown(false);
                                    }}
                                    className={`px-[15px] py-[8px] cursor-pointer hover:bg-[#EEF4FF] ${
                                      y === calendarYear ? 'bg-[#EEF4FF] font-bold' : ''
                                    }`}
                                  >
                                    <p className="text-[#272C3C] text-[14px]">{y}년</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              if (calendarYear < today.getFullYear() + 50) {
                                setCalendarYear(calendarYear + 1);
                              }
                            }}
                            className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[5px] hover:bg-[#EEF4FF] text-[#2754DA] text-[14px] font-medium"
                            disabled={calendarYear >= today.getFullYear() + 50}
                          >
                            <span>다음해</span>
                            <span>&gt;&gt;</span>
                          </button>
                        </div>
                        
                        {/* 월 선택 행 */}
                        <div className="flex items-center justify-between mb-[15px] relative">
                          <button 
                            onClick={() => {
                              if (calendarMonth === 1) {
                                setCalendarMonth(12);
                                setCalendarYear(calendarYear - 1);
                              } else {
                                setCalendarMonth(calendarMonth - 1);
                              }
                            }}
                            className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[5px] hover:bg-[#EEF4FF] text-[#2754DA] text-[14px] font-medium"
                          >
                            <span>&lt;</span>
                            <span>이전달</span>
                          </button>
                          <div className="relative">
                            <div 
                              className="flex items-center gap-[5px] px-[15px] py-[5px] cursor-pointer hover:bg-[#EEF4FF] rounded-[5px]"
                              onClick={() => {
                                setShowMonthDropdown(!showMonthDropdown);
                                setShowYearDropdown(false);
                              }}
                            >
                              <p className="text-[#2754DA] text-[18px] font-medium">{calendarMonth}월</p>
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L6 6L11 1" stroke="#2754DA" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </div>
                            {showMonthDropdown && (
                              <div className="absolute top-[35px] left-0 bg-white rounded-[10px] shadow-lg border border-[#E7E7E7] w-[100px] max-h-[180px] overflow-y-auto z-10">
                                {generateMonthList().map((m) => (
                                  <div
                                    key={m}
                                    onClick={() => {
                                      setCalendarMonth(m);
                                      setShowMonthDropdown(false);
                                    }}
                                    className={`px-[15px] py-[8px] cursor-pointer hover:bg-[#EEF4FF] ${
                                      m === calendarMonth ? 'bg-[#EEF4FF] font-bold' : ''
                                    }`}
                                  >
                                    <p className="text-[#272C3C] text-[14px]">{m}월</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              if (calendarMonth === 12) {
                                setCalendarMonth(1);
                                setCalendarYear(calendarYear + 1);
                              } else {
                                setCalendarMonth(calendarMonth + 1);
                              }
                            }}
                            className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[5px] hover:bg-[#EEF4FF] text-[#2754DA] text-[14px] font-medium"
                          >
                            <span>다음달</span>
                            <span>&gt;</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-[5px]">
                          {daysOfWeek.map((day, idx) => (
                            <div key={idx} className="text-center text-[14px] font-medium py-[5px]">{day}</div>
                          ))}
                          {generateCalendarDays(calendarYear, calendarMonth).map((day, idx) => (
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
                          onClick={() => {
                            setShowEndCalendar(false);
                            setShowYearDropdown(false);
                            setShowMonthDropdown(false);
                          }}
                          className="mt-[15px] w-full py-[8px] bg-[#EEF4FF] text-[#2754DA] rounded-[5px] font-medium"
                        >
                          닫기
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Boat selector - Second row */}
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

              {/* Save and Delete buttons - Bottom right */}
              <div className="flex justify-end items-center gap-[10px] self-stretch">
                <button 
                  onClick={handleSaveShip}
                  className="flex py-[9px] px-[20px] justify-center items-center gap-[10px] rounded-[20px] border-2 border-[#BDBDBD] bg-white cursor-pointer hover:opacity-80"
                >
                  <span className="text-[#73757C] font-pretendard text-[16px] font-medium leading-normal">저장하기</span>
                </button>
                <button 
                  onClick={handleDeleteShip}
                  className="flex py-[9px] px-[20px] justify-center items-center gap-[10px] rounded-[20px] border-2 border-[#BDBDBD] bg-white cursor-pointer hover:opacity-80"
                >
                  <span className="text-[#73757C] font-pretendard text-[16px] font-medium leading-normal">삭제하기</span>
                </button>
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
              
              <div className="relative">
                <div 
                  className="main-year-button flex py-[5px] px-[12px] pl-[15px] justify-center items-center gap-[10px] rounded-[10px] cursor-pointer hover:bg-[#EEF4FF]"
                  onClick={() => {
                    setShowMainYearDropdown(!showMainYearDropdown);
                    setShowMainMonthDropdown(false);
                  }}
                >
                  <p className="text-[#121212] font-pretendard text-[30px] font-normal leading-normal">{year}년</p>
                  <svg width="24" height="21" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.3594 13.8525C9.76657 14.751 8.44827 14.751 7.85541 13.8525L0.249952 2.32611C-0.408086 1.32883 0.307147 8.89308e-08 1.50197 1.93385e-07L16.7129 1.52317e-06C17.9077 1.62762e-06 18.6229 1.32883 17.9649 2.32612L10.3594 13.8525Z" fill="#2754DA"/>
                  </svg>
                </div>
                {showMainYearDropdown && (
                  <div className="main-year-dropdown absolute top-[45px] left-0 bg-white rounded-[10px] shadow-lg border border-[#E7E7E7] w-[120px] max-h-[150px] overflow-y-auto z-50">
                    {generateYearList().map((y) => (
                      <div
                        key={y}
                        onClick={() => {
                          setYear(y);
                          setShowMainYearDropdown(false);
                        }}
                        className={`px-[15px] py-[8px] cursor-pointer hover:bg-[#EEF4FF] ${
                          y === year ? 'bg-[#EEF4FF] font-bold' : ''
                        }`}
                      >
                        <p className="text-[#272C3C] text-[14px]">{y}년</p>
                      </div>
                    ))}
                  </div>
                )}
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

              <div className="relative">
                <div 
                  className="main-month-button flex w-[155px] py-[5px] px-[12px] pl-[16px] justify-center items-center gap-[10px] rounded-[10px] cursor-pointer hover:bg-[#EEF4FF]"
                  onClick={() => {
                    setShowMainMonthDropdown(!showMainMonthDropdown);
                    setShowMainYearDropdown(false);
                  }}
                >
                  <p className="text-[#121212] font-pretendard text-[40px] font-medium leading-normal">{month}월</p>
                  <svg width="24" height="21" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.3594 13.8525C9.76657 14.751 8.44827 14.751 7.85541 13.8525L0.249952 2.32611C-0.408086 1.32883 0.307147 8.89308e-08 1.50197 1.93385e-07L16.7129 1.52317e-06C17.9077 1.62762e-06 18.6229 1.32883 17.9649 2.32612L10.3594 13.8525Z" fill="#2754DA"/>
                  </svg>
                </div>
                {showMainMonthDropdown && (
                  <div className="main-month-dropdown absolute top-[50px] left-0 bg-white rounded-[10px] shadow-lg border border-[#E7E7E7] w-[100px] max-h-[180px] overflow-y-auto z-50">
                    {generateMonthList().map((m) => (
                      <div
                        key={m}
                        onClick={() => {
                          setMonth(m);
                          setShowMainMonthDropdown(false);
                        }}
                        className={`px-[15px] py-[8px] cursor-pointer hover:bg-[#EEF4FF] ${
                          m === month ? 'bg-[#EEF4FF] font-bold' : ''
                        }`}
                      >
                        <p className="text-[#272C3C] text-[14px]">{m}월</p>
                      </div>
                    ))}
                  </div>
                )}
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
            {isLoadingCalendar ? (
              <div className="flex items-center justify-center w-full py-[100px]">
                <span className="text-[18px] text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                  달력 데이터를 불러오는 중...
                </span>
              </div>
            ) : weeks.length === 0 ? (
              <div className="flex items-center justify-center w-full py-[100px]">
                <span className="text-[18px] text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                  달력 데이터가 없습니다.
                </span>
              </div>
            ) : (
              weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex items-center self-stretch">
                  {week.map((dayData, dayIndex) => (
                    <div key={dayIndex}>
                      {renderDayCell(dayData)}
                    </div>
                  ))}
                </div>
              ))
            )}
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

            {/* 출항 관련 버튼들 */}
            <div className="flex gap-[10px] mb-[30px]">
              <button 
                onClick={handleConfirmDeparture}
                className="px-[20px] py-[12px] rounded-[10px] font-medium bg-[#EEF4FF] text-[#2754DA] hover:bg-[#DFE7F4] transition-colors"
                style={{ fontFamily: 'Pretendard' }}
              >
                출항확정
              </button>
              <button 
                onClick={handlePendingDeparture}
                className="px-[20px] py-[12px] rounded-[10px] font-medium bg-[#EEF4FF] text-[#2754DA] hover:bg-[#DFE7F4] transition-colors"
                style={{ fontFamily: 'Pretendard' }}
              >
                출항보류
              </button>
              <button 
                onClick={handleCancelDeparture}
                className="px-[20px] py-[12px] rounded-[10px] font-medium bg-[#EEF4FF] text-[#2754DA] hover:bg-[#DFE7F4] transition-colors"
                style={{ fontFamily: 'Pretendard' }}
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
                  {!selectedDayReservations.reservations || selectedDayReservations.reservations.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-[30px] text-center text-[#73757C] font-pretendard text-[16px]">
                        예약 정보가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    selectedDayReservations.reservations.map((reservation, idx) => {
                      console.log('[ReservationCalendar] 렌더링할 예약:', reservation);
                      return (
                      <tr 
                        key={idx} 
                        className="border-b border-[#E7E7E7]"
                      >
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
                            reservation.status === '입금완료' ? 'text-[#272C3C]' :
                            reservation.status === '취소접수' ? 'text-[#ED2626]' :
                            reservation.status === '취소완료' ? 'text-[#73757C]' :
                            'text-[#272C3C]'
                          }`}>
                            {reservation.status}
                          </span>
                        </td>
                      </tr>
                      );
                    })
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

      {/* 예약 상세 정보 모달 */}
      {showReservationDetailModal && selectedReservationDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-[20px] p-[40px] w-[800px] max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-[20px]">
              <h2 className="text-[#272C3C] font-pretendard text-[28px] font-bold">
                예약 상세 정보
              </h2>
              <button 
                onClick={() => {
                  setShowReservationDetailModal(false);
                  setSelectedReservationDetail(null);
                }}
                className="text-[#272C3C] text-[24px] font-bold hover:text-[#2754DA]"
              >
                ×
              </button>
            </div>

            {/* 예약 상세 정보 */}
            <div className="flex flex-col gap-[20px]">
              {/* 예약자 정보 */}
              <div className="border-b border-[#E7E7E7] pb-[15px]">
                <h3 className="text-[#272C3C] font-pretendard text-[20px] font-bold mb-[10px]">예약자 정보</h3>
                <div className="grid grid-cols-2 gap-[15px]">
                  <div>
                    <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">이름</p>
                    <p className="text-[#272C3C] font-pretendard text-[16px]">
                      {selectedReservationDetail.reservation?.username || selectedReservationDetail.reservation?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">닉네임</p>
                    <p className="text-[#272C3C] font-pretendard text-[16px]">
                      {selectedReservationDetail.reservation?.nickname || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">연락처</p>
                    <p className="text-[#272C3C] font-pretendard text-[16px]">
                      {selectedReservationDetail.reservation?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">예약 인원</p>
                    <p className="text-[#272C3C] font-pretendard text-[16px]">
                      {selectedReservationDetail.reservation?.headCount || 0}명
                    </p>
                  </div>
                </div>
              </div>

              {/* 배 정보 */}
              {selectedReservationDetail.ship && (
                <div className="border-b border-[#E7E7E7] pb-[15px]">
                  <h3 className="text-[#272C3C] font-pretendard text-[20px] font-bold mb-[10px]">배 정보</h3>
                  <div className="grid grid-cols-2 gap-[15px]">
                    <div>
                      <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">어종</p>
                      <p className="text-[#272C3C] font-pretendard text-[16px]">
                        {selectedReservationDetail.ship.fishType || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">안내사항</p>
                      <p className="text-[#272C3C] font-pretendard text-[16px]">
                        {selectedReservationDetail.ship.notification || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 스케줄 정보 */}
              {selectedReservationDetail.schedule && (
                <div className="border-b border-[#E7E7E7] pb-[15px]">
                  <h3 className="text-[#272C3C] font-pretendard text-[20px] font-bold mb-[10px]">스케줄 정보</h3>
                  <div className="grid grid-cols-2 gap-[15px]">
                    <div>
                      <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">출항일</p>
                      <p className="text-[#272C3C] font-pretendard text-[16px]">
                        {selectedReservationDetail.schedule.departure || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">요일</p>
                      <p className="text-[#272C3C] font-pretendard text-[16px]">
                        {selectedReservationDetail.schedule.dayOfWeek || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">물때</p>
                      <p className="text-[#272C3C] font-pretendard text-[16px]">
                        {selectedReservationDetail.schedule.tide ? `${selectedReservationDetail.schedule.tide}물` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 예약 정보 */}
              {selectedReservationDetail.reservation && (
                <div className="border-b border-[#E7E7E7] pb-[15px]">
                  <h3 className="text-[#272C3C] font-pretendard text-[20px] font-bold mb-[10px]">예약 정보</h3>
                  <div className="grid grid-cols-2 gap-[15px]">
                    <div>
                      <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">총 금액</p>
                      <p className="text-[#272C3C] font-pretendard text-[16px]">
                        {selectedReservationDetail.reservation.totalPrice ? `${selectedReservationDetail.reservation.totalPrice.toLocaleString()}원` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">예약 상태</p>
                      <p className="text-[#272C3C] font-pretendard text-[16px]">
                        {getProcessStatusText(selectedReservationDetail.reservation.process)}
                      </p>
                    </div>
                    {selectedReservationDetail.reservation.request && (
                      <div className="col-span-2">
                        <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">요청사항</p>
                        <p className="text-[#272C3C] font-pretendard text-[16px]">
                          {selectedReservationDetail.reservation.request}
                        </p>
                      </div>
                    )}
                    {selectedReservationDetail.reservation.couponId && (
                      <div>
                        <p className="text-[#73757C] font-pretendard text-[14px] mb-[5px]">쿠폰 ID</p>
                        <p className="text-[#272C3C] font-pretendard text-[16px]">
                          {selectedReservationDetail.reservation.couponId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 닫기 버튼 */}
            <div className="flex justify-center mt-[30px]">
              <button 
                onClick={() => {
                  setShowReservationDetailModal(false);
                  setSelectedReservationDetail(null);
                }}
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
