import { useState } from 'react';
import Layout from '../components/Layout';

function PreReservationCoupon() {
  const [selectedRows, setSelectedRows] = useState([]);

  const couponData = [
    { id: 15, status: '사용중', code: 'code1', name: '원종윤', phone: '010-1234-5678' },
    { id: 14, status: '사용중', code: 'code2', name: '손고장난벽시', phone: '010-1234-5678' },
    { id: 13, status: '사용중', code: 'code1', name: '김지오', phone: '010-1234-5678' },
    { id: 12, status: '사용중', code: 'code1', name: '김준수', phone: '010-1234-5678' },
    { id: 11, status: '사용중', code: 'code1', name: '장창엽', phone: '010-1234-5678' },
    { id: 10, status: '사용중', code: 'code1', name: '노수현', phone: '010-1234-5678' },
    { id: 9, status: '사용중', code: 'code1', name: '김빅토리아노', phone: '010-1234-5678' },
    { id: 8, status: '사용중', code: 'rhksflwkdlqjs', name: '관리자2', phone: '010-1234-5678' },
    { id: 7, status: '보관중', code: 'rhksflwkdlfqjs', name: '관리자1', phone: '010-1234-5678' },
    { id: 6, status: '사용중', code: 'code1', name: '선장', phone: '010-1234-5678' },
    { id: 5, status: '사용중', code: 'JJUBULL', name: '쭈불', phone: '010-1234-5678' },
    { id: 4, status: '사용중', code: 'alololo', name: '알로스', phone: '010-1234-5678' },
    { id: 3, status: '사용중', code: 'num3', name: '삼번', phone: '010-1234-5678' },
    { id: 2, status: '사용중', code: 'code1', name: '쭈꾸미', phone: '010-1234-5678' },
    { id: 1, status: '보관중', code: 'code1', name: '사용', phone: '010-1234-5678' },
  ];

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
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-[26px] px-[42px] py-[26px] pb-[300px]">
        <div className="flex flex-col gap-[10px] w-full mx-auto">
          <div className="flex flex-col gap-[10px] px-[60px] py-[40px] rounded-[20px] bg-[#F7F8FC] title-section" style={{ boxShadow: '0 4px 4px 0 rgba(39, 84, 218, 0.2)' }}>
            <h1 className="text-[30px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
              쿠폰관리
            </h1>
            <p className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard', lineHeight: '23px' }}>
              쿠폰을 발행 및 관리할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[65px]">
          <div className="flex flex-col gap-[10px]">
            <div className="flex justify-center items-center px-[60px] py-[40px] gap-[10px]">
              <h2 className="text-[25px] font-bold text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                선예약쿠폰
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
                    <div className="flex w-[151px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>이름</span>
                    </div>
                    <div className="flex w-[256px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>연락처</span>
                    </div>
                    <div className="flex w-[184px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>쿠폰 개수</span>
                    </div>
                    <div className="flex px-[20px] py-[12px] justify-center items-center gap-[10px] flex-1 border-2 border-[#DFE7F4] bg-[#EEF4FF] h-[45px]">
                      <span className="text-[20px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>메모</span>
                    </div>
                  </div>

                  {couponData.map((row) => (
                    <div key={row.id} className="flex items-center">
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
                        <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>{row.id}</span>
                      </div>
                      <div className="flex w-[151px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px]">
                        <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{row.status}</span>
                      </div>
                      <div className="flex w-[256px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px]">
                        <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{row.code}</span>
                      </div>
                      <div className="flex w-[184px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px]">
                        <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{row.name}</span>
                      </div>
                      <div className="flex px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[#DFE7F4] bg-white h-[48px] flex-1">
                        <span className="text-[20px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>{row.phone}</span>
                      </div>
                    </div>
                  ))}
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

export default PreReservationCoupon;
