import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { apiPost } from '../utils/api';

function SMSHistory() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedShip, setSelectedShip] = useState('');
  const [smsHistoryData, setSmsHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

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
      // POST 요청 (빈 body 또는 필요한 데이터 전송)
      const response = await apiPost(`/sms/search${queryString}`, {});
      
      if (response.ok) {
        const result = await response.json();
        console.log('[SMSHistory] SMS 내역 조회 결과:', result);
        
        if (result.success && result.data) {
          // API 응답 데이터 변환
          const smsData = Array.isArray(result.data) ? result.data : 
                         (result.data.content ? result.data.content : []);
          
          const formattedData = smsData.map((sms, index) => ({
            id: sms.id || sms.smsId || (page * 10 + index + 1),
            smsType: sms.smsType || sms.type || '사용중',
            name: sms.name || sms.templateName || '',
            contact: sms.contact || sms.recipientName || sms.name || '',
            phone: sms.phone || sms.phoneNumber || sms.recipientPhone || '',
            sendTime: sms.sendTime || sms.sentAt || sms.createdAt || '',
            status: sms.status || (sms.result === 'SUCCESS' ? '발송완료' : sms.result === 'FAILURE' ? '발송실패' : '발송완료')
          }));
          
          setSmsHistoryData(formattedData);
        } else {
          setSmsHistoryData([]);
        }
      } else {
        console.error('[SMSHistory] SMS 내역 조회 실패:', response.status, response.statusText);
        // 404나 405 같은 에러의 경우 빈 배열로 설정 (백엔드 API 미구현 가능성)
        setSmsHistoryData([]);
        if (response.status === 404) {
          console.warn('[SMSHistory] 백엔드 API가 아직 구현되지 않았을 수 있습니다: /sms/search');
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
    setCurrentPage(0);
    // 필터 초기화 후 목록 다시 불러오기
    setTimeout(() => {
      fetchSMSHistory(0);
    }, 0);
  };

  const handleSave = async () => {
    // 저장 버튼 클릭 시 검색
    await fetchSMSHistory(currentPage);
    alert('필터가 저장되었습니다.');
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
              <div className="flex justify-between items-center w-[800px]">
                <div className="flex items-start gap-[10px]">
                  <div className="flex w-[67px] px-[10px] py-[8px] items-center gap-[10px]">
                    <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>날짜</span>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div className="flex items-center">
                      <div className="flex w-[184px] px-[20px] py-[9px] items-center gap-[10px] rounded-[10px] border border-[#BDBDBD] bg-white">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                        </svg>
                        <input
                          type="text"
                          placeholder="시작날짜"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="text-[16px] font-normal text-[#BDBDBD] bg-transparent border-none outline-none flex-1"
                          style={{ fontFamily: 'Pretendard' }}
                        />
                      </div>
                      <div className="flex w-[28px] px-[10px] py-[9px] flex-col justify-center items-center gap-[10px]">
                        <span className="text-[16px] font-semibold text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>-</span>
                      </div>
                      <div className="flex w-[184px] px-[20px] py-[9px] items-center gap-[10px] rounded-[10px] border border-[#BDBDBD] bg-white">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                        </svg>
                        <input
                          type="text"
                          placeholder="끝날짜"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="text-[16px] font-normal text-[#BDBDBD] bg-transparent border-none outline-none flex-1"
                          style={{ fontFamily: 'Pretendard' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex h-[37px] items-start gap-[10px]">
                <div className="flex w-[67px] px-[10px] py-[8px] items-center gap-[10px]">
                  <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>타입</span>
                </div>
                <div className="flex h-[37px] items-center gap-[5px]">
                  <div className="flex w-[184px] h-[37px] px-[20px] py-[9px] justify-between items-center rounded-[10px] border border-[#BDBDBD] bg-white">
                    <span className="text-[16px] font-normal text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>타입 선택</span>
                    <svg width="20" height="27" viewBox="0 0 20 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 11L10 17L15 11" stroke="#BDBDBD" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-start gap-[10px]">
                  <div className="flex w-[67px] px-[10px] py-[8px] items-center gap-[10px]">
                    <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>배</span>
                  </div>
                  <div className="flex w-[184px] h-[37px] px-[20px] py-[9px] justify-between items-center rounded-[10px] border border-[#BDBDBD] bg-white">
                    <span className="text-[16px] font-normal text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>배 선택</span>
                    <svg width="20" height="27" viewBox="0 0 20 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 11L10 17L15 11" stroke="#BDBDBD" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="flex px-[10px] items-center gap-[10px]">
                  <button
                    onClick={handleReset}
                    className="flex px-[20px] py-[9px] justify-center items-center gap-[10px] rounded-[20px] border border-[#BDBDBD] bg-white"
                  >
                    <span className="text-[16px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                      필터 초기화하기
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
                    <div className="flex w-[155px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>이름</span>
                    </div>
                    <div className="flex w-[243px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>연락처</span>
                    </div>
                    <div className="flex w-[151px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
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
                    smsHistoryData.map((row, index) => (
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
                          <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>{index + 1}</span>
                      </div>
                      <div className="flex w-[153px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px]">
                          <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>{row.smsType || 'N/A'}</span>
                      </div>
                      <div className="flex w-[155px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px]">
                          <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{row.contact || 'N/A'}</span>
                      </div>
                      <div className="flex w-[243px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px]">
                          <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{row.phone || 'N/A'}</span>
                      </div>
                      <div className="flex w-[151px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px]">
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

              <div className="w-full max-w-[1056px] flex justify-center items-center gap-[10px] py-[50px] bg-white">
                <div className="flex items-center gap-[20px]">
                  <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
                    <path d="M20 11L10 20.5L20 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M30 11L20 20.5L30 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <svg width="30" height="41" viewBox="0 0 30 41" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
                    <path d="M20 11L10 20.5L20 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex items-center gap-[4px]">
                  <div className="flex w-[40px] px-[10px] py-[10px] flex-col justify-center items-center gap-[10px] rounded-[5px]">
                    <span className="text-center text-[18px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>1</span>
                  </div>
                  <div className="flex w-[40px] px-[10px] py-[10px] flex-col justify-center items-center gap-[10px] rounded-[5px]">
                    <span className="text-center text-[18px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>1</span>
                  </div>
                  <div className="flex w-[40px] px-[10px] py-[10px] flex-col justify-center items-center gap-[10px] rounded-[5px] border border-[#73757C] bg-[#F2F2F2]">
                    <span className="text-center text-[18px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>1</span>
                  </div>
                  <div className="flex w-[40px] px-[10px] py-[10px] flex-col justify-center items-center gap-[10px] rounded-[5px]">
                    <span className="text-center text-[18px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>1</span>
                  </div>
                  <div className="flex w-[40px] px-[10px] py-[10px] flex-col justify-center items-center gap-[10px] rounded-[5px]">
                    <span className="text-center text-[18px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>1</span>
                  </div>
                </div>
                <div className="flex items-center gap-[20px]">
                  <svg width="30" height="41" viewBox="0 0 30 41" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
                    <path d="M10 11L20 20.5L10 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
                    <path d="M1.5 11L11.5 20.5L1.5 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.5 11L21.5 20.5L11.5 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SMSHistory;
