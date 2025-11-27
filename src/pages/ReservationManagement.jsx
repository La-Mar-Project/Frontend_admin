import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost, apiPatch } from '../utils/api';

function ReservationManagement() {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;
  const [showCouponModal, setShowCouponModal] = useState(false);
  
  // 날짜 선택 관련
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  
  // 타입 및 배 선택
  const [selectedType, setSelectedType] = useState('');
  const [selectedBoat, setSelectedBoat] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [boats, setBoats] = useState([]);
  const [clickedStatusRowId, setClickedStatusRowId] = useState(null);

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  // 배 리스트 불러오기
  useEffect(() => {
    const fetchBoats = async () => {
      try {
        const response = await apiGet('/ships?page=0&size=100');
        if (response.ok) {
          const result = await response.json();
          console.log('[ReservationManagement] 배 목록 API 응답:', result);
          
          if (result.success && result.data && result.data.content) {
            const boatsData = result.data.content.map((item) => ({
              id: item.ship?.shipId || item.shipId,
              shipId: item.ship?.shipId || item.shipId,
              fishType: item.ship?.fishType || item.fishType || '',
              price: item.ship?.price || item.price || 0,
              maxHeadCount: item.ship?.maxHeadCount || item.maxHeadCount || 0,
              notification: item.ship?.notification || item.notification || ''
            }));
            
            setBoats(boatsData);
          }
        }
      } catch (error) {
        console.error('[ReservationManagement] 배 리스트 불러오기 실패:', error);
      }
    };
    fetchBoats();
  }, []);

  // 예약 목록 불러오기
  useEffect(() => {
    fetchReservations();
  }, []);

  // 예약 목록 조회 함수
  const fetchReservations = async () => {
    setLoading(true);
    try {
      // 전체 데이터를 가져오기 위해 모든 페이지를 순회
      let allReservationsData = [];
      let currentPage = 0;
      const pageSize = 100; // 한 번에 가져올 데이터 수
      let hasMore = true;
      
      while (hasMore) {
        const response = await apiGet(`/reservations?page=${currentPage}&size=${pageSize}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`[ReservationManagement] 예약 목록 API 응답 (페이지 ${currentPage}):`, result);
          
          let pageData = [];
          
          if (Array.isArray(result)) {
            // 응답이 배열인 경우
            pageData = result;
            // 배열 응답의 경우, 페이지 크기만큼 정확히 데이터가 있으면 다음 페이지가 있을 수 있음
            // 하지만 일반적으로 배열 응답은 전체 데이터를 한 번에 반환하므로, pageSize보다 작으면 종료
            hasMore = pageData.length === pageSize && currentPage === 0;
          } else if (result.success && result.data) {
            // 응답이 객체이고 success/data 구조인 경우
            if (Array.isArray(result.data)) {
              pageData = result.data;
            } else if (result.data.content && Array.isArray(result.data.content)) {
              pageData = result.data.content;
              // totalElements 확인
              if (result.data.totalElements !== undefined) {
                const totalElements = result.data.totalElements;
                const totalPages = Math.ceil(totalElements / pageSize);
                hasMore = currentPage < totalPages - 1;
              } else {
                hasMore = pageData.length === pageSize;
              }
            }
          } else if (result.data) {
            // data 필드만 있는 경우
            if (Array.isArray(result.data)) {
              pageData = result.data;
            } else if (result.data.content && Array.isArray(result.data.content)) {
              pageData = result.data.content;
              if (result.data.totalElements !== undefined) {
                const totalElements = result.data.totalElements;
                const totalPages = Math.ceil(totalElements / pageSize);
                hasMore = currentPage < totalPages - 1;
              } else {
                hasMore = pageData.length === pageSize;
              }
            }
          } else if (result.content && Array.isArray(result.content)) {
            // PageResponse 형태 (content 필드가 직접 있는 경우)
            pageData = result.content;
            if (result.totalElements !== undefined) {
              const totalElements = result.totalElements;
              const totalPages = Math.ceil(totalElements / pageSize);
              hasMore = currentPage < totalPages - 1;
            } else {
              hasMore = pageData.length === pageSize;
            }
          }
          
          allReservationsData = [...allReservationsData, ...pageData];
          console.log(`[ReservationManagement] 페이지 ${currentPage} 데이터 개수: ${pageData.length}, 누적: ${allReservationsData.length}`);
          
          // 더 이상 데이터가 없으면 종료
          if (pageData.length < pageSize && !hasMore) {
            hasMore = false;
          } else if (pageData.length === 0) {
            hasMore = false;
          } else {
            currentPage++;
          }
        } else {
          console.error(`[ReservationManagement] 페이지 ${currentPage} 조회 실패:`, response.status);
          hasMore = false;
        }
      }
      
      console.log('[ReservationManagement] 전체 예약 데이터 개수:', allReservationsData.length);
      
      // API 응답이 배열인지 객체인지 확인
      let reservationsData = allReservationsData;
        
        console.log('[ReservationManagement] 처리할 예약 데이터:', reservationsData);
        
        const formattedReservations = reservationsData.map((reservation, index) => {
          console.log(`[ReservationManagement] 예약 ${index + 1} 원본 데이터:`, reservation);
          
          // reservationPublicId 찾기 (reservationPublicId 우선, 여러 필드명 체크 및 타입 변환)
          const reservationId = reservation.reservationPublicId || 
                               reservation.reservation_public_id || 
                               reservation.reservation_id || 
                               reservation.id ||
                               reservation.reservationId;
          
          // 숫자일 경우 문자열로 변환
          const reservationIdStr = reservationId ? String(reservationId) : null;
          
          // OpenAPI 스펙에 따른 필드 매핑
          const formatted = {
            id: reservationIdStr || `reservation-${index}`,
            reservationPublicId: reservationIdStr, // null일 수 있음
            date: formatDate(reservation.scheduleDeparture || reservation.departureDate || reservation.date || reservation.scheduleDate),
            name: reservation.name || reservation.username || reservation.userName || '예약자',
            phone: reservation.phone || reservation.phoneNumber || reservation.phone_number || '',
            headCount: reservation.headCount || reservation.head_count || reservation.headCount || 0,
            boat: reservation.shipFishType || reservation.ship?.fishType || reservation.fishType || '배 정보 없음',
            amount: (reservation.totalPrice || reservation.price || 0).toLocaleString(),
            memo: reservation.memo || reservation.notification || reservation.description || '',
            status: getStatusText(reservation.process),
            statusColor: getStatusColor(reservation.process),
            payment: reservation.paymentInfo || reservation.payment || reservation.payment_info || '입금정보 없음',
            coupon: reservation.hasCoupon || reservation.coupon || false,
            process: reservation.process
          };
          
          console.log(`[ReservationManagement] 예약 ${index + 1} 포맷된 데이터:`, formatted);
          console.log(`[ReservationManagement] 예약 ${index + 1} reservationPublicId:`, formatted.reservationPublicId);
          return formatted;
        });
        
        console.log('[ReservationManagement] 최종 포맷된 예약 목록:', formattedReservations);
        setReservations(formattedReservations);
    } catch (error) {
      console.error('[ReservationManagement] 예약 목록 조회 오류:', error);
      // 에러가 발생해도 빈 배열로 설정하여 UI가 깨지지 않도록 함
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 상태 텍스트 변환
  const getStatusText = (process) => {
    const statusMap = {
      'RESERVE_COMPLETED': '예약접수',
      'DEPOSIT_COMPLETED': '입금완료',
      'CANCEL_REQUESTED': '취소접수',
      'CANCEL_COMPLETED': '취소완료'
    };
    return statusMap[process] || process || '예약접수';
  };

  // 상태 색상 변환
  const getStatusColor = (process) => {
    const colorMap = {
      'RESERVE_COMPLETED': '#2754DA',
      'DEPOSIT_COMPLETED': '#272C3C',
      'CANCEL_REQUESTED': '#ED2626',
      'CANCEL_COMPLETED': '#272C3C'
    };
    return colorMap[process] || '#2754DA';
  };

  // 캘린더 생성 함수 (ReservationCalendar와 동일)
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

  // 검색하기 버튼 클릭
  const handleSearch = async () => {
    setLoading(true);
    try {
      // 전체 데이터를 가져오기 위해 모든 페이지를 순회
      let allReservationsData = [];
      let currentPage = 0;
      const pageSize = 100; // 한 번에 가져올 데이터 수
      let hasMore = true;
      
      while (hasMore) {
        const response = await apiGet(`/reservations?page=${currentPage}&size=${pageSize}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`[ReservationManagement] 검색 API 응답 (페이지 ${currentPage}):`, result);
          
          let pageData = [];
          
          if (Array.isArray(result)) {
            // 응답이 배열인 경우
            pageData = result;
            // 배열 응답의 경우, 페이지 크기만큼 정확히 데이터가 있으면 다음 페이지가 있을 수 있음
            // 하지만 일반적으로 배열 응답은 전체 데이터를 한 번에 반환하므로, pageSize보다 작으면 종료
            hasMore = pageData.length === pageSize && currentPage === 0;
          } else if (result.success && result.data) {
            // 응답이 객체이고 success/data 구조인 경우
            if (Array.isArray(result.data)) {
              pageData = result.data;
            } else if (result.data.content && Array.isArray(result.data.content)) {
              pageData = result.data.content;
              // totalElements 확인
              if (result.data.totalElements !== undefined) {
                const totalElements = result.data.totalElements;
                const totalPages = Math.ceil(totalElements / pageSize);
                hasMore = currentPage < totalPages - 1;
              } else {
                hasMore = pageData.length === pageSize;
              }
            }
          } else if (result.data) {
            // data 필드만 있는 경우
            if (Array.isArray(result.data)) {
              pageData = result.data;
            } else if (result.data.content && Array.isArray(result.data.content)) {
              pageData = result.data.content;
              if (result.data.totalElements !== undefined) {
                const totalElements = result.data.totalElements;
                const totalPages = Math.ceil(totalElements / pageSize);
                hasMore = currentPage < totalPages - 1;
              } else {
                hasMore = pageData.length === pageSize;
              }
            }
          } else if (result.content && Array.isArray(result.content)) {
            // PageResponse 형태 (content 필드가 직접 있는 경우)
            pageData = result.content;
            if (result.totalElements !== undefined) {
              const totalElements = result.totalElements;
              const totalPages = Math.ceil(totalElements / pageSize);
              hasMore = currentPage < totalPages - 1;
            } else {
              hasMore = pageData.length === pageSize;
            }
          }
          
          allReservationsData = [...allReservationsData, ...pageData];
          console.log(`[ReservationManagement] 검색 - 페이지 ${currentPage} 데이터 개수: ${pageData.length}, 누적: ${allReservationsData.length}`);
          
          // 더 이상 데이터가 없으면 종료
          if (pageData.length < pageSize && !hasMore) {
            hasMore = false;
          } else if (pageData.length === 0) {
            hasMore = false;
          } else {
            currentPage++;
          }
        } else {
          console.error(`[ReservationManagement] 검색 - 페이지 ${currentPage} 조회 실패:`, response.status);
          hasMore = false;
        }
      }
      
      console.log('[ReservationManagement] 검색 - 전체 예약 데이터 개수:', allReservationsData.length);
        
        console.log('[ReservationManagement] 검색 - 처리할 예약 데이터:', allReservationsData);
        
        // 클라이언트에서 필터링
        let filteredReservations = allReservationsData;
        
        // 날짜 필터
        if (startDate || endDate) {
          filteredReservations = filteredReservations.filter(reservation => {
            const reservationDate = reservation.scheduleDeparture || reservation.departureDate || reservation.date || reservation.scheduleDate;
            if (!reservationDate) return false;
            const dateKey = reservationDate.split('T')[0]; // 날짜만 추출
            if (startDate && dateKey < startDate) return false;
            if (endDate && dateKey > endDate) return false;
            return true;
          });
        }
        
        // 배 필터
        if (selectedBoat) {
          filteredReservations = filteredReservations.filter(reservation => {
            const reservationShipId = reservation.ship?.shipId || reservation.shipId;
            return String(reservationShipId) === String(selectedBoat);
          });
        }
        
        // 타입 필터
        if (selectedType) {
          const typeMap = { '일반예약': 'NORMAL', '선예약': 'EARLY' };
          const apiType = typeMap[selectedType];
          if (apiType) {
            filteredReservations = filteredReservations.filter(reservation => {
              const reservationType = reservation.type || reservation.reservationType;
              return reservationType === apiType;
            });
          }
        }
        
        const formattedReservations = filteredReservations.map((reservation, index) => {
          // reservationPublicId 찾기 (reservationPublicId 우선, 여러 필드명 체크 및 타입 변환)
          const reservationId = reservation.reservationPublicId || 
                               reservation.reservation_public_id || 
                               reservation.reservation_id || 
                               reservation.id ||
                               reservation.reservationId;
          
          // 숫자일 경우 문자열로 변환
          const reservationIdStr = reservationId ? String(reservationId) : null;
          
          // OpenAPI 스펙에 따른 필드 매핑
          return {
            id: reservationIdStr || `reservation-${index}`,
            reservationPublicId: reservationIdStr, // null일 수 있음
            date: formatDate(reservation.scheduleDeparture || reservation.departureDate || reservation.date || reservation.scheduleDate),
            name: reservation.name || reservation.username || reservation.userName || '예약자',
            phone: reservation.phone || reservation.phoneNumber || reservation.phone_number || '',
            headCount: reservation.headCount || reservation.head_count || reservation.headCount || 0,
            boat: reservation.shipFishType || reservation.ship?.fishType || reservation.fishType || '배 정보 없음',
            amount: (reservation.totalPrice || reservation.price || 0).toLocaleString(),
            memo: reservation.memo || reservation.notification || reservation.description || '',
            status: getStatusText(reservation.process),
            statusColor: getStatusColor(reservation.process),
            payment: reservation.paymentInfo || reservation.payment || reservation.payment_info || '입금정보 없음',
            coupon: reservation.hasCoupon || reservation.coupon || false,
            process: reservation.process
          };
        });
        
        console.log('[ReservationManagement] 검색 - 최종 포맷된 예약 목록:', formattedReservations);
        setReservations(formattedReservations);
    } catch (error) {
      console.error('[ReservationManagement] 검색 오류:', error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 쿠폰 버튼 클릭 핸들러
  const handleCouponClick = async (reservationId, currentCouponState) => {
    if (!reservationId) {
      console.warn('[ReservationManagement] reservationId가 없습니다.');
      return;
    }

    console.log('[ReservationManagement] 쿠폰 클릭 - reservationId:', reservationId, '현재 상태:', currentCouponState);

    // 낙관적 업데이트: 즉시 UI 업데이트
    const newCouponState = !currentCouponState;
    setReservations(prevReservations => 
      prevReservations.map(reservation => {
        // reservationPublicId 또는 id로 매칭
        const matchId = reservation.reservationPublicId || reservation.id;
        if (matchId === reservationId) {
          return { ...reservation, coupon: newCouponState };
        }
        return reservation;
      })
    );

    try {
      const response = await apiPost(`/reservations/${reservationId}/coupon`, {});
      
      if (response.ok) {
        const result = await response.json();
        console.log('[ReservationManagement] 쿠폰 설정 성공:', result);
        
        // 쿠폰 추가 시 팝업 표시
        if (newCouponState) {
          setShowCouponModal(true);
          setTimeout(() => setShowCouponModal(false), 2000);
        }
        
        // API 응답에 따라 상태 업데이트 (서버 응답이 최종 상태)
        // result.data가 null이 아닌지 확인
        if (result.data !== undefined && result.data !== null) {
          const serverCouponState = result.data.hasCoupon !== undefined ? result.data.hasCoupon : 
                                   result.data.coupon !== undefined ? result.data.coupon : newCouponState;
          
          setReservations(prevReservations => 
            prevReservations.map(reservation => {
              const matchId = reservation.reservationPublicId || reservation.id;
              if (matchId === reservationId) {
                return { ...reservation, coupon: serverCouponState };
              }
              return reservation;
            })
          );
        } else {
          // result.data가 없거나 null인 경우, 낙관적 업데이트 상태 유지
          console.log('[ReservationManagement] result.data가 없거나 null입니다. 낙관적 업데이트 상태를 유지합니다.');
        }
      } else {
        // 실패 시 이전 상태로 롤백
        setReservations(prevReservations => 
          prevReservations.map(reservation => {
            const matchId = reservation.reservationPublicId || reservation.id;
            if (matchId === reservationId) {
              return { ...reservation, coupon: currentCouponState };
            }
            return reservation;
          })
        );
        
        const errorData = await response.json().catch(() => ({}));
        alert(`쿠폰 설정 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('[ReservationManagement] 쿠폰 설정 오류:', error);
      
      // 에러 발생 시 이전 상태로 롤백
      setReservations(prevReservations => 
        prevReservations.map(reservation => {
          const matchId = reservation.reservationPublicId || reservation.id;
          if (matchId === reservationId) {
            return { ...reservation, coupon: currentCouponState };
          }
          return reservation;
        })
      );
      
      alert('쿠폰 설정 중 오류가 발생했습니다.');
    }
  };

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(reservations.length / itemsPerPage);
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 예약상태 변경 핸들러 (개별 예약)
  const handleStatusChange = async (reservationId, newStatus) => {
    const statusMap = {
      '예약접수': 'RESERVE_COMPLETED',
      '입금완료': 'DEPOSIT_COMPLETED',
      '취소접수': 'CANCEL_REQUESTED',
      '취소완료': 'CANCEL_COMPLETED'
    };

    const processValue = statusMap[newStatus];
    if (!processValue) {
      alert('올바른 상태를 선택해주세요.');
      return;
    }

    if (!reservationId) {
      console.error('[ReservationManagement] reservationId가 없습니다.');
      alert('예약 ID를 찾을 수 없습니다.');
      return;
    }

    const endpoint = `/reservations/${reservationId}/process`;
    const requestBody = { process: processValue };

    console.log('[ReservationManagement] 예약 상태 변경 요청:', {
      endpoint,
      reservationId,
      newStatus,
      processValue,
      requestBody,
      method: 'PATCH'
    });

    setLoading(true);
    try {
      const response = await apiPatch(endpoint, requestBody);

      console.log('[ReservationManagement] 예약 상태 변경 응답:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[ReservationManagement] 예약 상태 변경 성공:', result);
        
        // 목록 다시 불러오기
        await fetchReservations();
        setClickedStatusRowId(null);
      } else {
        const errorText = await response.text().catch(() => '');
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('[ReservationManagement] 에러 응답 파싱 실패:', errorText);
        }
        console.error('[ReservationManagement] 예약 상태 변경 실패:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorText: errorText.substring(0, 500)
        });
        alert(`예약 상태 변경에 실패했습니다: ${errorData.message || errorData.error || response.statusText || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('[ReservationManagement] 예약 상태 변경 오류:', error);
      console.error('[ReservationManagement] 에러 상세:', {
        message: error.message,
        stack: error.stack,
        endpoint,
        requestBody
      });
      alert('예약 상태 변경 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
      setClickedStatusRowId(null);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-start gap-[26px] px-[42px] py-[26px]">
        <div className="flex flex-col items-start gap-[10px] w-full mx-auto">
          <div className="flex flex-col items-start gap-[10px] rounded-[20px] bg-[#F7F8FC] px-[60px] py-[40px] title-section">
            <h1 className="text-[30px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
              예약관리
            </h1>
            <p className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard', lineHeight: '23px' }}>
              예약기록 및 취소기록을 관리할 수 있습니다.
            </p>

            <div className="flex flex-col items-start gap-[13px] self-stretch pt-[10px]">
              {/* 날짜 선택 및 타입 선택 */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-start gap-[10px] flex-1">
                  <div className="flex items-center gap-[10px] px-[10px] py-[8px] w-[67px]">
                    <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                      날짜
                    </span>
                  </div>
                  <div className="flex items-center gap-[12px] relative flex-1">
                    <div 
                      className="flex items-center gap-[10px] px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px] cursor-pointer"
                      onClick={() => {
                        setShowStartCalendar(!showStartCalendar);
                        setShowEndCalendar(false);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                      </svg>
                      <span className={`text-[16px] font-normal ${startDate ? 'text-[#272C3C]' : 'text-[#BDBDBD]'}`} style={{ fontFamily: 'Pretendard' }}>
                        {startDate || '시작날짜'}
                      </span>
                    </div>
                    <div className="flex items-center justify-center px-[10px] py-[9px] w-[28px]">
                      <span className="text-[16px] font-semibold text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>
                        -
                      </span>
                    </div>
                    <div 
                      className="flex items-center gap-[10px] px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px] cursor-pointer"
                      onClick={() => {
                        setShowEndCalendar(!showEndCalendar);
                        setShowStartCalendar(false);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                      </svg>
                      <span className={`text-[16px] font-normal ${endDate ? 'text-[#272C3C]' : 'text-[#BDBDBD]'}`} style={{ fontFamily: 'Pretendard' }}>
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

                  {/* 타입 선택 (날짜 오른쪽) */}
                  <div className="flex items-start gap-[10px] relative">
                <div className="flex items-center gap-[10px] px-[10px] py-[8px] w-[67px]">
                  <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    타입
                  </span>
                </div>
                    <div className="flex items-center gap-[5px] h-[37px] relative">
                      <div 
                        className="flex items-center justify-between px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px] h-[37px] cursor-pointer"
                        onClick={() => {
                          setShowTypeDropdown(!showTypeDropdown);
                          setShowStartCalendar(false);
                          setShowEndCalendar(false);
                        }}
                      >
                        <span className={`text-[16px] font-normal ${selectedType ? 'text-[#272C3C]' : 'text-[#BDBDBD]'}`} style={{ fontFamily: 'Pretendard' }}>
                          {selectedType || '타입 선택'}
                    </span>
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                      </div>
                      {showTypeDropdown && (
                        <div className="absolute top-[45px] left-0 z-50 bg-white rounded-[10px] shadow-lg border border-[#E7E7E7] w-[184px]">
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
              </div>

              {/* 배 선택 및 버튼 */}
              <div className="flex items-center justify-between self-stretch">
                <div className="flex items-start gap-[10px]">
                  <div className="flex items-center gap-[10px] px-[10px] py-[8px] w-[67px]">
                    <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                      배
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px] h-[37px]">
                    <select 
                      className="text-[#272C3C] font-pretendard text-[16px] font-normal leading-normal border-none outline-none bg-transparent flex-1 cursor-pointer"
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
                    <svg width="20" height="27" viewBox="0 0 20 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 11L10 17L15 11" stroke="#BDBDBD" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-[10px] px-[10px]">
                  <button 
                    className="flex items-center justify-center gap-[10px] px-[20px] py-[9px] rounded-[20px] border border-[#BDBDBD] bg-white"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    <span className="text-[16px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                      {loading ? '조회중...' : '검색하기'}
                    </span>
                  </button>
                  <button className="flex items-center justify-center gap-[10px] px-[20px] py-[9px] rounded-[20px] border border-[#BDBDBD] bg-white">
                    <span className="text-[16px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                      저장하기
                    </span>
                  </button>
                  <button className="flex items-center justify-center gap-[10px] px-[20px] py-[9px] rounded-[20px] border border-[#BDBDBD] bg-white">
                    <span className="text-[16px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                      삭제하기
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        <div className="flex flex-col items-start gap-[65px] pl-[42px]">
          <div className="flex flex-col items-start gap-[10px]">
            <div className="flex items-center justify-center gap-[10px] px-[60px] py-[40px]">
              <h2 className="text-[25px] font-bold text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                예약관리목록
              </h2>
            </div>

            <div className="flex flex-col items-start justify-center gap-[40px] self-stretch pl-[60px]">
              <div className="flex flex-col items-start w-[986px]">
                {/* 테이블 헤더 */}
                <div className="flex items-center self-stretch">
                  <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[66px] min-h-[48px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>
                      선택
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[96px] min-h-[48px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-normal text-center break-words" style={{ fontFamily: 'Pretendard' }}>
                      출항일
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[180px] min-h-[48px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-normal text-center break-words" style={{ fontFamily: 'Pretendard' }}>
                      예약자 정보
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[110px] min-h-[48px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-normal text-center break-words" style={{ fontFamily: 'Pretendard' }}>
                      배 정보
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[120px] min-h-[48px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-normal text-center break-words" style={{ fontFamily: 'Pretendard' }}>
                      총 금액
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[250px] min-h-[48px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-normal text-center break-words" style={{ fontFamily: 'Pretendard' }}>
                      예약자 메모
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[110px] min-h-[48px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-normal text-center break-words" style={{ fontFamily: 'Pretendard' }}>
                      예약상태
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[160px] min-h-[48px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-normal text-center break-words" style={{ fontFamily: 'Pretendard' }}>
                      입금정보
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] flex-1 min-h-[48px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>
                      쿠폰
                    </span>
                  </div>
                </div>

                {/* 테이블 데이터 */}
                {loading && reservations.length === 0 ? (
                  <div className="flex items-center justify-center w-full py-[40px]">
                    <span className="text-[16px] text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                      조회 중...
                    </span>
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="flex items-center justify-center w-full py-[40px]">
                    <span className="text-[16px] text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                      예약 정보가 없습니다.
                    </span>
                  </div>
                ) : (
                  reservations.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((row) => (
                  <div key={row.id} className="flex items-start self-stretch">
                    <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[66px] min-h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="cursor-pointer"
                        onClick={() => handleRowSelect(row.id)}
                      >
                        <rect x="4" y="4" width="16" height="16" rx="2" fill={selectedRows.has(row.id) ? '#1840B8' : 'white'} stroke="#1840B8" strokeWidth="2"/>
                        {selectedRows.has(row.id) && (
                          <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        )}
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[96px] min-h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-normal text-center break-words w-full" style={{ fontFamily: 'Pretendard' }}>
                        {row.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[180px] min-h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-normal text-center break-words w-full" style={{ fontFamily: 'Pretendard' }}>
                        {`${row.name}(${row.headCount}) ${row.phone}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[110px] min-h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-normal text-center break-words w-full" style={{ fontFamily: 'Pretendard' }}>
                        {row.boat}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[120px] min-h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-normal text-center break-words w-full" style={{ fontFamily: 'Pretendard' }}>
                        {row.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[250px] min-h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-normal text-center break-words w-full" style={{ fontFamily: 'Pretendard' }}>
                        {row.memo}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[110px] min-h-[48px] border-2 border-[#DFE7F4] bg-white relative">
                      <span 
                        className="text-[14px] font-normal whitespace-normal text-center break-words w-full cursor-pointer" 
                        style={{ fontFamily: 'Pretendard', color: row.statusColor }}
                        onClick={() => {
                          const reservationId = row.reservationPublicId || row.id;
                          if (clickedStatusRowId === reservationId) {
                            setClickedStatusRowId(null);
                          } else {
                            setClickedStatusRowId(reservationId);
                          }
                        }}
                      >
                        {row.status}
                      </span>
                      {clickedStatusRowId === (row.reservationPublicId || row.id) && (
                        <div className="absolute top-[48px] left-0 z-50 bg-white rounded-[10px] shadow-lg border border-[#E7E7E7] w-[120px]">
                          <div 
                            className="px-[15px] py-[10px] hover:bg-[#EEF4FF] cursor-pointer rounded-t-[10px]"
                            onClick={() => {
                              const reservationId = row.reservationPublicId || row.id;
                              handleStatusChange(reservationId, '예약접수');
                            }}
                          >
                            <p className="text-[#272C3C] font-pretendard text-[14px]">예약접수</p>
                          </div>
                          <div 
                            className="px-[15px] py-[10px] hover:bg-[#EEF4FF] cursor-pointer"
                            onClick={() => {
                              const reservationId = row.reservationPublicId || row.id;
                              handleStatusChange(reservationId, '입금완료');
                            }}
                          >
                            <p className="text-[#272C3C] font-pretendard text-[14px]">입금완료</p>
                          </div>
                          <div 
                            className="px-[15px] py-[10px] hover:bg-[#EEF4FF] cursor-pointer"
                            onClick={() => {
                              const reservationId = row.reservationPublicId || row.id;
                              handleStatusChange(reservationId, '취소접수');
                            }}
                          >
                            <p className="text-[#272C3C] font-pretendard text-[14px]">취소접수</p>
                          </div>
                          <div 
                            className="px-[15px] py-[10px] hover:bg-[#EEF4FF] cursor-pointer rounded-b-[10px]"
                            onClick={() => {
                              const reservationId = row.reservationPublicId || row.id;
                              handleStatusChange(reservationId, '취소완료');
                            }}
                          >
                            <p className="text-[#272C3C] font-pretendard text-[14px]">취소완료</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] w-[160px] min-h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-normal text-center break-words w-full" style={{ fontFamily: 'Pretendard' }}>
                        {row.payment}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[10px] py-[12px] flex-1 min-h-[48px] border-2 border-[#DFE7F4] bg-white">
                        <svg 
                          width="32" 
                          height="32" 
                          viewBox="0 0 52 50" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => {
                            // reservationPublicId 또는 id를 사용
                            const reservationId = row.reservationPublicId || row.id;
                            console.log('[ReservationManagement] 쿠폰 클릭 - row 데이터:', row);
                            console.log('[ReservationManagement] 쿠폰 클릭 - 사용할 ID:', reservationId);
                            
                            if (reservationId) {
                              handleCouponClick(reservationId, row.coupon);
                            } else {
                              console.error('[ReservationManagement] reservationPublicId와 id가 모두 없어 쿠폰을 발급할 수 없습니다.', row);
                              alert('예약 ID를 찾을 수 없어 쿠폰을 발급할 수 없습니다.');
                            }
                          }}
                        >
                        <rect x="1" y="1" width="50" height="48" fill="white"/>
                        <rect x="1" y="1" width="50" height="48" stroke="#DFE7F4" strokeWidth="2"/>
                        <circle cx="26" cy="25" r="8.5" fill={row.coupon ? '#2754DA' : '#D9D9D9'}/>
                      </svg>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>

            {/* 페이지네이션 */}
            {(() => {
              const totalPages = Math.ceil(reservations.length / itemsPerPage);
              if (reservations.length <= itemsPerPage || totalPages <= 0) return null;
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

      {/* 쿠폰 추가 팝업 */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-[40px] w-[400px]">
            <h2 className="text-[24px] font-bold mb-[20px] text-[#272C3C] text-center" style={{ fontFamily: 'Pretendard' }}>
              쿠폰을 추가하였습니다
            </h2>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}

export default ReservationManagement;
