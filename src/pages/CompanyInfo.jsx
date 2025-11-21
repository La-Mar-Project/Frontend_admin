import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPut } from '../utils/api';

function CompanyInfo() {
  // 연락처 상태 관리
  const [contacts, setContacts] = useState({
    representative: { part1: '010', part2: '0000', part3: '0000' },
    sending: { part1: '010', part2: '0000', part3: '0000' },
    notifier: { part1: '010', part2: '0000', part3: '0000' }
  });

  // 은행정보 상태 관리
  const [banks, setBanks] = useState({
    bank1: '신한은행 110-345-678910 (예금주 노수현)',
    bank2: '우리은행 110-345-678910 (예금주 노수현)',
    bank3: '농협은행 33-110-345-678-910 (예금주 노수현)'
  });

  // debounce를 위한 타이머 ref
  const saveTimerRef = useRef(null);

  // 자동 저장 함수
  const saveCompanyInfo = async () => {
    try {
      const response = await apiPut('/api/merchants/stores', {
        contacts,
        banks
      });

      if (response.ok) {
        console.log('회사정보가 저장되었습니다.');
      } else {
        console.error('저장 실패:', response.statusText);
      }
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
    }
  };

  // debounce된 저장 함수
  const debouncedSave = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveCompanyInfo();
    }, 1000); // 1초 후 저장
  };

  // 연락처 업데이트 함수
  const updateContact = (type, part, value) => {
    // 숫자만 입력 허용
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setContacts(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [part]: numericValue
      }
    }));
    
    debouncedSave();
  };

  // 은행정보 업데이트 함수
  const updateBank = (bankKey, value) => {
    setBanks(prev => ({
      ...prev,
      [bankKey]: value
    }));
    
    debouncedSave();
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        const response = await apiGet('/api/merchants/stores');
        if (response.ok) {
          const data = await response.json();
          if (data.contacts) {
            setContacts(data.contacts);
          }
          if (data.banks) {
            setBanks(data.banks);
          }
        }
      } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
      }
    };

    loadCompanyInfo();
  }, []);

  return (
    <Layout>
      <div className="px-[42px] py-[26px] pb-[300px] flex flex-col gap-[26px] w-full">
        {/* 회사정보 헤더 카드 */}
        <div className="flex flex-col gap-[10px] w-full mx-auto">
          <div className="flex flex-col gap-[10px] px-[60px] py-[40px] rounded-[20px] bg-[#f7f8fc] shadow-[0px_4px_4px_0px_rgba(39,84,218,0.2)] title-section">
            <h1 className="text-[30px] font-bold leading-normal text-[#272c3c]" style={{ fontFamily: 'Pretendard' }}>
              회사정보
            </h1>
            <p className="text-[18px] font-normal leading-normal text-[#272c3c]" style={{ fontFamily: 'Pretendard' }}>
              연락처와 은행정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 연락처 섹션 */}
        <div className="flex flex-col gap-[10px] w-full mx-auto">
          <div className="flex px-[60px] py-[40px] justify-start items-center gap-[10px]">
            <h2 className="text-[25px] font-bold leading-normal text-[#1840b8]" style={{ fontFamily: 'Pretendard' }}>
              연락처
            </h2>
          </div>
          <div className="flex pl-[122px] items-center">
            {/* 좌측 레이블 */}
            <div className="flex flex-col w-[222px]">
              <div className="flex h-[62px] px-[40px] py-[18px] justify-center items-center rounded-tl-[10px] border-2 border-[#dfe7f4] bg-[#f7f8fc]">
                <p className="text-[22px] font-medium leading-normal text-[#272c3c]" style={{ fontFamily: 'Pretendard' }}>
                  대표자 연락처
                </p>
              </div>
              <div className="flex h-[62px] px-[40px] py-[18px] justify-center items-center gap-[10px] border-2 border-[#dfe7f4] bg-[#f7f8fc]">
                <p className="text-[22px] font-medium leading-normal text-[#272c3c]" style={{ fontFamily: 'Pretendard' }}>
                  발송 연락처
                </p>
              </div>
              <div className="flex h-[62px] px-[40px] py-[18px] justify-center items-center gap-[10px] rounded-bl-[10px] border-2 border-[#dfe7f4] bg-[#f7f8fc]">
                <p className="text-[22px] font-medium leading-normal text-[#272c3c]" style={{ fontFamily: 'Pretendard' }}>
                  알리미 연락처
                </p>
              </div>
            </div>

            {/* 우측 입력 ���드 */}
            <div className="flex flex-col w-[493px]">
              {/* 대표자 연락처 */}
              <div className="flex h-[62px] px-[105px] py-[10px] justify-center items-center rounded-tr-[10px] border-2 border-[#dfe7f4] bg-white opacity-93">
                <input
                  type="text"
                  maxLength="3"
                  value={contacts.representative.part1}
                  onChange={(e) => updateContact('representative', 'part1', e.target.value)}
                  className="flex px-[14px] py-[5px] w-[60px] text-center rounded-[12px] border-2 border-[#dfe7f4] text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
                <div className="flex flex-col px-[6px] py-0 justify-center items-center">
                  <p className="text-[22px] font-medium leading-normal text-black" style={{ fontFamily: 'Pretendard' }}>-</p>
                </div>
                <input
                  type="text"
                  maxLength="4"
                  value={contacts.representative.part2}
                  onChange={(e) => updateContact('representative', 'part2', e.target.value)}
                  className="flex px-[14px] py-[5px] w-[70px] text-center rounded-[12px] border-2 border-[#dfe7f4] text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
                <div className="flex flex-col px-[6px] py-0 justify-center items-center">
                  <p className="text-[22px] font-medium leading-normal text-black" style={{ fontFamily: 'Pretendard' }}>-</p>
                </div>
                <input
                  type="text"
                  maxLength="4"
                  value={contacts.representative.part3}
                  onChange={(e) => updateContact('representative', 'part3', e.target.value)}
                  className="flex px-[14px] py-[5px] w-[70px] text-center rounded-[12px] border-2 border-[#dfe7f4] text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
              </div>

              {/* 발송 연락처 */}
              <div className="flex h-[62px] px-[105px] py-[10px] justify-center items-center border-2 border-[#dfe7f4] bg-white opacity-93">
                <input
                  type="text"
                  maxLength="3"
                  value={contacts.sending.part1}
                  onChange={(e) => updateContact('sending', 'part1', e.target.value)}
                  className="flex px-[14px] py-[5px] w-[60px] text-center rounded-[12px] border-2 border-[#dfe7f4] text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
                <div className="flex flex-col px-[6px] py-0 justify-center items-center">
                  <p className="text-[22px] font-medium leading-normal text-black" style={{ fontFamily: 'Pretendard' }}>-</p>
                </div>
                <input
                  type="text"
                  maxLength="4"
                  value={contacts.sending.part2}
                  onChange={(e) => updateContact('sending', 'part2', e.target.value)}
                  className="flex px-[14px] py-[5px] w-[70px] text-center rounded-[12px] border-2 border-[#dfe7f4] text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
                <div className="flex flex-col px-[6px] py-0 justify-center items-center">
                  <p className="text-[22px] font-medium leading-normal text-black" style={{ fontFamily: 'Pretendard' }}>-</p>
                </div>
                <input
                  type="text"
                  maxLength="4"
                  value={contacts.sending.part3}
                  onChange={(e) => updateContact('sending', 'part3', e.target.value)}
                  className="flex px-[14px] py-[5px] w-[70px] text-center rounded-[12px] border-2 border-[#dfe7f4] text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
              </div>

              {/* 알리미 연락처 */}
              <div className="flex h-[62px] px-[105px] py-[10px] justify-center items-center rounded-br-[10px] border-2 border-[#dfe7f4] bg-white opacity-93">
                <input
                  type="text"
                  maxLength="3"
                  value={contacts.notifier.part1}
                  onChange={(e) => updateContact('notifier', 'part1', e.target.value)}
                  className="flex px-[14px] py-[5px] w-[60px] text-center rounded-[12px] border-2 border-[#dfe7f4] text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
                <div className="flex flex-col px-[6px] py-0 justify-center items-center">
                  <p className="text-[22px] font-medium leading-normal text-black" style={{ fontFamily: 'Pretendard' }}>-</p>
                </div>
                <input
                  type="text"
                  maxLength="4"
                  value={contacts.notifier.part2}
                  onChange={(e) => updateContact('notifier', 'part2', e.target.value)}
                  className="flex px-[14px] py-[5px] w-[70px] text-center rounded-[12px] border-2 border-[#dfe7f4] text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
                <div className="flex flex-col px-[6px] py-0 justify-center items-center">
                  <p className="text-[22px] font-medium leading-normal text-black" style={{ fontFamily: 'Pretendard' }}>-</p>
                </div>
                <input
                  type="text"
                  maxLength="4"
                  value={contacts.notifier.part3}
                  onChange={(e) => updateContact('notifier', 'part3', e.target.value)}
                  className="flex px-[14px] py-[5px] w-[70px] text-center rounded-[12px] border-2 border-[#dfe7f4] text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 은행정보 섹션 */}
        <div className="flex flex-col gap-[10px] w-full mx-auto">
          <div className="flex px-[60px] py-[40px] justify-start items-center gap-[10px]">
            <h2 className="text-[25px] font-bold leading-normal text-[#1840b8]" style={{ fontFamily: 'Pretendard' }}>
              은행정보
            </h2>
          </div>
          <div className="flex pl-[122px] items-center">
            {/* 좌측 레이블 */}
            <div className="flex flex-col w-[222px]">
              <div className="flex h-[62px] px-[40px] py-[20px] justify-center items-center rounded-tl-[10px] border-2 border-[#dfe7f4] bg-[#f7f8fc]">
                <p className="text-[22px] font-medium leading-normal text-[#272c3c]" style={{ fontFamily: 'Pretendard' }}>
                  결제은행 1
                </p>
              </div>
              <div className="flex h-[62px] px-[40px] py-[20px] justify-center items-center gap-[10px] border-2 border-[#dfe7f4] bg-[#f7f8fc]">
                <p className="text-[22px] font-medium leading-normal text-[#272c3c]" style={{ fontFamily: 'Pretendard' }}>
                  결제은행 2
                </p>
              </div>
              <div className="flex h-[62px] px-[40px] py-[20px] justify-center items-center gap-[10px] rounded-bl-[10px] border-2 border-[#dfe7f4] bg-[#f7f8fc]">
                <p className="text-[22px] font-medium leading-normal text-[#272c3c]" style={{ fontFamily: 'Pretendard' }}>
                  결제은행 3
                </p>
              </div>
            </div>

            {/* 우측 정보 필드 */}
            <div className="flex flex-col w-[493px]">
              {/* 결제은행 1 */}
              <div className="flex h-[62px] px-[14px] py-[10px] justify-center items-center rounded-tr-[10px] border-2 border-[#dfe7f4] bg-white">
                <input
                  type="text"
                  value={banks.bank1}
                  onChange={(e) => updateBank('bank1', e.target.value)}
                  className="flex flex-1 px-[12px] py-[5px] text-center rounded-[12px] border-2 border-[#dfe7f4] bg-white text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
              </div>

              {/* 결제은행 2 */}
              <div className="flex h-[62px] px-[14px] py-[10px] justify-center items-center border-2 border-[#dfe7f4] bg-white">
                <input
                  type="text"
                  value={banks.bank2}
                  onChange={(e) => updateBank('bank2', e.target.value)}
                  className="flex flex-1 px-[12px] py-[5px] text-center rounded-[12px] border-2 border-[#dfe7f4] bg-white text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
              </div>

              {/* 결제은행 3 */}
              <div className="flex h-[62px] px-[14px] py-[10px] justify-center items-center rounded-br-[10px] border-2 border-[#dfe7f4] bg-white">
                <input
                  type="text"
                  value={banks.bank3}
                  onChange={(e) => updateBank('bank3', e.target.value)}
                  className="flex flex-1 px-[12px] py-[5px] text-center rounded-[12px] border-2 border-[#dfe7f4] bg-white text-[20px] font-normal leading-normal text-[#272c3c] focus:outline-none focus:border-[#1840b8]"
                  style={{ fontFamily: 'Pretendard' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CompanyInfo;
