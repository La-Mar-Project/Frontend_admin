import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../utils/api';

function Home() {
  const [hour, setHour] = useState('04');
  const [minute, setMinute] = useState('00');
  const [schedulePublicId, setSchedulePublicId] = useState(null);
  const [smsTemplates, setSmsTemplates] = useState({
    pending: [
      { id: 1, title: '출항보류 1', content: '안녕하세요, 라마르호입니다. 내일은 기상악화 예보가 있어서 오늘 오후 2~3시까지 대기 후 기상예보가 갱신되면 출항여부를 안내드리겠습니다.', selected: true },
      { id: 2, title: '출항보류 2', content: '안녕하세요, 라마르호입니다. 내일은 기상악화 예보가 있어서 오늘 오후 2~3시까지 대기 후 기상예보가 갱신되면 출항여부를 안내드리겠습니다. 혹시 멀미나 건강이 좋지 않은 분들은 오늘 오전11시까지 취소 신청해주시면 환불해드리겠습니다. 감사합니다.', selected: false }
    ],
    cancel: [
      { id: 1, title: '출항취소 1', content: '안녕하세요, 라마르호입니다. 내일은 아쉽게도 기상악화로 인해 출항이 취소되었습니다. 환불계좌를 회신해주세요. 다음에 더 좋은날 뵙겠습니다.', selected: true }
    ],
    confirm: [
      { id: 1, title: '출항확정 1', content: '안녕하세요! 내일은 기상예보가 갱신되어 좋아졌기에 출항을 확정합니다. 출항시간은 6시10분입니다. 승선명부를 회신해주세요.', selected: true }
    ]
  });
  const [showNewSMSModal, setShowNewSMSModal] = useState(false);
  const [newSMSTitle, setNewSMSTitle] = useState('');
  const [newSMSContent, setNewSMSContent] = useState('');
  const [newSMSCategory, setNewSMSCategory] = useState('pending');
  const messagesContainerRef = useRef(null);
  const [messagesContainerHeight, setMessagesContainerHeight] = useState(0);

  // 현재 날짜와 다음 날짜 계산
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const formatDateForTitle = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${month}월 ${day}일(${weekday})`;
  };


  // API에서 출항 시각 불러오기
  useEffect(() => {
    const fetchDepartureTime = async () => {
      try {
        const response = await apiGet('/schedules/departure');
        
        if (!response.ok) {
          console.error('출항 시간 조회 실패:', response.status);
          return;
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.scheduleExist && result.data.dateTime) {
          // schedulePublicId 저장
          if (result.data.schedulePublicId) {
            setSchedulePublicId(result.data.schedulePublicId);
          }
          
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
              setHour(extractedHour.padStart(2, '0'));
              setMinute(extractedMinute.padStart(2, '0'));
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
      }
    };

    fetchDepartureTime();
  }, []);

  const handleHourChange = (e) => {
    const value = e.target.value;
    // 숫자만 입력 허용
    if (value === '' || /^\d+$/.test(value)) {
      const num = parseInt(value) || 0;
      if (num >= 0 && num <= 12) {
        setHour(value === '' ? '' : value);
      }
    }
  };

  const handleMinuteChange = (e) => {
    const value = e.target.value;
    // 숫자만 입력 허용
    if (value === '' || /^\d+$/.test(value)) {
      const num = parseInt(value) || 0;
      if (num >= 0 && num <= 59) {
        setMinute(value === '' ? '' : value);
      }
    }
  };

  const handleSaveDepartureTime = () => {
    if (!hour || !minute) {
      alert('시간과 분을 모두 입력해주세요.');
      return;
    }
    
    // state 업데이트 (2자리 형식으로)
    const formattedHour = hour.padStart(2, '0');
    const formattedMinute = minute.padStart(2, '0');
    setHour(formattedHour);
    setMinute(formattedMinute);
    alert(`출항시각이 저장되었습니다: 오전 ${formattedHour}시 ${formattedMinute}분`);
  };

  // 중복 선택 가능하도록 수정
  const handleToggleSMS = (category, id) => {
    setSmsTemplates(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    }));
  };

  // 메시지 컨테이너 높이 계산
  useEffect(() => {
    const updateHeight = () => {
      if (messagesContainerRef.current) {
        const height = messagesContainerRef.current.offsetHeight;
        setMessagesContainerHeight(height);
      }
    };
    
    // DOM 업데이트 후 높이 계산
    setTimeout(updateHeight, 0);
    
    // ResizeObserver로 동적 높이 변경 감지
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    
    if (messagesContainerRef.current) {
      resizeObserver.observe(messagesContainerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [smsTemplates]);

  const handleSaveNewSMS = () => {
    if (!newSMSTitle || !newSMSContent) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const newSMS = {
      id: smsTemplates[newSMSCategory].length + 1,
      title: newSMSTitle,
      content: newSMSContent,
      selected: false
    };

    setSmsTemplates(prev => ({
      ...prev,
      [newSMSCategory]: [...prev[newSMSCategory], newSMS]
    }));

    setNewSMSTitle('');
    setNewSMSContent('');
    setShowNewSMSModal(false);
    alert('새 SMS가 저장되었습니다.');
  };

  // 출항 여부 보류 API 호출
  const handlePendingDeparture = async () => {
    console.log('[Home] 출항 보류 버튼 클릭');
    console.log('[Home] schedulePublicId:', schedulePublicId);
    
    if (!schedulePublicId) {
      console.warn('[Home] schedulePublicId가 없습니다.');
      alert('출항 스케줄 정보가 없습니다.');
      return;
    }

    const selectedMessages = smsTemplates.pending.filter(sms => sms.selected);
    console.log('[Home] 선택된 출항 보류 메시지 개수:', selectedMessages.length);
    console.log('[Home] 선택된 출항 보류 메시지:', selectedMessages);
    
    if (selectedMessages.length === 0) {
      console.warn('[Home] 체크된 메시지가 없습니다.');
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
        
        console.log('[Home] 출항 보류 API 요청 시작');
        console.log('[Home] API URL:', apiUrl);
        console.log('[Home] 요청 본문:', requestBody);
        
        const response = await apiPost(apiUrl, requestBody);
        
        console.log('[Home] 출항 보류 API 응답:', response);
        console.log('[Home] 응답 상태:', response.status, response.statusText);
        console.log('[Home] 응답 OK:', response.ok);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[Home] 출항 보류 API 오류 응답:', errorData);
          throw new Error(errorData.message || '출항 연기 요청 실패');
        }
        
        const responseData = await response.json().catch(() => ({}));
        console.log('[Home] 출항 보류 API 성공 응답:', responseData);
      }

      console.log('[Home] 출항 보류 메시지 전송 완료:', selectedMessages.length, '개');
      alert(`${selectedMessages.length}개의 출항 연기 메시지가 전송되었습니다.`);
    } catch (error) {
      console.error('[Home] 출항 연기 요청 실패:', error);
      console.error('[Home] 에러 상세:', error.message, error.stack);
      alert(`출항 연기 요청 실패: ${error.message}`);
    }
  };

  // 출항 취소 결정 API 호출
  const handleCancelDeparture = async () => {
    console.log('[Home] 출항 취소 버튼 클릭');
    console.log('[Home] schedulePublicId:', schedulePublicId);
    
    if (!schedulePublicId) {
      console.warn('[Home] schedulePublicId가 없습니다.');
      alert('출항 스케줄 정보가 없습니다.');
      return;
    }

    const selectedMessages = smsTemplates.cancel.filter(sms => sms.selected);
    console.log('[Home] 선택된 출항 취소 메시지 개수:', selectedMessages.length);
    console.log('[Home] 선택된 출항 취소 메시지:', selectedMessages);
    
    if (selectedMessages.length === 0) {
      console.warn('[Home] 체크된 메시지가 없습니다.');
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
        
        console.log('[Home] 출항 취소 API 요청 시작');
        console.log('[Home] API URL:', apiUrl);
        console.log('[Home] 요청 본문:', requestBody);
        
        const response = await apiPost(apiUrl, requestBody);
        
        console.log('[Home] 출항 취소 API 응답:', response);
        console.log('[Home] 응답 상태:', response.status, response.statusText);
        console.log('[Home] 응답 OK:', response.ok);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[Home] 출항 취소 API 오류 응답:', errorData);
          throw new Error(errorData.message || '출항 취소 요청 실패');
        }
        
        const responseData = await response.json().catch(() => ({}));
        console.log('[Home] 출항 취소 API 성공 응답:', responseData);
      }

      console.log('[Home] 출항 취소 메시지 전송 완료:', selectedMessages.length, '개');
      alert(`${selectedMessages.length}개의 출항 취소 메시지가 전송되었습니다.`);
    } catch (error) {
      console.error('[Home] 출항 취소 요청 실패:', error);
      console.error('[Home] 에러 상세:', error.message, error.stack);
      alert(`출항 취소 요청 실패: ${error.message}`);
    }
  };

  // 출항 확정 결정 API 호출
  const handleConfirmDeparture = async () => {
    console.log('[Home] 출항 확정 버튼 클릭');
    console.log('[Home] schedulePublicId:', schedulePublicId);
    
    if (!schedulePublicId) {
      console.warn('[Home] schedulePublicId가 없습니다.');
      alert('출항 스케줄 정보가 없습니다.');
      return;
    }

    const selectedMessages = smsTemplates.confirm.filter(sms => sms.selected);
    console.log('[Home] 선택된 출항 확정 메시지 개수:', selectedMessages.length);
    console.log('[Home] 선택된 출항 확정 메시지:', selectedMessages);
    
    if (selectedMessages.length === 0) {
      console.warn('[Home] 체크된 메시지가 없습니다.');
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
        
        console.log('[Home] 출항 확정 API 요청 시작');
        console.log('[Home] API URL:', apiUrl);
        console.log('[Home] 요청 본문:', requestBody);
        
        const response = await apiPost(apiUrl, requestBody);
        
        console.log('[Home] 출항 확정 API 응답:', response);
        console.log('[Home] 응답 상태:', response.status, response.statusText);
        console.log('[Home] 응답 OK:', response.ok);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[Home] 출항 확정 API 오류 응답:', errorData);
          throw new Error(errorData.message || '출항 확정 요청 실패');
        }
        
        const responseData = await response.json().catch(() => ({}));
        console.log('[Home] 출항 확정 API 성공 응답:', responseData);
      }

      console.log('[Home] 출항 확정 메시지 전송 완료:', selectedMessages.length, '개');
      alert(`${selectedMessages.length}개의 출항 확정 메시지가 전송되었습니다.`);
    } catch (error) {
      console.error('[Home] 출항 확정 요청 실패:', error);
      console.error('[Home] 에러 상세:', error.message, error.stack);
      alert(`출항 확정 요청 실패: ${error.message}`);
    }
  };

  const minContainerHeight = 312 + messagesContainerHeight + 40 + 67 + 40; // 카드 top + 메시지 높이 + 간격 + 버튼 높이 + 여유 공간

  return (
    <Layout>
      <div className="bg-white mx-auto overflow-hidden rounded-[20px] shadow-[0px_4px_20px_0px_rgba(22,40,138,0.2)] w-full max-w-[1098px] my-[26px]" style={{ minHeight: `${Math.max(1216, minContainerHeight)}px` }}>
        {/* 10월 9일 출항시각 */}
        <p className="font-semibold leading-[28px] px-[56px] pt-[60px] text-[#1840b8] text-[30px]">
          {formatDateForTitle(today)}의 출항시각
        </p>
        
        {/* 시간 입력 영역 */}
        <div className="bg-[#fdfdfd] box-border flex gap-[30px] items-center mx-[66px] px-[63px] py-[30px] rounded-[20px] mt-[50px]">
          <p className="font-semibold leading-[28px] text-[35px] text-[#272c3c] whitespace-nowrap">
            오전
          </p>
          <div className="flex items-center gap-[10px]">
            <input
              type="text"
              value={hour}
              onChange={handleHourChange}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setHour('04');
                } else {
                  const num = parseInt(e.target.value);
                  if (num < 0) setHour('00');
                  else if (num > 12) setHour('12');
                  else setHour(num.toString().padStart(2, '0'));
                }
              }}
              className="bg-[#dfebff] box-border flex gap-[10px] items-center justify-center p-[20px] rounded-[20px] font-semibold leading-[28px] text-[45px] text-[#272c3c] text-center w-[100px] border-none outline-none focus:ring-2 focus:ring-[#2754da]"
              maxLength={2}
            />
            <p className="font-semibold leading-[28px] text-[30px] text-[#272c3c] whitespace-nowrap">
              시
            </p>
          </div>
          <div className="flex items-center gap-[10px]">
            <input
              type="text"
              value={minute}
              onChange={handleMinuteChange}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setMinute('00');
                } else {
                  const num = parseInt(e.target.value);
                  if (num < 0) setMinute('00');
                  else if (num > 59) setMinute('59');
                  else setMinute(num.toString().padStart(2, '0'));
                }
              }}
              className="bg-[#dfebff] box-border flex gap-[10px] items-center justify-center p-[20px] rounded-[20px] font-semibold leading-[28px] text-[45px] text-[#272c3c] text-center w-[100px] border-none outline-none focus:ring-2 focus:ring-[#2754da]"
              maxLength={2}
            />
            <p className="font-semibold leading-[28px] text-[30px] text-[#272c3c] whitespace-nowrap">
              분
            </p>
          </div>
          <button
            onClick={handleSaveDepartureTime}
            className="bg-[#dfebff] box-border flex gap-[6px] items-center justify-center px-[25px] py-[20px] rounded-[20px] shadow-[0px_4px_4px_0px_rgba(23,40,139,0.2)] cursor-pointer hover:opacity-80 ml-auto"
          >
            <p className="font-medium leading-normal text-[20px] text-[#272c3c]">
              출항시각 저장하기
            </p>
          </button>
        </div>

        {/* 10월 10일 출항여부 */}
        <p className="font-semibold leading-[28px] px-[56px] mt-[152px] text-[#1840b8] text-[30px]">
          {formatDateForTitle(tomorrow)}의 출항여부
        </p>

        {/* SMS 템플릿 카드들 - 세 개 모두 동시에 표시 */}
        <div ref={messagesContainerRef} className="inline-flex gap-[15px] items-start mx-auto mt-[202px] flex-nowrap justify-center">
          {/* 출항 여부 보류 카드 */}
          <div className="flex p-[20px] flex-col items-center gap-[22px] rounded-[20px] border-2 border-solid border-[#dfe7f4] bg-white w-[271px]">
            {/* 제목 버튼 */}
            <div 
              onClick={handlePendingDeparture}
              className="flex px-[50px] py-[30px] justify-center items-center gap-[6px] self-stretch rounded-[30px] bg-[#dfebff] shadow-[0px_4px_4px_0px_rgba(24,64,184,0.2)] cursor-pointer hover:opacity-80" 
              style={{ fontFamily: 'Pretendard' }}
            >
              <p className="text-[#272c3c] text-[30px] font-medium leading-normal whitespace-nowrap" style={{ fontFamily: 'Pretendard' }}>
                출항 여부 보류
              </p>
            </div>
            {/* 메시지 박스들 */}
            <div className="flex flex-col gap-[20px] w-full items-start">
              {smsTemplates.pending.map((sms) => (
                <div key={sms.id} className="flex flex-col items-start rounded-[20px] w-full" style={{ boxShadow: '0px 4px 4px 0px rgba(23, 40, 139, 0.2)' }}>
                  <div className="flex px-[20px] py-[14px] pl-[24px] justify-between items-center self-stretch rounded-tl-[20px] rounded-tr-[20px] bg-[#dfebff]" style={{ paddingTop: '14px', paddingBottom: '10px' }}>
                    <p className="text-[#272c3c] text-[20px] font-medium leading-[28px]" style={{ fontFamily: 'Pretendard' }}>
                      {sms.title}
                    </p>
                    <div 
                      className="w-[26px] h-[26px] cursor-pointer flex-shrink-0"
                      onClick={() => handleToggleSMS('pending', sms.id)}
                    >
                      {sms.selected ? (
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="13" cy="13" r="13" fill="#2754da"/>
                          <path d="M8 13L11 16L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="13" cy="13" r="12" stroke="#D1D5DB" strokeWidth="2"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-bl-[20px] rounded-br-[20px] w-full p-[10px]">
                    <p className="text-black text-[18px] font-normal leading-[24px] text-justify w-full whitespace-pre-wrap break-words" style={{ fontFamily: 'Pretendard' }}>
                      {sms.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 출항 취소 결정 카드 */}
          <div className="flex p-[20px] flex-col items-center gap-[22px] rounded-[20px] border-2 border-solid border-[#dfe7f4] bg-white w-[271px]">
            {/* 제목 버튼 */}
            <div 
              onClick={handleCancelDeparture}
              className="flex px-[50px] py-[30px] justify-center items-center gap-[6px] self-stretch rounded-[30px] bg-[#dfebff] shadow-[0px_4px_4px_0px_rgba(24,64,184,0.2)] cursor-pointer hover:opacity-80" 
              style={{ fontFamily: 'Pretendard' }}
            >
              <p className="text-[#272c3c] text-[30px] font-medium leading-normal whitespace-nowrap" style={{ fontFamily: 'Pretendard' }}>
                출항 취소 결정
              </p>
            </div>
            {/* 메시지 박스들 */}
            <div className="flex flex-col gap-[20px] w-full items-start">
              {smsTemplates.cancel.map((sms) => (
                <div key={sms.id} className="flex flex-col items-start rounded-[20px] w-full" style={{ boxShadow: '0px 4px 4px 0px rgba(23, 40, 139, 0.2)' }}>
                  <div className="flex px-[20px] py-[14px] pl-[24px] justify-between items-center self-stretch rounded-tl-[20px] rounded-tr-[20px] bg-[#dfebff]" style={{ paddingTop: '14px', paddingBottom: '10px' }}>
                    <p className="text-[#272c3c] text-[20px] font-medium leading-[28px]" style={{ fontFamily: 'Pretendard' }}>
                      {sms.title}
                    </p>
                    <div 
                      className="w-[26px] h-[26px] cursor-pointer flex-shrink-0"
                      onClick={() => handleToggleSMS('cancel', sms.id)}
                    >
                      {sms.selected ? (
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="13" cy="13" r="13" fill="#2754da"/>
                          <path d="M8 13L11 16L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="13" cy="13" r="12" stroke="#D1D5DB" strokeWidth="2"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-bl-[20px] rounded-br-[20px] w-full p-[10px]">
                    <p className="text-black text-[18px] font-normal leading-[24px] text-justify w-full whitespace-pre-wrap break-words" style={{ fontFamily: 'Pretendard' }}>
                      {sms.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 출항 확정 결정 카드 */}
          <div className="flex p-[20px] flex-col items-center gap-[22px] rounded-[20px] border-2 border-solid border-[#dfe7f4] bg-white w-[271px]">
            {/* 제목 버튼 */}
            <div 
              onClick={handleConfirmDeparture}
              className="flex px-[50px] py-[30px] justify-center items-center gap-[6px] self-stretch rounded-[30px] bg-[#dfebff] shadow-[0px_4px_4px_0px_rgba(24,64,184,0.2)] cursor-pointer hover:opacity-80" 
              style={{ fontFamily: 'Pretendard' }}
            >
              <p className="text-[#272c3c] text-[30px] font-medium leading-normal whitespace-nowrap" style={{ fontFamily: 'Pretendard' }}>
                출항 확정 결정
              </p>
            </div>
            {/* 메시지 박스들 */}
            <div className="flex flex-col gap-[20px] w-full items-start">
              {smsTemplates.confirm.map((sms) => (
                <div key={sms.id} className="flex flex-col items-start rounded-[20px] w-full" style={{ boxShadow: '0px 4px 4px 0px rgba(23, 40, 139, 0.2)' }}>
                  <div className="flex px-[20px] py-[14px] pl-[24px] justify-between items-center self-stretch rounded-tl-[20px] rounded-tr-[20px] bg-[#dfebff]" style={{ paddingTop: '14px', paddingBottom: '10px' }}>
                    <p className="text-[#272c3c] text-[20px] font-medium leading-[28px]" style={{ fontFamily: 'Pretendard' }}>
                      {sms.title}
                    </p>
                    <div 
                      className="w-[26px] h-[26px] cursor-pointer flex-shrink-0"
                      onClick={() => handleToggleSMS('confirm', sms.id)}
                    >
                      {sms.selected ? (
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="13" cy="13" r="13" fill="#2754da"/>
                          <path d="M8 13L11 16L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="13" cy="13" r="12" stroke="#D1D5DB" strokeWidth="2"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-bl-[20px] rounded-br-[20px] w-full p-[10px]">
                    <p className="text-black text-[18px] font-normal leading-[24px] text-justify w-full whitespace-pre-wrap break-words" style={{ fontFamily: 'Pretendard' }}>
                      {sms.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 새 SMS 작성하기 버튼 - 가장 긴 섹션 아래에 일정한 간격으로 배치 */}
        <div className="flex justify-center mt-[40px] mb-[40px]">
          <button
            onClick={() => setShowNewSMSModal(true)}
            className="flex flex-col w-[424px] h-[67px] px-[10px] py-[8px] justify-center items-center gap-[3px] rounded-[10px] bg-[#2754da] cursor-pointer hover:opacity-90"
          >
            <p className="font-bold leading-normal text-[#fdfdfd] text-[20px]">
              새 SMS 작성하기
            </p>
          </button>
        </div>
      </div>

      {/* 새 SMS 작성 모달 */}
      {showNewSMSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-[40px] w-[600px]">
            <h2 className="text-[24px] font-bold mb-[20px]">새 SMS 작성</h2>
            <div className="mb-[20px]">
              <label className="block mb-[10px] font-medium">카테고리</label>
              <select
                value={newSMSCategory}
                onChange={(e) => setNewSMSCategory(e.target.value)}
                className="w-full p-[10px] border rounded-[10px]"
              >
                <option value="pending">출항 여부 보류</option>
                <option value="cancel">출항 취소 결정</option>
                <option value="confirm">출항 확정 결정</option>
              </select>
            </div>
            <div className="mb-[20px]">
              <label className="block mb-[10px] font-medium">제목</label>
              <input
                type="text"
                value={newSMSTitle}
                onChange={(e) => setNewSMSTitle(e.target.value)}
                className="w-full p-[10px] border rounded-[10px]"
                placeholder="예: 출항보류 3"
              />
            </div>
            <div className="mb-[20px]">
              <label className="block mb-[10px] font-medium">내용</label>
              <textarea
                value={newSMSContent}
                onChange={(e) => setNewSMSContent(e.target.value)}
                className="w-full p-[10px] border rounded-[10px] h-[200px]"
                placeholder="SMS 내용을 입력하세요"
              />
            </div>
            <div className="flex gap-[10px] justify-end">
              <button
                onClick={() => setShowNewSMSModal(false)}
                className="px-[20px] py-[10px] bg-gray-200 rounded-[10px] hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleSaveNewSMS}
                className="px-[20px] py-[10px] bg-[#2754da] text-white rounded-[10px] hover:opacity-90"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Home;


