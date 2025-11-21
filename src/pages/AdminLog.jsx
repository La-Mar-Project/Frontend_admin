import { useState } from 'react';
import Layout from '../components/Layout';

function AdminLog() {
  // usestate 선언
  // 날짜, 타입, 관리자명, 선택된 항목
  const [startDate, setStartDate] = useState(''); // 시작날짜
  const [endDate, setEndDate] = useState(''); // 끝날짜
  const [selectedType, setSelectedType] = useState(''); // 타입
  const [adminName, setAdminName] = useState(''); // 관리자명
  const [selectedItems, setSelectedItems] = useState([]); // 선택된 항목

  // mockData 선언
  const mockData = [
    { id: 15, userId: 'code1', type: '로그아웃', name: '원종윤', date: '2025.00.00', status: '-' },
    { id: 14, userId: 'code1', type: '로그인', name: '원종윤', date: '2025.00.00', status: '성공' },
    { id: 13, userId: 'code1', type: '로그아웃', name: '원종윤', date: '2025.00.00', status: '-' },
    { id: 12, userId: 'code1', type: '로그인', name: '원종윤', date: '2025.00.00', status: '성공' },
    { id: 11, userId: 'code1', type: '로그아웃', name: '원종윤', date: '2025.00.00', status: '-' },
    { id: 10, userId: 'code1', type: '로그아웃', name: '원종윤', date: '2025.00.00', status: '-' },
    { id: 9, userId: 'code1', type: '로그아웃', name: '원종윤', date: '2025.00.00', status: '-' },
    { id: 8, userId: 'code1', type: '로그인', name: '원종윤', date: '2025.00.00', status: '성공' },
    { id: 7, userId: 'code1', type: '로그인', name: '원종윤', date: '2025.00.00', status: '성공' },
    { id: 6, userId: 'code1', type: '로그인', name: '원종윤', date: '2025.00.00', status: '성공' },
    { id: 5, userId: 'code1', type: '로그아웃', name: '원종윤', date: '2025.00.00', status: '-' },
    { id: 4, userId: 'code1', type: '로그인', name: '원종윤', date: '2025.00.00', status: '성공' },
    { id: 3, userId: 'code1', type: '로그아웃', name: '원종윤', date: '2025.00.00', status: '-' },
    { id: 2, userId: 'code1', type: '로그인', name: '원종윤', date: '2025.00.00', status: '실패' },
    { id: 1, userId: 'code1', type: '로그인', name: '원종윤', date: '2025.00.00', status: '실패' },
  ];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(mockData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

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
  };

  const handleSearch = () => {
    console.log('검색:', { startDate, endDate, selectedType, adminName });
  };

  const handleDelete = () => {
    if (selectedItems.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (window.confirm(`${selectedItems.length}개의 항목을 삭제하시겠습니까?`)) {
      console.log('삭제:', selectedItems);
      setSelectedItems([]);
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
                    <div className="flex items-center gap-[12px]">
                      <div className="flex items-center gap-[10px] px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                        </svg>
                        <input 
                          type="text" 
                          placeholder="시작날짜" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="text-[16px] font-normal text-[#BDBDBD] bg-transparent outline-none flex-1" 
                          style={{ fontFamily: 'Pretendard' }}
                        />
                      </div>
                      <div className="flex justify-center items-center px-[10px] py-[9px] w-[28px]">
                        <span className="text-[16px] font-semibold text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>-</span>
                      </div>
                      <div className="flex items-center gap-[10px] px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                        </svg>
                        <input 
                          type="text" 
                          placeholder="끝날짜" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="text-[16px] font-normal text-[#BDBDBD] bg-transparent outline-none flex-1" 
                          style={{ fontFamily: 'Pretendard' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-[10px] h-[37px]">
                    <div className="flex items-center px-[10px] py-[8px] w-[67px]">
                      <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>타입</span>
                    </div>
                    <div className="flex items-center gap-[5px] h-[37px]">
                      <div className="flex justify-between items-center px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px] h-[37px]">
                        <span className="text-[16px] font-normal text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>타입 선택</span>
                        <svg width="20" height="27" viewBox="0 0 20 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 11L10 17L15 11" stroke="#BDBDBD" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
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

                {mockData.map((item) => (
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
                      <span className="text-[18px] font-normal text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>{item.id}</span>
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
                      <span className="text-[18px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{item.date}</span>
                    </div>
                    <div className="flex justify-center items-center px-[20px] py-[12px] border-2 border-[#DFE7F4] bg-white w-[150px] h-[48px]">
                      <span className="text-[18px] font-normal text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-[10px] py-[50px] bg-white w-full max-w-[1056px]">
            <div className="flex items-center gap-[20px]">
              <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 11L10 20.5L20 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M30 11L20 20.5L30 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <svg width="30" height="41" viewBox="0 0 30 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 11L10 20.5L20 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <div className="flex items-center gap-[4px]">
              <div className="flex flex-col justify-center items-center px-[10px] py-[10px] rounded-[5px] w-[40px]">
                <span className="text-center text-[18px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>1</span>
              </div>
              <div className="flex flex-col justify-center items-center px-[10px] py-[10px] rounded-[5px] w-[40px]">
                <span className="text-center text-[18px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>1</span>
              </div>
              <div className="flex flex-col justify-center items-center px-[10px] py-[10px] rounded-[5px] border border-[#73757C] bg-[#F2F2F2] w-[40px]">
                <span className="text-center text-[18px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>1</span>
              </div>
              <div className="flex flex-col justify-center items-center px-[10px] py-[10px] rounded-[5px] w-[40px]">
                <span className="text-center text-[18px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>1</span>
              </div>
              <div className="flex flex-col justify-center items-center px-[10px] py-[10px] rounded-[5px] w-[40px]">
                <span className="text-center text-[18px] font-medium text-[#73757C]" style={{ fontFamily: 'Pretendard' }}>1</span>
              </div>
            </div>

            <div className="flex items-center gap-[20px]">
              <svg width="30" height="41" viewBox="0 0 30 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 11L20 20.5L10 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 11L11.5 20.5L1.5 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.5 11L21.5 20.5L11.5 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AdminLog;
