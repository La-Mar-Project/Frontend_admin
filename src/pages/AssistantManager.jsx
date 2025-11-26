import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

function AssistantManager() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [assistantData, setAssistantData] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  const [currentSavingItem, setCurrentSavingItem] = useState(null);
  const saveTimerRef = useRef(null);

  // localStorage에서 보조 관리자 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('assistantManagers');
    if (savedData) {
      try {
        setAssistantData(JSON.parse(savedData));
      } catch (error) {
        console.error('보조 관리자 데이터 로드 실패:', error);
      }
    }
  }, []);

  // assistantData가 변경될 때 localStorage에 저장
  useEffect(() => {
    if (assistantData.length > 0) {
      localStorage.setItem('assistantManagers', JSON.stringify(assistantData));
    }
  }, [assistantData]);

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleNewManager = () => {
    const maxId = Math.max(...assistantData.map(item => item.id), 0);
    const newAdmin = {
      id: maxId + 1,
      active: '',
      userId: '',
      name: '',
      phone: '',
      isNew: true,
      password: ''
    };
    setAssistantData([newAdmin, ...assistantData]);
  };

  const handleDelete = () => {
    if (selectedItems.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (window.confirm(`${selectedItems.length}개의 항목을 삭제하시겠습니까?`)) {
      const updatedData = assistantData.filter(item => !selectedItems.includes(item.id));
      setAssistantData(updatedData);
      setSelectedItems([]);
      
      // localStorage에서도 삭제된 관리자 정보 제거
      const allManagers = JSON.parse(localStorage.getItem('assistantManagers') || '[]');
      const filteredManagers = allManagers.filter(item => !selectedItems.includes(item.id));
      localStorage.setItem('assistantManagers', JSON.stringify(filteredManagers));
      
      // auth 데이터에서도 제거
      const authData = JSON.parse(localStorage.getItem('assistantAuth') || '{}');
      selectedItems.forEach(id => {
        const item = assistantData.find(d => d.id === id);
        if (item && item.userId) {
          delete authData[item.userId];
        }
      });
      localStorage.setItem('assistantAuth', JSON.stringify(authData));
    }
  };

  const handleFieldChange = (id, field, value) => {
    const updatedData = assistantData.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setAssistantData(updatedData);

    // 자동 저장 타이머 설정 (2초 후)
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const item = updatedData.find(d => d.id === id);
    // 새로 추가된 항목이고, 모든 필드가 입력되었고, 비밀번호가 설정되지 않은 경우
    if (item && item.isNew && !item.password && item.active && item.userId && item.name && item.phone) {
      saveTimerRef.current = setTimeout(() => {
        // 모든 필드가 입력되었고, 비밀번호가 설정되지 않은 경우 비밀번호 모달 표시
        const currentItem = assistantData.find(d => d.id === id);
        if (currentItem && currentItem.isNew && !currentItem.password && 
            currentItem.active && currentItem.userId && currentItem.name && currentItem.phone) {
          setCurrentSavingItem(currentItem);
          setShowPasswordModal(true);
        }
      }, 2000);
    }
  };

  const handleActiveChange = (id, value) => {
    const item = assistantData.find(d => d.id === id);
    if (item) {
      const updatedData = assistantData.map(item =>
        item.id === id ? { ...item, active: value } : item
      );
      setAssistantData(updatedData);

      // auth 데이터 업데이트
      const authData = JSON.parse(localStorage.getItem('assistantAuth') || '{}');
      if (item.userId) {
        if (value === '활성' && item.password) {
          // 활성화하고 비밀번호가 있으면 auth에 추가
          authData[item.userId] = {
            password: item.password,
            name: item.name,
            phone: item.phone,
            active: '활성'
          };
        } else if (value === '비활성') {
          // 비활성화하면 auth에서 제거
          delete authData[item.userId];
        }
        localStorage.setItem('assistantAuth', JSON.stringify(authData));
      }
    }
  };

  const handlePasswordSubmit = () => {
    if (!passwordData.password || !passwordData.confirmPassword) {
      alert('비밀번호를 모두 입력해주세요.');
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (currentSavingItem) {
      // 관리자 정보 저장
      const updatedData = assistantData.map(item =>
        item.id === currentSavingItem.id
          ? { ...item, password: passwordData.password, isNew: false }
          : item
      );
      setAssistantData(updatedData);

      // auth 데이터에 저장 (활성화된 경우만)
      if (currentSavingItem.active === '활성') {
        const authData = JSON.parse(localStorage.getItem('assistantAuth') || '{}');
        authData[currentSavingItem.userId] = {
          password: passwordData.password,
          name: currentSavingItem.name,
          phone: currentSavingItem.phone,
          active: '활성'
        };
        localStorage.setItem('assistantAuth', JSON.stringify(authData));
      }

      // 비밀번호 모달 닫기
      setShowPasswordModal(false);
      setPasswordData({ password: '', confirmPassword: '' });
      setCurrentSavingItem(null);
      alert('관리자 정보가 저장되었습니다.');
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPasswordData({ password: '', confirmPassword: '' });
    setCurrentSavingItem(null);
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
            <h1 
              className="font-bold text-[30px]" 
              style={{ 
                color: '#272C3C',
                fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                lineHeight: 'normal'
              }}
            >
              보조 관리자
            </h1>
            <p 
              className="text-[18px]" 
              style={{ 
                color: 'rgba(39, 44, 60, 1)',
                fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                fontWeight: 400,
                lineHeight: '23px'
              }}
            >
              접속 권한이 있는 관리자가 보조 관리자 아이디를 등록 및 관리할 수 있습니다.
              <br />
              칸을 연속으로 클릭하면 해당 칸이 수정 가능합니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[65px] pl-[0px]">
          <div className="flex flex-col gap-[10px]">
            <div className="flex justify-center items-center px-[60px] py-[40px]">
              <h2 
                className="font-bold text-[25px]" 
                style={{ 
                  color: '#1840B8',
                  fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                  lineHeight: 'normal'
                }}
              >
                보조 관리자 목록
              </h2>
            </div>

            <div className="flex flex-col justify-center items-start gap-[40px] pl-[60px]">
              <div className="flex flex-col items-end gap-[15px] w-[986px]">
                <div className="flex items-center gap-[10px] px-[10px]">
                  <button
                    onClick={handleNewManager}
                    className="flex justify-center items-center gap-[10px] px-[20px] py-[9px] rounded-[20px]"
                    style={{
                      border: '2px solid rgba(223, 231, 244, 1)',
                      background: 'rgba(238, 244, 255, 1)'
                    }}
                  >
                    <span 
                      className="font-medium text-[16px]" 
                      style={{ 
                        color: '#1840B8',
                        fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                        lineHeight: 'normal'
                      }}
                    >
                      새 관리자 아이디 등록하기
                    </span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex justify-center items-center gap-[10px] px-[20px] py-[9px] rounded-[20px]"
                    style={{
                      border: '2px solid rgba(223, 231, 244, 1)',
                      background: 'rgba(238, 244, 255, 1)'
                    }}
                  >
                    <span 
                      className="font-medium text-[16px]" 
                      style={{ 
                        color: '#1840B8',
                        fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                        lineHeight: 'normal'
                      }}
                    >
                      삭제하기
                    </span>
                  </button>
                </div>

                <div className="flex flex-col items-start w-[986px]">
                  <div className="flex items-center w-full">
                    <div 
                      className="flex justify-center items-center gap-[10px] px-[20px] py-[12px]"
                      style={{
                        width: '66px',
                        height: '45px',
                        border: '2px solid rgba(223, 231, 244, 1)',
                        background: 'rgba(238, 244, 255, 1)'
                      }}
                    >
                      <span 
                        className="font-medium text-[20px] whitespace-nowrap text-center" 
                        style={{ 
                          color: '#272C3C',
                          fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                          lineHeight: 'normal'
                        }}
                      >
                        선택
                      </span>
                    </div>
                    <div 
                      className="flex justify-center items-center gap-[10px] px-[20px] py-[12px]"
                      style={{
                        width: '66px',
                        height: '45px',
                        border: '2px solid rgba(223, 231, 244, 1)',
                        background: 'rgba(238, 244, 255, 1)'
                      }}
                    >
                      <span 
                        className="font-medium text-[20px] whitespace-nowrap text-center" 
                        style={{ 
                          color: 'rgba(39, 44, 60, 1)',
                          fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                          lineHeight: 'normal'
                        }}
                      >
                        순번
                      </span>
                    </div>
                    <div 
                      className="flex justify-center items-center gap-[10px] px-[20px] py-[12px]"
                      style={{
                        width: '151px',
                        height: '45px',
                        border: '2px solid rgba(223, 231, 244, 1)',
                        background: 'rgba(238, 244, 255, 1)'
                      }}
                    >
                      <span 
                        className="font-medium text-[20px] whitespace-nowrap text-center" 
                        style={{ 
                          color: 'rgba(39, 44, 60, 1)',
                          fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                          lineHeight: 'normal'
                        }}
                      >
                        활성여부
                      </span>
                    </div>
                    <div 
                      className="flex justify-center items-center gap-[10px] px-[20px] py-[12px]"
                      style={{
                        width: '256px',
                        height: '45px',
                        border: '2px solid rgba(223, 231, 244, 1)',
                        background: 'rgba(238, 244, 255, 1)'
                      }}
                    >
                      <span 
                        className="font-medium text-[20px] whitespace-nowrap overflow-hidden text-ellipsis text-center" 
                        style={{ 
                          color: 'rgba(39, 44, 60, 1)',
                          fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                          lineHeight: 'normal'
                        }}
                      >
                        아이디
                      </span>
                    </div>
                    <div 
                      className="flex justify-center items-center gap-[10px] px-[20px] py-[12px]"
                      style={{
                        width: '184px',
                        height: '45px',
                        border: '2px solid rgba(223, 231, 244, 1)',
                        background: 'rgba(238, 244, 255, 1)'
                      }}
                    >
                      <span 
                        className="font-medium text-[20px] whitespace-nowrap overflow-hidden text-ellipsis text-center" 
                        style={{ 
                          color: 'rgba(39, 44, 60, 1)',
                          fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                          lineHeight: 'normal'
                        }}
                      >
                        이름
                      </span>
                    </div>
                    <div 
                      className="flex justify-center items-center gap-[10px] px-[20px] py-[12px]"
                      style={{
                        width: '263px',
                        height: '45px',
                        border: '2px solid rgba(223, 231, 244, 1)',
                        background: 'rgba(238, 244, 255, 1)'
                      }}
                    >
                      <span 
                        className="font-medium text-[20px] whitespace-nowrap overflow-hidden text-ellipsis text-center" 
                        style={{ 
                          color: 'rgba(39, 44, 60, 1)',
                          fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                          lineHeight: 'normal'
                        }}
                      >
                        연락처
                      </span>
                    </div>
                  </div>

                  {assistantData.map((item) => (
                    <div key={item.id} className="flex items-center w-full">
                      <div
                        className="flex justify-center items-center gap-[10px] px-[20px]"
                        style={{
                          width: '66px',
                          height: '48px',
                          border: '2px solid rgba(223, 231, 244, 1)',
                          background: 'rgba(255, 255, 255, 1)'
                        }}
                      >
                        <div className="flex p-[10px] items-center gap-[10px]">
                          <svg width="24" height="24" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M16 10.5H28C31.0376 10.5 33.5 12.9624 33.5 16V28C33.5 31.0376 31.0376 33.5 28 33.5H16C12.9624 33.5 10.5 31.0376 10.5 28V16C10.5 12.9624 12.9624 10.5 16 10.5Z"
                              fill={selectedItems.includes(item.id) ? '#1840B8' : 'white'}
                              stroke="#1840B8"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleSelectItem(item.id)}
                            />
                          </svg>
                        </div>
                      </div>
                      <div
                        className="flex justify-center items-center gap-[10px] px-[20px] py-[12px]"
                        style={{
                          width: '66px',
                          height: '48px',
                          border: '2px solid rgba(223, 231, 244, 1)',
                          background: 'rgba(255, 255, 255, 1)'
                        }}
                      >
                        <span
                          className="text-[18px] whitespace-nowrap text-center"
                          style={{
                            color: 'rgba(39, 44, 60, 1)',
                            fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                            fontWeight: 400,
                            lineHeight: 'normal'
                          }}
                        >
                          {item.id}
                        </span>
                      </div>
                      <div
                        className="flex justify-center items-center gap-[10px] px-[20px] py-[12px]"
                        style={{
                          width: '151px',
                          height: '48px',
                          border: '2px solid rgba(223, 231, 244, 1)',
                          background: item.isNew ? 'rgba(255, 255, 224, 1)' : 'rgba(255, 255, 255, 1)'
                        }}
                      >
                        <select
                          value={item.active}
                          onChange={(e) => handleActiveChange(item.id, e.target.value)}
                          className="text-[18px] text-center w-full bg-transparent outline-none whitespace-nowrap cursor-pointer"
                          style={{
                            color: 'rgba(39, 44, 60, 1)',
                            fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                            fontWeight: 400,
                            lineHeight: 'normal',
                            border: 'none'
                          }}
                        >
                          <option value="">선택</option>
                          <option value="활성">활성</option>
                          <option value="비활성">비활성</option>
                        </select>
                      </div>
                      <div
                        className="flex justify-center items-center gap-[10px] px-[20px] py-[12px]"
                        style={{
                          width: '256px',
                          height: '48px',
                          border: '2px solid rgba(223, 231, 244, 1)',
                          background: item.isNew ? 'rgba(255, 255, 224, 1)' : 'rgba(255, 255, 255, 1)'
                        }}
                      >
                        {item.isNew ? (
                          <input
                            type="text"
                            value={item.userId}
                            onChange={(e) => handleFieldChange(item.id, 'userId', e.target.value)}
                            placeholder="아이디 입력"
                            className="text-[18px] text-center w-full bg-transparent outline-none whitespace-nowrap"
                            style={{
                              color: 'rgba(39, 44, 60, 1)',
                              fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                              fontWeight: 400,
                              lineHeight: 'normal'
                            }}
                          />
                        ) : (
                          <span
                            className="text-[18px] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
                            style={{
                              color: 'rgba(39, 44, 60, 1)',
                              fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                              fontWeight: 400,
                              lineHeight: 'normal'
                            }}
                          >
                            {item.userId}
                          </span>
                        )}
                      </div>
                      <div
                        className="flex justify-center items-center gap-[10px] px-[20px] py-[12px]"
                        style={{
                          width: '184px',
                          height: '48px',
                          border: '2px solid rgba(223, 231, 244, 1)',
                          background: item.isNew ? 'rgba(255, 255, 224, 1)' : 'rgba(255, 255, 255, 1)'
                        }}
                      >
                        {item.isNew ? (
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                            placeholder="이름 입력"
                            className="text-[18px] text-center w-full bg-transparent outline-none whitespace-nowrap"
                            style={{
                              color: 'rgba(39, 44, 60, 1)',
                              fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                              fontWeight: 400,
                              lineHeight: 'normal'
                            }}
                          />
                        ) : (
                          <span
                            className="text-[18px] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
                            style={{
                              color: 'rgba(39, 44, 60, 1)',
                              fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                              fontWeight: 400,
                              lineHeight: 'normal'
                            }}
                          >
                            {item.name}
                          </span>
                        )}
                      </div>
                      <div
                        className="flex justify-center items-center gap-[10px] px-[20px] py-[12px]"
                        style={{
                          width: '263px',
                          height: '48px',
                          border: '2px solid rgba(223, 231, 244, 1)',
                          background: item.isNew ? 'rgba(255, 255, 224, 1)' : 'rgba(255, 255, 255, 1)'
                        }}
                      >
                        {item.isNew ? (
                          <input
                            type="text"
                            value={item.phone}
                            onChange={(e) => handleFieldChange(item.id, 'phone', e.target.value)}
                            placeholder="연락처 입력"
                            className="text-[18px] text-center w-full bg-transparent outline-none whitespace-nowrap"
                            style={{
                              color: 'rgba(39, 44, 60, 1)',
                              fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                              fontWeight: 400,
                              lineHeight: 'normal'
                            }}
                          />
                        ) : (
                          <span
                            className="text-[18px] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
                            style={{
                              color: 'rgba(39, 44, 60, 1)',
                              fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                              fontWeight: 400,
                              lineHeight: 'normal'
                            }}
                          >
                            {item.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[10px] px-[340px] py-[50px] bg-white w-full max-w-[1056px]">
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
              {[1, 1, 1, 1, 1].map((_, index) => (
                <div 
                  key={index}
                  className="flex flex-col justify-center items-center gap-[10px] px-[10px] py-[10px] rounded-[5px]"
                  style={{
                    width: '40px',
                    border: index === 2 ? '1px solid rgba(115, 117, 124, 1)' : 'none',
                    background: index === 2 ? 'rgba(242, 242, 242, 1)' : 'transparent'
                  }}
                >
                  <span 
                    className="text-center font-medium text-[18px]" 
                    style={{ 
                      color: 'rgba(115, 117, 124, 1)',
                      fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif',
                      lineHeight: 'normal'
                    }}
                  >
                    1
                  </span>
                </div>
              ))}
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

      {/* 비밀번호 설정 모달 */}
      {showPasswordModal && currentSavingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-[40px] w-[500px]">
            <h2 className="text-[24px] font-bold mb-[20px] text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
              비밀번호 설정
            </h2>
            <div className="flex flex-col gap-[20px]">
              <div>
                <label className="block mb-[10px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                  아이디: {currentSavingItem.userId}
                </label>
                <label className="block mb-[10px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                  이름: {currentSavingItem.name}
                </label>
              </div>
              <div>
                <label className="block mb-[10px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                  비밀번호 설정
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  className="w-full py-[12px] px-[16px] rounded-[10px] border-2 border-[#E7E7E7] bg-white text-[#272C3C] font-pretendard text-[16px] outline-none focus:border-[#2754DA]"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
              <div>
                <label className="block mb-[10px] font-medium text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full py-[12px] px-[16px] rounded-[10px] border-2 border-[#E7E7E7] bg-white text-[#272C3C] font-pretendard text-[16px] outline-none focus:border-[#2754DA]"
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
              <div className="flex gap-[10px] justify-end mt-[20px]">
                <button
                  onClick={handlePasswordModalClose}
                  className="px-[20px] py-[10px] bg-gray-200 rounded-[10px] hover:bg-gray-300 text-[#272C3C] font-medium"
                  style={{ fontFamily: 'Pretendard' }}
                >
                  취소
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="px-[20px] py-[10px] bg-[#2754DA] text-white rounded-[10px] hover:opacity-90 font-medium"
                  style={{ fontFamily: 'Pretendard' }}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default AssistantManager;
