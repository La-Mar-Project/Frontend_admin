import { useState } from 'react';
import Layout from '../components/Layout';

function AssistantManager() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [assistantData, setAssistantData] = useState([
    { id: 15, active: '활성', userId: 'code1', name: '원종윤', phone: '010-1234-5678', isNew: false },
    { id: 14, active: '활성', userId: 'code2', name: '손고장난벽시', phone: '010-1234-5678', isNew: false },
    { id: 13, active: '활성', userId: 'code1', name: '김지오', phone: '010-1234-5678', isNew: false },
    { id: 12, active: '활성', userId: 'code1', name: '김준수', phone: '010-1234-5678', isNew: false },
    { id: 11, active: '활성', userId: 'code1', name: '장창엽', phone: '010-1234-5678', isNew: false },
    { id: 10, active: '활성', userId: 'code1', name: '노수현', phone: '010-1234-5678', isNew: false },
    { id: 9, active: '활성', userId: 'code1', name: '김빅토리아노', phone: '010-1234-5678', isNew: false },
    { id: 8, active: '활성', userId: 'rhksflwkdlqjs', name: '관리자2', phone: '010-1234-5678', isNew: false },
    { id: 7, active: '비활성', userId: 'rhksflwkdlfqjs', name: '관리자1', phone: '010-1234-5678', isNew: false },
    { id: 6, active: '활성', userId: 'code1', name: '선장', phone: '010-1234-5678', isNew: false },
    { id: 5, active: '활성', userId: 'JJUBULL', name: '쭈불', phone: '010-1234-5678', isNew: false },
    { id: 4, active: '활성', userId: 'alololo', name: '알로스', phone: '010-1234-5678', isNew: false },
    { id: 3, active: '비활성', userId: 'num3', name: '삼번', phone: '010-1234-5678', isNew: false },
    { id: 2, active: '활성', userId: 'code1', name: '쭈꾸미', phone: '010-1234-5678', isNew: false },
    { id: 1, active: '비활성', userId: 'code1', name: '사용', phone: '010-1234-5678', isNew: false }
  ]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(assistantData.map(item => item.id));
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

  const handleNewManager = () => {
    const maxId = Math.max(...assistantData.map(item => item.id), 0);
    const newAdmin = {
      id: maxId + 1,
      active: '',
      userId: '',
      name: '',
      phone: '',
      isNew: true
    };
    setAssistantData([newAdmin, ...assistantData]);
  };

  const handleDelete = () => {
    if (selectedItems.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (window.confirm(`${selectedItems.length}개의 항목을 삭제하시겠습니까?`)) {
      setAssistantData(assistantData.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setAssistantData(assistantData.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <Layout>
      <div className="flex flex-col gap-[26px] px-[42px] py-[26px] pb-[300px]">
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
                        {item.isNew ? (
                          <input
                            type="text"
                            value={item.active}
                            onChange={(e) => handleFieldChange(item.id, 'active', e.target.value)}
                            placeholder="활성/비활성"
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
                            {item.active}
                          </span>
                        )}
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
    </Layout>
  );
}

export default AssistantManager;
