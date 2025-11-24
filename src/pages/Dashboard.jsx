import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../utils/api';

function Dashboard() {
  const [departureTime, setDepartureTime] = useState({ hour: '04', minute: '00' });
  const [isLoading, setIsLoading] = useState(true);

  // API에서 출항 시각 불러오기
  useEffect(() => {
    const fetchDepartureTime = async () => {
      try {
        const response = await apiGet('/schedules/departure');
        
        if (!response.ok) {
          console.error('출항 시간 조회 실패:', response.status);
          setIsLoading(false);
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
        setIsLoading(false);
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
                  <h3 className="text-[24px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    쭈갑
                  </h3>
                  <p className="text-[22px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    90,000원
                  </p>
                  <p className="text-[18px] font-normal text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                    쭈꾸미 위주의 낚시
                  </p>
                </div>
              </div>

              {/* Card 2: 예약 현황 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px] flex flex-col justify-between">
                <div className="flex flex-col gap-[15px]">
                  <p className="text-[22px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    16명 / 18명
                  </p>
                </div>
                <button className="w-full py-[12px] px-[20px] rounded-[10px] bg-[#2754DA] text-white text-[18px] font-medium hover:opacity-90" style={{ fontFamily: 'Pretendard' }}>
                  예약자 명단 확인하기
                </button>
              </div>

              {/* Card 3: 출항확정 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px] flex flex-col items-center justify-center gap-[15px]">
                {isLoading ? (
                  <div className="text-[#172348] text-[32px] font-bold" style={{ fontFamily: 'Pretendard' }}>
                    로딩중...
                  </div>
                ) : (
                  <>
                    <div className="text-[#172348] text-[45px] font-bold" style={{ fontFamily: 'Pretendard' }}>
                      {formatTime(departureTime.hour, departureTime.minute)}
                    </div>
                    <div className="text-[#2754DA] text-[20px] font-medium" style={{ fontFamily: 'Pretendard' }}>
                      출항확정
                    </div>
                  </>
                )}
              </div>

              {/* Card 4: 오늘 신규 예약 및 입금 */}
              <div className="flex-1 rounded-[20px] bg-[#EEF4FF] p-[30px] flex flex-col gap-[20px]">
                <div className="flex flex-col gap-[10px]">
                  <p className="text-[18px] font-normal text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                    오늘 신규 예약한
                  </p>
                  <p className="text-[32px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    18 건
                  </p>
                </div>
                <div className="flex flex-col gap-[10px]">
                  <p className="text-[18px] font-normal text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>
                    오늘 입금 확인된
                  </p>
                  <p className="text-[32px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    18건
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
                    16명
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
                    10명
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
                    15명
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
                    68%
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
                      123,456원
                    </p>
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <h3 className="text-[22px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                      월간 (지난달)
                    </h3>
                    <p className="text-[32px] font-bold text-[#172348]" style={{ fontFamily: 'Pretendard' }}>
                      123,456,789원
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
