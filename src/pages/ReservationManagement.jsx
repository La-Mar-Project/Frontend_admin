import { useState } from 'react';
import Layout from '../components/Layout';

function ReservationManagement() {
  const [selectedRows, setSelectedRows] = useState(new Set());

  const mockData = [
    {
      id: 1,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '예약자 메모입니다 예약자 메모는 이런식으로 가로 180 픽셀랄라...',
      status: '예약접수',
      statusColor: '#2754DA',
      payment: '신한11054653...',
      coupon: true
    },
    {
      id: 2,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '출항일 뵙겠습니다 잘 부탁드립니다',
      status: '예약접수',
      statusColor: '#2754DA',
      payment: '신한11054653...',
      coupon: false
    },
    {
      id: 3,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '',
      status: '예약접수',
      statusColor: '#2754DA',
      payment: '신한11054653...',
      coupon: false
    },
    {
      id: 4,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '',
      status: '예약접수',
      statusColor: '#2754DA',
      payment: '신한11054653...',
      coupon: true
    },
    {
      id: 5,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '예약자 메모입니다 예약자 메모는 ',
      status: '입금완료',
      statusColor: '#272C3C',
      payment: '신한11054653...',
      coupon: false
    },
    {
      id: 6,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '예약자 메모입니다 예약자 메모는 이런식으로 가로 180 픽셀랄라...',
      status: '예약접수',
      statusColor: '#2754DA',
      payment: '신한11054653...',
      coupon: true
    },
    {
      id: 7,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '',
      status: '예약접수',
      statusColor: '#2754DA',
      payment: '신한11054653...',
      coupon: true
    },
    {
      id: 8,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '예약자 메모입니다 예약자 메모는 이런식으로 가로 180 픽셀랄라...',
      status: '입금완료',
      statusColor: '#272C3C',
      payment: '신한11054653...',
      coupon: true
    },
    {
      id: 9,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '예약자 메모입니다 예약자 메모는 이런식으로 가로 180 픽셀랄라...',
      status: '입금완료',
      statusColor: '#272C3C',
      payment: '신한11054653...',
      coupon: false
    },
    {
      id: 10,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '예약자 메모입니다 예약자 메모는 이런식으로 가로 180 픽셀랄라...',
      status: '취소접수',
      statusColor: '#ED2626',
      payment: '신한11054653...',
      coupon: false
    },
    {
      id: 11,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '예약자 메모입니다 예약자 메모는 이런식으로 가로 180 픽셀랄라...',
      status: '취소완료',
      statusColor: '#272C3C',
      payment: '신한11054653...',
      coupon: false
    },
    {
      id: 12,
      date: '25.00.00',
      name: '원종윤(1)',
      phone: '010-1234-5678',
      boat: '쭈갑이야',
      amount: '270,000',
      memo: '예약자 메모입니다 예약자 메모는 이런식으로 가로 180 픽셀랄라...',
      status: '입금완료',
      statusColor: '#272C3C',
      payment: '신한11054653...',
      coupon: false
    }
  ];

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  return (
    <Layout>
      <div className="flex flex-col items-start gap-[26px] px-[42px] py-[26px] pb-[300px]">
        <div className="flex flex-col items-start gap-[10px] w-full mx-auto">
          <div className="flex flex-col items-start gap-[10px] rounded-[20px] bg-[#F7F8FC] px-[60px] py-[40px] title-section">
            <h1 className="text-[30px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
              예약관리
            </h1>
            <p className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard', lineHeight: '23px' }}>
              예약기록 및 취소기록을 관리할 수 있습니다.
            </p>

            <div className="flex flex-col items-start gap-[13px] self-stretch pt-[10px]">
              <div className="flex items-center justify-between w-[800px]">
                <div className="flex items-start gap-[10px]">
                  <div className="flex items-center gap-[10px] px-[10px] py-[8px] w-[67px]">
                    <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                      날짜
                    </span>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div className="flex items-center gap-[10px] px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                      </svg>
                      <span className="text-[16px] font-normal text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>
                        시작날짜
                      </span>
                    </div>
                    <div className="flex items-center justify-center px-[10px] py-[9px] w-[28px]">
                      <span className="text-[16px] font-semibold text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>
                        -
                      </span>
                    </div>
                    <div className="flex items-center gap-[10px] px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 8V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V8H16ZM11.5556 0C11.7913 0 12.0174 0.0936505 12.1841 0.260349C12.3508 0.427048 12.4444 0.653141 12.4444 0.888889V1.77778H14.2222C14.6937 1.77778 15.1459 1.96508 15.4793 2.29848C15.8127 2.63187 16 3.08406 16 3.55556V6.22222H0V3.55556C0 3.08406 0.187301 2.63187 0.520699 2.29848C0.854097 1.96508 1.30628 1.77778 1.77778 1.77778H3.55556V0.888889C3.55556 0.653141 3.64921 0.427048 3.81591 0.260349C3.9826 0.0936505 4.2087 0 4.44444 0C4.68019 0 4.90628 0.0936505 5.07298 0.260349C5.23968 0.427048 5.33333 0.653141 5.33333 0.888889V1.77778H10.6667V0.888889C10.6667 0.653141 10.7603 0.427048 10.927 0.260349C11.0937 0.0936505 11.3198 0 11.5556 0Z" fill="#BDBDBD"/>
                      </svg>
                      <span className="text-[16px] font-normal text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>
                        끝날짜
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-[10px] h-[37px]">
                <div className="flex items-center gap-[10px] px-[10px] py-[8px] w-[67px]">
                  <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                    타입
                  </span>
                </div>
                <div className="flex items-center gap-[5px] h-[37px]">
                  <div className="flex items-center justify-between px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px] h-[37px]">
                    <span className="text-[16px] font-normal text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>
                      타입 선택
                    </span>
                    <svg width="20" height="27" viewBox="0 0 20 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 11L10 17L15 11" stroke="#BDBDBD" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between self-stretch">
                <div className="flex items-start gap-[10px]">
                  <div className="flex items-center gap-[10px] px-[10px] py-[8px] w-[67px]">
                    <span className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                      배
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-[20px] py-[9px] rounded-[10px] border border-[#BDBDBD] bg-white w-[184px] h-[37px]">
                    <span className="text-[16px] font-normal text-[#BDBDBD]" style={{ fontFamily: 'Pretendard' }}>
                      배 선택
                    </span>
                    <svg width="20" height="27" viewBox="0 0 20 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 11L10 17L15 11" stroke="#BDBDBD" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-[10px] px-[10px]">
                  <button className="flex items-center justify-center gap-[10px] px-[20px] py-[9px] rounded-[20px] border border-[#BDBDBD] bg-white">
                    <span className="text-[16px] font-medium text-[#1840B8]" style={{ fontFamily: 'Pretendard' }}>
                      검색하기
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
                <div className="flex items-center self-stretch">
                  <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[66px] h-[45px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>
                      선택
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[96px] h-[45px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>
                      출항일
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[146px] h-[45px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                      예약자 정보
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[89px] h-[45px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                      배 정보
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[92px] h-[45px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                      총 금액
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[220px] h-[45px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                      예약자 메모
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[89px] h-[45px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                      예약상태
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[138px] h-[45px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                      입금정보
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] px-[12px] py-[12px] flex-1 h-[45px] border-2 border-[#DFE7F4] bg-[#EEF4FF]">
                    <span className="text-[16px] font-medium text-[#272C3C] whitespace-nowrap text-center" style={{ fontFamily: 'Pretendard' }}>
                      쿠폰
                    </span>
                  </div>
                </div>

                {mockData.map((row) => (
                  <div key={row.id} className="flex items-center self-stretch">
                    <div className="flex items-center justify-center gap-[10px] px-[20px] w-[66px] h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <div className="flex items-center gap-[10px] p-[10px]">
                        <svg 
                          width="44" 
                          height="44" 
                          viewBox="0 0 44 44" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="cursor-pointer"
                          onClick={() => handleRowSelect(row.id)}
                        >
                          <path 
                            d="M16 10.5H28C31.0376 10.5 33.5 12.9624 33.5 16V28C33.5 31.0376 31.0376 33.5 28 33.5H16C12.9624 33.5 10.5 31.0376 10.5 28V16C10.5 12.9624 12.9624 10.5 16 10.5Z" 
                            fill="white" 
                            stroke="#1840B8"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[96px] h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                        {row.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[146px] h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                        {`${row.name} ${row.phone}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[89px] h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                        {row.boat}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[92px] h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                        {row.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[220px] h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                        {row.memo}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[89px] h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard', color: row.statusColor }}>
                        {row.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[20px] py-[12px] w-[138px] h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <span className="text-[14px] font-normal text-[#272C3C] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: 'Pretendard' }}>
                        {row.payment}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-[10px] px-[12px] py-[12px] flex-1 h-[48px] border-2 border-[#DFE7F4] bg-white">
                      <svg width="52" height="50" viewBox="0 0 52 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="50" height="48" fill="white"/>
                        <rect x="1" y="1" width="50" height="48" stroke="#DFE7F4" strokeWidth="2"/>
                        <circle cx="26" cy="25" r="8.5" fill={row.coupon ? '#2754DA' : '#D9D9D9'}/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-[10px] bg-white px-0 py-[50px] w-full max-w-[1056px]">
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
              <div className="flex items-center justify-center w-[40px] px-[10px] py-[10px] rounded-[5px]">
                <span className="text-[18px] font-medium text-[#73757C] text-center" style={{ fontFamily: 'Pretendard' }}>
                  1
                </span>
              </div>
              <div className="flex items-center justify-center w-[40px] px-[10px] py-[10px] rounded-[5px]">
                <span className="text-[18px] font-medium text-[#73757C] text-center" style={{ fontFamily: 'Pretendard' }}>
                  1
                </span>
              </div>
              <div className="flex items-center justify-center w-[40px] px-[10px] py-[10px] rounded-[5px] border border-[#73757C] bg-[#F2F2F2]">
                <span className="text-[18px] font-medium text-[#73757C] text-center" style={{ fontFamily: 'Pretendard' }}>
                  1
                </span>
              </div>
              <div className="flex items-center justify-center w-[40px] px-[10px] py-[10px] rounded-[5px]">
                <span className="text-[18px] font-medium text-[#73757C] text-center" style={{ fontFamily: 'Pretendard' }}>
                  1
                </span>
              </div>
              <div className="flex items-center justify-center w-[40px] px-[10px] py-[10px] rounded-[5px]">
                <span className="text-[18px] font-medium text-[#73757C] text-center" style={{ fontFamily: 'Pretendard' }}>
                  1
                </span>
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

export default ReservationManagement;
