import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../utils/api';

function Dashboard() {
  const [departureTime, setDepartureTime] = useState(null);
  const [isLoadingDeparture, setIsLoadingDeparture] = useState(true);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [showReservationList, setShowReservationList] = useState(false);
  const [reservationList, setReservationList] = useState([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  
  // 대시보드 데이터 상태 (API에서 불러온 데이터만 사용)
  const [dashboardData, setDashboardData] = useState({
    ship: null,
    reservation: null,
    todayNewReservations: null,
    todayDepositConfirmed: null,
    depositExpired: null, // 입금기한 만료
    depositExpiring24h: null, // 입금기한 24시간 이내
    yesterdayVisitors: null, // 어제의 일간 방문자 수
    yesterdayConversionRate: null, // 어제의 예약 전환율
    yesterdayRevenue: null, // 일간 매출 (어제)
    lastMonthRevenue: null // 월간 매출 (지난달)
  });

  // 페이지 로드 시 로컬 토큰 확인 및 제거
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // 로컬 토큰 감지 (400자 미만이거나 eyJ로 시작하지 않으면 로컬 토큰)
      const isLocal = token.length < 400 || !token.startsWith('eyJ');
      if (isLocal) {
        console.error('[Dashboard] ❌ 로컬 토큰이 감지되었습니다! 제거합니다.');
        console.error('[Dashboard] 로컬 토큰:', token.substring(0, 50), `(길이: ${token.length})`);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminType');
        console.warn('[Dashboard] ⚠️ 로컬 토큰을 제거했습니다. 로그인 페이지로 이동합니다.');
        window.location.href = '/login';
        return;
      }
    }
  }, []);

  // API에서 대시보드 데이터 불러오기
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingDashboard(true);
      try {
        // /admin/main API 호출
        const response = await apiGet('/admin/main');
        
        if (response.ok) {
          const result = await response.json();
          console.log('[Dashboard] /admin/main API 응답:', result);
          
          if (result.success && result.data) {
            const data = result.data;
            console.log('[Dashboard] API 데이터 구조:', {
              todaySchedule: data.todaySchedule,
              todayInfo: data.todayInfo,
              mainInfo: data.mainInfo,
              statistic: data.statistic
            });
            
            // API 응답 구조에 맞게 데이터 추출
            const todaySchedule = data.todaySchedule || {};
            const todayInfo = data.todayInfo || {};
            const mainInfo = data.mainInfo || {};
            const statistic = data.statistic || {};
            
            const ship = todaySchedule.ship;
            
            setDashboardData(prev => ({
              ...prev,
              // 배 정보 (todaySchedule.ship)
              ship: ship ? {
                fishType: ship.fishType || null,
                price: ship.price !== undefined ? ship.price : null,
                notification: ship.notification || null
              } : null,
              
              // 예약 현황 (todaySchedule.currentHeadCount / todaySchedule.ship.maxHeadCount)
              reservation: todaySchedule.currentHeadCount !== undefined || ship?.maxHeadCount !== undefined ? {
                currentHeadCount: todaySchedule.currentHeadCount !== undefined ? todaySchedule.currentHeadCount : 0,
                maxHeadCount: ship?.maxHeadCount !== undefined ? ship.maxHeadCount : 0
              } : null,
              
              // 오늘 신규 예약 건수 (todayInfo.newReserved)
              todayNewReservations: todayInfo.newReserved !== undefined ? todayInfo.newReserved : null,
              
              // 오늘 입금 확인된 건수 (todayInfo.newDeposited)
              todayDepositConfirmed: todayInfo.newDeposited !== undefined ? todayInfo.newDeposited : null,
              
              // 입금기한 만료 (mainInfo.depositExpired)
              depositExpired: mainInfo.depositExpired !== undefined ? mainInfo.depositExpired : null,
              
              // 입금기한 24시간 이내 (mainInfo.deposit24Hour)
              depositExpiring24h: mainInfo.deposit24Hour !== undefined ? mainInfo.deposit24Hour : null,
              
              // 어제의 일간 방문자 수 (statistic.dailyVisited)
              yesterdayVisitors: statistic.dailyVisited !== undefined ? statistic.dailyVisited : null,
              
              // 어제의 예약 전환율 (statistic.reservedRate)
              yesterdayConversionRate: statistic.reservedRate !== undefined ? statistic.reservedRate : null,
              
              // 일간 매출 (어제) (statistic.dailySales)
              yesterdayRevenue: statistic.dailySales !== undefined ? statistic.dailySales : null,
              
              // 월간 매출 (지난달) (statistic.monthlySales)
              lastMonthRevenue: statistic.monthlySales !== undefined ? statistic.monthlySales : null
            }));
          }
        } else {
          console.error('[Dashboard] /admin/main API 조회 실패:', response.status);
        }
      } catch (error) {
        console.error('[Dashboard] /admin/main API 조회 중 오류 발생:', error);
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, []);

  // API에서 출항 시각 불러오기
  useEffect(() => {
    const fetchDepartureTime = async () => {
      try {
        const response = await apiGet('/schedules/departure');
        
        if (!response.ok) {
          console.error('출항 시간 조회 실패:', response.status);
          setIsLoadingDeparture(false);
          return;
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.scheduleExist && result.data.dateTime) {
          // dateTime에서 시간 추출
          const dateTime = result.data.dateTime;
          let extractedHour = null;
          let extractedMinute = null;

          // ISO 8601 형식인 경우 (예: "2025-01-11T04:00:00")
          if (dateTime.includes('T')) {
            const timePart = dateTime.split('T')[1];
            const timeMatch = timePart.match(/(\d{2}):(\d{2})/);
            if (timeMatch) {
              extractedHour = timeMatch[1];
              extractedMinute = timeMatch[2];
            }
          } 
          // "HH:mm:ss" 형식인 경우 (예: "05:00:00")
          else if (dateTime.match(/^\d{2}:\d{2}:\d{2}$/)) {
            const [h, m] = dateTime.split(':');
            extractedHour = h;
            extractedMinute = m;
          }
          // "HH:mm" 형식인 경우
          else if (dateTime.match(/^\d{2}:\d{2}$/)) {
            const [h, m] = dateTime.split(':');
            extractedHour = h;
            extractedMinute = m;
          }

          if (extractedHour && extractedMinute) {
            // 24시간 형식을 12시간 형식으로 변환 (오전 시간만 표시)
            const hour24 = parseInt(extractedHour);
            if (hour24 >= 0 && hour24 <= 12) {
              setDepartureTime({
                hour: extractedHour.padStart(2, '0'),
                minute: extractedMinute.padStart(2, '0')
              });
              console.log('API에서 출항 시간 로드:', extractedHour, extractedMinute);
            } else {
              console.warn('출항 시간이 오전 시간 범위를 벗어남:', hour24);
            }
          } else {
            console.warn('출항 시간 형식을 파싱할 수 없음:', dateTime);
          }
        } else {
          console.log('출항 스케줄이 없거나 데이터가 없음');
        }
      } catch (error) {
        console.error('출항 시간 조회 중 오류 발생:', error);
      } finally {
        setIsLoadingDeparture(false);
      }
    };

    fetchDepartureTime();
  }, []);

  // 시간을 12시간 형식으로 포맷팅 (예: "04:00 AM")
  const formatTime = (hour, minute) => {
    const hour24 = parseInt(hour);
    const hour12 = hour24 === 0 ? 12 : (hour24 > 12 ? hour24 - 12 : hour24);
    const ampm = hour24 < 12 ? 'AM' : 'PM';
    return `${hour12.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };

  // 예약자 명단 확인하기 버튼 클릭 핸들러
  const handleShowReservationList = async () => {
    setIsLoadingReservations(true);
    setShowReservationList(true);
    
    try {
      // /schedules/departure API에서 오늘 날짜의 schedulePublicId 가져오기
      const departureResponse = await apiGet('/schedules/departure');
      
      if (!departureResponse.ok) {
        console.error('[Dashboard] 출항 스케줄 조회 실패:', departureResponse.status);
        alert('출항 스케줄 정보를 불러올 수 없습니다.');
        setIsLoadingReservations(false);
        return;
      }

      const departureResult = await departureResponse.json();
      console.log('[Dashboard] 출항 스케줄 API 응답:', departureResult);
      
      let schedulePublicId = null;
      
      if (departureResult.success && departureResult.data && departureResult.data.schedulePublicId) {
        schedulePublicId = departureResult.data.schedulePublicId;
      } else if (departureResult.data && departureResult.data.schedulePublicId) {
        schedulePublicId = departureResult.data.schedulePublicId;
      }
      
      if (!schedulePublicId) {
        console.warn('[Dashboard] schedulePublicId를 찾을 수 없습니다.');
        setReservationList([]);
        setIsLoadingReservations(false);
        return;
      }
      
      console.log('[Dashboard] schedulePublicId:', schedulePublicId);
      
      // /schedules/{schedulePublicId} API로 스케줄 상세 정보 및 예약 목록 조회
      const scheduleResponse = await apiGet(`/schedules/${schedulePublicId}`);
      
      if (scheduleResponse.ok) {
        const scheduleResult = await scheduleResponse.json();
        console.log('[Dashboard] 스케줄 상세 API 응답:', scheduleResult);
        
        let reservations = [];
        
        if (scheduleResult.success && scheduleResult.data) {
          const scheduleDetail = scheduleResult.data;
          
          // 예약 목록 추출
          if (scheduleDetail.reservations && Array.isArray(scheduleDetail.reservations)) {
            reservations = scheduleDetail.reservations.map((reservation, index) => {
              const reservationId = reservation.reservationPublicId || 
                                   reservation.reservation_public_id || 
                                   reservation.reservation_id || 
                                   reservation.id ||
                                   reservation.reservationId;
              const reservationIdStr = reservationId ? String(reservationId) : null;
              
              return {
                id: reservationIdStr || `reservation-${index}`,
                name: reservation.nickname || reservation.username || reservation.name || reservation.userName || `예약자${index + 1}`,
                headCount: reservation.headCount !== undefined ? reservation.headCount : (reservation.head_count !== undefined ? reservation.head_count : 0),
                status: reservation.process || 'RESERVE_COMPLETED',

              };
            });
          }
        }
        
        console.log('[Dashboard] 예약 목록:', reservations);
        setReservationList(reservations);
      } else {
        console.error('[Dashboard] 스케줄 상세 조회 실패:', scheduleResponse.status);
        const errorData = await scheduleResponse.json().catch(() => ({}));
        console.error('[Dashboard] 에러 응답:', errorData);
        alert('예약자 명단을 불러오는 중 오류가 발생했습니다.');
        setReservationList([]);
      }
    } catch (error) {
      console.error('[Dashboard] 예약자 명단 조회 중 오류 발생:', error);
      alert('예약자 명단을 불러오는 중 오류가 발생했습니다.');
      setReservationList([]);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-[26px] px-[42px] py-[26px]">
        {/* 타이틀 섹션 */}
        <div className="flex flex-col gap-[10px] w-full mx-auto">
          <div className="flex flex-col gap-[10px] px-[60px] py-[40px] rounded-[20px] bg-[#F7F8FC] title-section" style={{ boxShadow: '0 4px 4px 0 rgba(39, 84, 218, 0.2)' }}>
            <h1 className="text-[30px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
              대시보드
            </h1>
            <p className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard', lineHeight: '23px' }}>
              대시보드를 통해 주요 정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="w-full max-w-[1099px] rounded-[20px] bg-white mx-auto px-[42px] py-[40px]" style={{ boxShadow: '0 4px 10px 0 rgba(39, 84, 218, 0.2)' }}>
          
          {/* 오늘 정보 섹션 */}
          <div className="flex flex-col gap-[30px] mb-[50px]">
            <h2 className="text-[25px] font-bold text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
              오늘 정보
            </h2>
            <div className="flex gap-[20px]">
              {/* Card 1: 쭈갑 정보 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px]">
                <div className="flex flex-col gap-[15px]">
                  {isLoadingDashboard ? (
                    <div className="text-[#73757C] text-[18px]" style={{ fontFamily: 'Pretendard' }}>로딩중...</div>
                  ) : dashboardData.ship ? (
                    <>
                      <h3 className="text-[24px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                        {dashboardData.ship.fishType || '-'}
                      </h3>
                      <p className="text-[22px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                        {dashboardData.ship.price ? `${dashboardData.ship.price.toLocaleString()}원` : '-'}
                      </p>
                      <p className="text-[18px] font-normal text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                        {dashboardData.ship.notification || '-'}
                      </p>
                    </>
                  ) : (
                    <div className="text-[#73757C] text-[18px]" style={{ fontFamily: 'Pretendard' }}>데이터 없음</div>
                  )}
                </div>
              </div>

              {/* Card 2: 예약 현황 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px] flex flex-col justify-between">
                <div className="flex flex-col gap-[15px]">
                  {isLoadingDashboard ? (
                    <p className="text-[22px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>로딩중...</p>
                  ) : dashboardData.reservation ? (
                    <p className="text-[22px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                      {dashboardData.reservation.currentHeadCount}명 / {dashboardData.reservation.maxHeadCount}명
                    </p>
                  ) : (
                    <p className="text-[22px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>데이터 없음</p>
                  )}
                </div>
                <button 
                  onClick={handleShowReservationList}
                  className="w-full py-[12px] px-[20px] rounded-[10px] bg-[#2754DA] text-white text-[18px] font-medium hover:opacity-90" 
                  style={{ fontFamily: 'Pretendard' }}
                >
                  예약자 명단 확인하기
                </button>
              </div>

              {/* Card 3: 출항확정 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px] flex flex-col items-center justify-center gap-[15px]">
                {isLoadingDeparture ? (
                  <div className="text-[#172348] text-[32px] font-bold" style={{ fontFamily: 'Pretendard' }}>
                    로딩중...
                  </div>
                ) : departureTime ? (
                  <>
                    <div className="text-[#172348] text-[45px] font-bold" style={{ fontFamily: 'Pretendard' }}>
                      {formatTime(departureTime.hour, departureTime.minute)}
                    </div>
                    <div className="text-[#2754DA] text-[20px] font-medium" style={{ fontFamily: 'Pretendard' }}>
                      출항확정
                    </div>
                  </>
                ) : (
                  <div className="text-[#73757C] text-[18px]" style={{ fontFamily: 'Pretendard' }}>
                    출항 시간 없음
                  </div>
                )}
              </div>

              {/* Card 4: 오늘 신규 예약 및 입금 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px] flex flex-col gap-[20px]">
                <div className="flex flex-col gap-[10px]">
                  <p className="text-[18px] font-normal text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                    오늘 신규 예약한
                  </p>
                  <p className="text-[32px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    {isLoadingDashboard ? '로딩중...' : (dashboardData.todayNewReservations !== null ? `${dashboardData.todayNewReservations} 건` : '-')}
                  </p>
                </div>
                <div className="flex flex-col gap-[10px]">
                  <p className="text-[18px] font-normal text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                    오늘 입금 확인된
                  </p>
                  <p className="text-[32px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    {isLoadingDashboard ? '로딩중...' : (dashboardData.todayDepositConfirmed !== null ? `${dashboardData.todayDepositConfirmed}건` : '-')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 주요 알림 섹션 */}
          <div className="flex flex-col gap-[30px] mb-[50px]">
            <h2 className="text-[25px] font-bold text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
              주요 알림
            </h2>
            <div className="flex gap-[20px]">
              {/* Card 1: 입금기한 만료 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px]">
                <div className="flex flex-col gap-[15px]">
                  <h3 className="text-[22px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    입금기한 만료
                  </h3>
                  <p className="text-[45px] font-bold text-[#172348]" style={{ fontFamily: 'Pretendard' }}>
                    {isLoadingDashboard ? '로딩중...' : (dashboardData.depositExpired !== null ? `${dashboardData.depositExpired}명` : '-')}
                  </p>
                </div>
              </div>

              {/* Card 2: 입금기한 24시간 이내 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px]">
                <div className="flex flex-col gap-[15px]">
                  <h3 className="text-[22px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    입금기한 24시간 이내
                  </h3>
                  <p className="text-[45px] font-bold text-[#172348]" style={{ fontFamily: 'Pretendard' }}>
                    {isLoadingDashboard ? '로딩중...' : (dashboardData.depositExpiring24h !== null ? `${dashboardData.depositExpiring24h}명` : '-')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 통계 및 분석 섹션 */}
          <div className="flex flex-col gap-[30px]">
            <h2 className="text-[25px] font-bold text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
              통계 및 분석
            </h2>
            <div className="flex gap-[20px]">
              {/* Card 1: 어제의 일간 방문자 수 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px]">
                <div className="flex flex-col gap-[15px]">
                  <h3 className="text-[22px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    어제의 일간 방문자 수
                  </h3>
                  <p className="text-[45px] font-bold text-[#172348]" style={{ fontFamily: 'Pretendard' }}>
                    {isLoadingDashboard ? '로딩중...' : (dashboardData.yesterdayVisitors !== null ? `${dashboardData.yesterdayVisitors}명` : '-')}
                  </p>
                </div>
              </div>

              {/* Card 2: 어제의 예약 전환율 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px]">
                <div className="flex flex-col gap-[15px]">
                  <h3 className="text-[22px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    어제의 예약 전환율
                  </h3>
                  <p className="text-[14px] font-normal text-[#73757C] mb-[5px]" style={{ fontFamily: 'Pretendard' }}>
                    (예약건수 / 방문자 수 * 100)
                  </p>
                  <p className="text-[45px] font-bold text-[#172348]" style={{ fontFamily: 'Pretendard' }}>
                    {isLoadingDashboard ? '로딩중...' : (dashboardData.yesterdayConversionRate !== null ? `${dashboardData.yesterdayConversionRate}%` : '-')}
                  </p>
                </div>
              </div>

              {/* Card 3: 매출 통계 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px]">
                <div className="flex flex-col gap-[20px]">
                  <div className="flex flex-col gap-[10px]">
                    <h3 className="text-[22px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                      일간 (어제)
                    </h3>
                    <p className="text-[32px] font-bold text-[#172348]" style={{ fontFamily: 'Pretendard' }}>
                      {isLoadingDashboard ? '로딩중...' : (dashboardData.yesterdayRevenue !== null ? `${typeof dashboardData.yesterdayRevenue === 'number' ? dashboardData.yesterdayRevenue.toLocaleString() : dashboardData.yesterdayRevenue}원` : '-')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <h3 className="text-[22px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                      월간 (지난달)
                    </h3>
                    <p className="text-[32px] font-bold text-[#172348]" style={{ fontFamily: 'Pretendard' }}>
                      {isLoadingDashboard ? '로딩중...' : (dashboardData.lastMonthRevenue !== null ? `${typeof dashboardData.lastMonthRevenue === 'number' ? dashboardData.lastMonthRevenue.toLocaleString() : dashboardData.lastMonthRevenue}원` : '-')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 예약자 명단 모달 */}
      {showReservationList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-[20px] p-[40px] w-[800px] max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-[20px]">
              <h2 className="text-[#272C3C] font-pretendard text-[28px] font-bold">
                예약자 명단
              </h2>
              <button 
                onClick={() => setShowReservationList(false)}
                className="text-[#272C3C] text-[24px] font-bold hover:text-[#2754DA]"
              >
                ×
              </button>
            </div>

            {/* 예약자 리스트 */}
            {isLoadingReservations ? (
              <div className="flex items-center justify-center py-[50px]">
                <span className="text-[18px] text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                  로딩중...
                </span>
              </div>
            ) : reservationList.length === 0 ? (
              <div className="flex items-center justify-center py-[50px]">
                <span className="text-[18px] text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                  예약자가 없습니다.
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                    {reservationList.map((reservation) => {
                      const getStatusText = (process) => {
                        const statusMap = {
                          'RESERVE_COMPLETED': '예약접수',
                          'DEPOSIT_COMPLETED': '입금확인',
                          'CANCEL_REQUESTED': '취소접수',
                          'CANCEL_COMPLETED': '취소완료'
                        };
                        return statusMap[process] || process || '예약접수';
                      };

                      const getStatusColor = (process) => {
                        if (process === 'RESERVE_COMPLETED') return 'text-[#FFA500]';
                        if (process === 'DEPOSIT_COMPLETED') return 'text-[#272C3C]';
                        if (process === 'CANCEL_REQUESTED' || process === 'CANCEL_COMPLETED') return 'text-[#ED2626]';
                        return 'text-[#272C3C]';
                      };

                      return (
                        <tr key={reservation.id} className="border-b border-[#E7E7E7]">
                          <td className="py-[15px] px-[10px] text-left text-[#272C3C] font-pretendard text-[16px]">
                            {reservation.name}
                          </td>
                          <td className="py-[15px] px-[10px] text-center text-[#272C3C] font-pretendard text-[16px]">
                            {reservation.headCount !== undefined && reservation.headCount !== null ? `${reservation.headCount}명` : '0명'}
                          </td>
                          <td className="py-[15px] px-[10px] text-center">
                            <span className={`font-pretendard text-[16px] ${getStatusColor(reservation.status)}`}>
                              {getStatusText(reservation.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 닫기 버튼 */}
            <div className="flex justify-center mt-[30px]">
              <button 
                onClick={() => setShowReservationList(false)}
                className="px-[40px] py-[12px] bg-[#EEF4FF] text-[#2754DA] rounded-[10px] font-medium hover:bg-[#DFE7F4]"
                style={{ fontFamily: 'Pretendard' }}
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

export default Dashboard;
