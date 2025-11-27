import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../utils/api';

function ShipInfo() {
  const [viewMode, setViewMode] = useState('table');
  const [selectedShips, setSelectedShips] = useState([]);
  const [ships, setShips] = useState([]);
  const [isAddingNewShip, setIsAddingNewShip] = useState(false);
  const [newShip, setNewShip] = useState({
    fishType: '',
    price: '',
    maxHeadCount: '',
    notification: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // 배 목록 불러오기
  const loadShips = async (page = 0) => {
    console.log('[ShipInfo] loadShips 호출됨, page:', page);
    setLoading(true);
    try {
      console.log('[ShipInfo] API 호출 시작: /ships?page=' + page + '&size=' + pageSize);
      const response = await apiGet(`/ships?page=${page}&size=${pageSize}`);
      console.log('[ShipInfo] API 응답 받음:', response);
      
      // 응답 Content-Type 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // HTML 응답인 경우 에러 처리
        if (contentType && contentType.includes('text/html')) {
          const text = await response.text();
          console.error('서버가 HTML을 반환했습니다:', text.substring(0, 200));
          alert('서버 오류가 발생했습니다. API 설정을 확인해주세요.\n\n.env 파일에 VITE_API_BASE_URL이 설정되어 있는지 확인하세요.');
          return;
        }
      }
      
      if (response.ok) {
        const result = await response.json();
        console.log('[ShipInfo] API 응답 데이터:', result);
        console.log('[ShipInfo] result.success:', result.success);
        console.log('[ShipInfo] result.data:', result.data);
        
        if (result.success && result.data) {
          console.log('[ShipInfo] result.data.content:', result.data.content);
          console.log('[ShipInfo] result.data.content.length:', result.data.content?.length);
          
          // API 응답을 컴포넌트에서 사용하는 형식으로 변환
          const shipsData = result.data.content.map((item, index) => ({
            id: item.ship.shipId,
            shipId: item.ship.shipId,
            order: result.data.totalElements - (result.data.page * result.data.size + index),
            name: item.ship.fishType || '',
            price: item.ship.price ? item.ship.price.toLocaleString() : '0',
            capacity: item.ship.maxHeadCount?.toString() || '0',
            description: item.ship.notification || '',
            maxHeadCount: item.ship.maxHeadCount,
            notification: item.ship.notification
          }));
          setShips(shipsData);
          setTotalPages(result.data.totalPages);
          setTotalElements(result.data.totalElements);
          setCurrentPage(result.data.page);
        } else {
          console.warn('API 응답에 데이터가 없습니다:', result);
          setShips([]);
        }
      } else {
        // HTTP 오류 응답 처리
        const errorText = await response.text();
        console.error('배 목록 불러오기 실패:', response.status, response.statusText);
        console.error('응답 내용:', errorText.substring(0, 200));
        
        if (response.status === 401) {
          alert('인증이 필요합니다. 로그인을 다시 해주세요.');
        } else if (response.status === 404) {
          alert('API 엔드포인트를 찾을 수 없습니다. API URL을 확인해주세요.');
        } else {
          alert(`서버 오류가 발생했습니다: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('배 목록 불러오기 중 오류 발생:', error);
      
      // 네트워크 오류나 JSON 파싱 오류
      if (error.message && error.message.includes('JSON')) {
        alert('서버 응답 형식 오류가 발생했습니다.\n\n.env 파일에 VITE_API_BASE_URL이 올바르게 설정되어 있는지 확인하세요.\n현재 설정: ' + (import.meta.env.VITE_API_BASE_URL || '(설정되지 않음)'));
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('네트워크 오류가 발생했습니다. 서버에 연결할 수 없습니다.');
      } else {
        alert('오류가 발생했습니다: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 배 목록 불러오기
  useEffect(() => {
    loadShips(0);
  }, []);

  // 새 배 등록하기 버튼 클릭
  const handleAddNewShip = () => {
    setIsAddingNewShip(true);
    setNewShip({
      fishType: '',
      price: '',
      maxHeadCount: '',
      notification: ''
    });
  };

  // 새 배 저장
  const handleSaveNewShip = async () => {
    if (!newShip.fishType || !newShip.price || !newShip.maxHeadCount) {
      alert('어종, 금액, 승선인원을 모두 입력해주세요.');
      return;
    }

    try {
      const response = await apiPost('/ships', {
        fishType: newShip.fishType,
        price: parseInt(newShip.price.replace(/,/g, '')) || 0,
        maxHeadCount: parseInt(newShip.maxHeadCount) || 0,
        notification: newShip.notification || ''
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setIsAddingNewShip(false);
          setNewShip({
            fishType: '',
            price: '',
            maxHeadCount: '',
            notification: ''
          });
          // 배 목록 다시 불러오기
          loadShips(currentPage);
        } else {
          alert('배 등록에 실패했습니다: ' + (result.message || '알 수 없는 오류'));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('배 등록에 실패했습니다: ' + (errorData.message || response.statusText));
      }
    } catch (error) {
      console.error('배 등록 중 오류 발생:', error);
      alert('배 등록 중 오류가 발생했습니다.');
    }
  };

  // 새 배 등록 취소
  const handleCancelNewShip = () => {
    setIsAddingNewShip(false);
    setNewShip({
      fishType: '',
      price: '',
      maxHeadCount: '',
      notification: ''
    });
  };

  // 배 삭제
  const handleDeleteShips = async () => {
    if (selectedShips.length === 0) {
      alert('삭제할 배를 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedShips.length}개의 배를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await apiPost('/ships/delete', {
        shipIds: selectedShips
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSelectedShips([]);
          // 배 목록 다시 불러오기
          loadShips(currentPage);
          alert('배가 삭제되었습니다.');
        } else {
          alert('배 삭제에 실패했습니다: ' + (result.message || '알 수 없는 오류'));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('배 삭제에 실패했습니다: ' + (errorData.message || response.statusText));
      }
    } catch (error) {
      console.error('배 삭제 중 오류 발생:', error);
      alert('배 삭제 중 오류가 발생했습니다.');
    }
  };

  const toggleShipSelection = (shipId) => {
    setSelectedShips(prev =>
      prev.includes(shipId)
        ? prev.filter(id => id !== shipId)
        : [...prev, shipId]
    );
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadShips(newPage);
    }
  };

  const renderNewShipCard = () => (
    <div className="flex w-[228px] flex-col items-start rounded-[10px] border-2 border-[#2754DA]">
      <div className="flex w-[228px] h-[48px] px-0 pr-0 pl-[31px] py-[8px] justify-end items-center gap-[8px] rounded-tl-[10px] rounded-tr-[10px] bg-[rgba(238,244,255,1)]">
        <div className="flex w-[156px] h-[27px] px-0 py-[3px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[5px] border border-[rgba(223,231,244,1)] bg-[#F7F8FC]">
          <input
            type="text"
            placeholder="어종"
            value={newShip.fishType}
            onChange={(e) => setNewShip({...newShip, fishType: e.target.value})}
            className="w-full text-center text-[rgba(115,117,124,1)] font-medium text-[14px] leading-normal bg-transparent outline-none"
            style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}
          />
        </div>
        <div className="flex pr-[13px] items-center gap-[10px]">
          <svg width="33" height="20" viewBox="0 0 33 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 0.5H15C17.4853 0.5 19.5 2.51472 19.5 5V15C19.5 17.4853 17.4853 19.5 15 19.5H5C2.51472 19.5 0.5 17.4853 0.5 15V5C0.5 2.51472 2.51472 0.5 5 0.5Z"
                  fill="white"
                  stroke="#1840B8"/>
          </svg>
        </div>
      </div>
      <div className="flex h-[105px] px-[14px] py-[12px] flex-col items-start gap-[10px] self-stretch rounded-bl-[10px] rounded-br-[10px] bg-white">
        <div className="flex h-[21px] justify-between items-center flex-shrink-0 self-stretch">
          <div className="text-[rgba(39,44,60,1)] font-normal text-[16px] leading-normal"
               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
            금액
          </div>
          <div className="flex h-[23px] items-center gap-[5px]">
            <div className="flex w-[100px] h-[23px] px-0 pr-[5px] pl-0 py-[2px] justify-end items-center gap-[10px] rounded-[5px] border border-[rgba(223,231,244,1)] bg-[#F7F8FC]">
              <input
                type="text"
                placeholder="금액"
                value={newShip.price}
                onChange={(e) => setNewShip({...newShip, price: e.target.value})}
                className="w-full text-right text-[rgba(115,117,124,1)] font-normal text-[14px] leading-normal bg-transparent outline-none pr-1"
                style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}
              />
            </div>
            <div className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal"
                 style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
              원
            </div>
          </div>
        </div>
        <div className="flex h-[21px] justify-between items-center flex-shrink-0 self-stretch">
          <div className="text-[rgba(39,44,60,1)] font-normal text-[16px] leading-normal"
               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
            인원
          </div>
          <div className="flex h-[23px] items-center gap-[5px]">
            <div className="flex w-[100px] h-[23px] px-0 pr-[5px] pl-0 py-[2px] justify-end items-center gap-[10px] rounded-[5px] border border-[rgba(223,231,244,1)] bg-[#F7F8FC]">
              <input
                type="text"
                placeholder="인원"
                value={newShip.capacity}
                onChange={(e) => setNewShip({...newShip, capacity: e.target.value})}
                className="w-full text-right text-[rgba(115,117,124,1)] font-normal text-[14px] leading-normal bg-transparent outline-none pr-1"
                style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}
              />
            </div>
            <div className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal"
                 style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
              명
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-[10px] self-stretch">
          <div className="flex h-[23px] px-[7px] py-[2px] items-center gap-[10px] self-stretch rounded-[5px] border border-[rgba(223,231,244,1)] bg-[#F7F8FC]">
            <input
              type="text"
              placeholder="메모"
              value={newShip.memo}
              onChange={(e) => setNewShip({...newShip, memo: e.target.value})}
              className="w-full text-[rgba(115,117,124,1)] font-normal text-[14px] leading-normal bg-transparent outline-none"
              style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderShipCard = (ship) => (
    <div key={ship.id} className="flex w-[228px] flex-col items-start rounded-[10px] border-2 border-[rgba(223,231,244,1)]">
      <div className="flex w-[228px] h-[45px] px-0 pr-0 pl-[33px] py-[12px] justify-end items-center gap-[10px] rounded-tl-[10px] rounded-tr-[10px] bg-[rgba(238,244,255,1)]">
        <div className="flex-1 text-center text-[rgba(39,44,60,1)] font-medium text-[18px] leading-normal"
             style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
          {ship.name}
        </div>
        <div className="flex pr-[13px] items-center gap-[10px]">
          <svg
            onClick={() => toggleShipSelection(ship.id)}
            className="cursor-pointer"
            width="33" height="20" viewBox="0 0 33 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 0.5H15C17.4853 0.5 19.5 2.51472 19.5 5V15C19.5 17.4853 17.4853 19.5 15 19.5H5C2.51472 19.5 0.5 17.4853 0.5 15V5C0.5 2.51472 2.51472 0.5 5 0.5Z"
                  fill={selectedShips.includes(ship.id) ? "#1840B8" : "white"}
                  stroke="#1840B8"/>
            {selectedShips.includes(ship.id) && (
              <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </div>
      </div>
      <div className="flex px-[14px] py-[12px] flex-col items-start gap-[10px] self-stretch rounded-bl-[10px] rounded-br-[10px] bg-white">
        <div className="flex justify-between items-center self-stretch">
          <div className="text-[rgba(39,44,60,1)] font-normal text-[16px] leading-normal"
               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
            금액
          </div>
          <div className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal"
               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
            {ship.price}원
          </div>
        </div>
        <div className="flex justify-between items-center self-stretch">
          <div className="text-[rgba(39,44,60,1)] font-normal text-[16px] leading-normal"
               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
            인원
          </div>
          <div className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal"
               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
            {ship.capacity}명
          </div>
        </div>
        <div className="flex items-center gap-[10px] self-stretch">
          <div className="text-[rgba(39,44,60,1)] font-normal text-[16px] leading-normal"
               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
            {ship.description}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="flex w-full max-w-[1183px] flex-col items-start bg-white mx-auto" style={{ minHeight: '1679px' }}>
        <div className="flex w-full max-w-[1119px] flex-col items-start gap-[26px] mx-auto" style={{ minHeight: '1381px' }}>
          <div className="flex pl-[42px] flex-col items-start gap-[10px] self-stretch">
            <div className="flex w-full mx-auto px-[60px] py-[40px] flex-col justify-center items-start gap-[10px] rounded-[20px] title-section" 
                 style={{ background: 'rgba(247, 248, 252, 1)', boxShadow: '0 4px 4px 0 rgba(39, 84, 218, 0.2)' }}>
              <div className="text-[#272C3C] font-bold text-[30px] leading-normal" 
                   style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                배 정보관리
              </div>
              <div className="text-[#272C3C] font-normal text-[18px] leading-[23px]" 
                   style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                배 정보를 등록, 수정, 삭제할 수 있습니다.<br />
                드래그&드랍으로 배 순서를 조정할 수 있습니다.
              </div>
            </div>
          </div>

          <div className="flex pl-[42px] flex-col items-start gap-[65px]">
            <div className="flex flex-col items-start gap-[10px]">
              <div className="flex px-[60px] py-[40px] justify-center items-center gap-[10px]">
                <div className="text-[#1840B8] font-bold text-[25px] leading-normal" 
                     style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                  배 목록
                </div>
              </div>

              <div className="flex pl-[60px] flex-col justify-center items-start gap-[40px] self-stretch">
                <div className="flex w-[986px] flex-col items-end gap-[15px]">
                  <div className="flex justify-between items-start self-stretch">
                    <div className="flex px-[10px] items-center gap-[10px]">
                      <button 
                        onClick={() => setViewMode('table')}
                        className={`flex h-[36px] px-[20px] py-[4px] justify-center items-center gap-[10px] rounded-[20px] ${
                          viewMode === 'table' ? 'bg-[rgba(242,242,242,1)]' : 'bg-white'
                        }`}>
                        <div className="text-[#1840B8] font-medium text-[18px] leading-normal" 
                             style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                          표로 보기
                        </div>
                      </button>
                      <button 
                        onClick={() => setViewMode('card')}
                        className={`flex h-[36px] px-[20px] py-[4px] justify-center items-center gap-[10px] rounded-[20px] ${
                          viewMode === 'card' ? 'bg-[rgba(242,242,242,1)]' : 'bg-white'
                        }`}>
                        <div className="text-[#1840B8] font-medium text-[18px] leading-normal" 
                             style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                          카드로 보기
                        </div>
                      </button>
                    </div>

                    <div className="flex px-[10px] items-center gap-[10px]">
                      <button 
                        onClick={handleAddNewShip}
                        disabled={isAddingNewShip}
                        className="flex h-[36px] px-[20px] py-[4px] justify-center items-center gap-[10px] rounded-[20px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(238,244,255,1)] disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="text-[#1840B8] font-medium text-[16px] leading-normal" 
                             style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                          새 배 등록하기
                        </div>
                      </button>
                      <button 
                        onClick={handleDeleteShips}
                        disabled={selectedShips.length === 0}
                        className="flex h-[36px] px-[20px] py-[4px] justify-center items-center gap-[10px] rounded-[20px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(238,244,255,1)] disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="text-[#1840B8] font-medium text-[16px] leading-normal" 
                             style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                          삭제하기
                        </div>
                      </button>
                    </div>
                  </div>

{viewMode === 'card' ? (
                    <div className="flex w-[987px] pt-[10px] flex-col items-start gap-[23px]">
                      {loading ? (
                        <div className="flex items-center justify-center w-full h-[200px]">
                          <div className="text-[rgba(115,117,124,1)] font-normal text-[18px]"
                               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                            로딩 중...
                          </div>
                        </div>
                      ) : (
                        <>
                          {isAddingNewShip && renderNewShipCard()}
                          <div className="flex items-center gap-[25px] self-stretch flex-wrap">
                            {ships.slice(0, 3).map((ship) => renderShipCard(ship))}
                          </div>
                          {ships.length > 3 && (
                            <div className="flex items-center gap-[25px] self-stretch flex-wrap">
                              {ships.slice(3, 7).map((ship) => renderShipCard(ship))}
                            </div>
                          )}
                          {ships.length > 7 && (
                            <div className="flex items-center gap-[25px]">
                              {ships.slice(7, 9).map((ship) => renderShipCard(ship))}
                            </div>
                          )}
                          {ships.length === 0 && !isAddingNewShip && (
                            <div className="flex items-center justify-center w-full h-[200px]">
                              <div className="text-[rgba(115,117,124,1)] font-normal text-[18px]"
                                   style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                                등록된 배가 없습니다.
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex w-[986px] flex-col items-start">
                      <div className="flex items-center self-stretch">
                        <div className="flex w-[66px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(238,244,255,1)] h-[45px]">
                          <div className="text-[rgba(39,44,60,1)] font-medium text-[20px] leading-normal whitespace-nowrap text-center"
                               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                            선택
                          </div>
                        </div>
                        <div className="flex w-[66px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(238,244,255,1)] h-[45px]">
                          <div className="text-[rgba(39,44,60,1)] font-medium text-[20px] leading-normal whitespace-nowrap text-center"
                               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                            순번
                          </div>
                        </div>
                        <div className="flex w-[200px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(238,244,255,1)] h-[45px]">
                          <div className="text-[rgba(39,44,60,1)] font-medium text-[20px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
                               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                            어종
                          </div>
                        </div>
                        <div className="flex w-[155px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(238,244,255,1)] h-[45px]">
                          <div className="text-[rgba(39,44,60,1)] font-medium text-[20px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
                               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                            금액
                          </div>
                        </div>
                        <div className="flex w-[155px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(238,244,255,1)] h-[45px]">
                          <div className="text-[rgba(39,44,60,1)] font-medium text-[20px] leading-normal whitespace-nowrap text-center"
                               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                            승선인원
                          </div>
                        </div>
                        <div className="flex px-[20px] py-[12px] justify-center items-center gap-[10px] flex-1 border-2 border-[rgba(223,231,244,1)] bg-[rgba(238,244,255,1)] h-[45px]">
                          <div className="text-[rgba(39,44,60,1)] font-medium text-[20px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
                               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                            메모
                          </div>
                        </div>
                      </div>
                      {/* 새 배 등록 행 */}
                      {isAddingNewShip && (
                        <div className="flex items-center self-stretch bg-[rgba(255,255,224,0.3)]">
                          <div className="flex w-[66px] h-[48px] px-[20px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(255,255,224,0.3)]">
                            <div className="w-[24px] h-[24px]"></div>
                          </div>
                          <div className="flex w-[66px] h-[48px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(255,255,224,0.3)]">
                            <div className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal whitespace-nowrap text-center"
                                 style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                              {totalElements + 1}
                            </div>
                          </div>
                          <div className="flex w-[200px] h-[48px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(255,255,224,0.3)]">
                            <input
                              type="text"
                              placeholder="어종"
                              value={newShip.fishType}
                              onChange={(e) => setNewShip({...newShip, fishType: e.target.value})}
                              className="w-full text-center text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal bg-transparent outline-none border-none"
                              style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}
                            />
                          </div>
                          <div className="flex w-[155px] h-[48px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(255,255,224,0.3)]">
                            <input
                              type="text"
                              placeholder="금액"
                              value={newShip.price}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setNewShip({...newShip, price: value});
                              }}
                              onBlur={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setNewShip({...newShip, price: value ? parseInt(value).toLocaleString() : ''});
                              }}
                              className="w-full text-center text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal bg-transparent outline-none border-none"
                              style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}
                            />
                            <span className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal">원</span>
                          </div>
                          <div className="flex w-[155px] h-[48px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(255,255,224,0.3)]">
                            <input
                              type="text"
                              placeholder="승선인원"
                              value={newShip.maxHeadCount}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setNewShip({...newShip, maxHeadCount: value});
                              }}
                              className="w-full text-center text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal bg-transparent outline-none border-none"
                              style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}
                            />
                            <span className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal">명</span>
                          </div>
                          <div className="flex h-[48px] px-[20px] py-[12px] justify-center items-center gap-[10px] flex-1 border-2 border-[rgba(223,231,244,1)] bg-[rgba(255,255,224,0.3)]">
                            <input
                              type="text"
                              placeholder="메모"
                              value={newShip.notification}
                              onChange={(e) => setNewShip({...newShip, notification: e.target.value})}
                              className="w-full text-center text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal bg-transparent outline-none border-none"
                              style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}
                            />
                          </div>
                          <div className="flex h-[48px] px-[10px] py-[12px] justify-center items-center gap-[5px] border-2 border-[rgba(223,231,244,1)] bg-[rgba(255,255,224,0.3)]">
                            <button
                              onClick={handleSaveNewShip}
                              className="px-[10px] py-[5px] text-[#1840B8] font-medium text-[14px] rounded-[5px] hover:bg-[rgba(238,244,255,1)]"
                              style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}
                            >
                              저장
                            </button>
                            <button
                              onClick={handleCancelNewShip}
                              className="px-[10px] py-[5px] text-[#73757C] font-medium text-[14px] rounded-[5px] hover:bg-[rgba(242,242,242,1)]"
                              style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      )}

                      {loading ? (
                        <div className="flex items-center justify-center w-full h-[200px]">
                          <div className="text-[rgba(115,117,124,1)] font-normal text-[18px]"
                               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                            로딩 중...
                          </div>
                        </div>
                      ) : ships.length === 0 && !isAddingNewShip ? (
                        <div className="flex items-center justify-center w-full h-[200px]">
                          <div className="text-[rgba(115,117,124,1)] font-normal text-[18px]"
                               style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                            등록된 배가 없습니다.
                          </div>
                        </div>
                      ) : (
                        ships.map((ship) => (
                          <div key={ship.id} className="flex items-center self-stretch">
                            <div className="flex w-[66px] h-[48px] px-[20px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-white">
                              <svg
                                onClick={() => toggleShipSelection(ship.id)}
                                className="cursor-pointer"
                                width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 10.5H28C31.0376 10.5 33.5 12.9624 33.5 16V28C33.5 31.0376 31.0376 33.5 28 33.5H16C12.9624 33.5 10.5 31.0376 10.5 28V16C10.5 12.9624 12.9624 10.5 16 10.5Z"
                                      fill={selectedShips.includes(ship.id) ? "#1840B8" : "white"}
                                      stroke="#1840B8"/>
                                {selectedShips.includes(ship.id) && (
                                  <path d="M16 22L21 27L28 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                )}
                              </svg>
                            </div>
                            <div className="flex w-[66px] h-[48px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-white">
                              <div className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal whitespace-nowrap text-center"
                                   style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                                {ship.order}
                              </div>
                            </div>
                            <div className="flex w-[200px] h-[48px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-white">
                              <div className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
                                   style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                                {ship.name}
                              </div>
                            </div>
                            <div className="flex w-[155px] h-[48px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-white">
                              <div className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
                                   style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                                {ship.price ? `${ship.price}원` : '-'}
                              </div>
                            </div>
                            <div className="flex w-[155px] h-[48px] px-[20px] py-[12px] justify-center items-center gap-[10px] border-2 border-[rgba(223,231,244,1)] bg-white">
                              <div className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal whitespace-nowrap text-center"
                                   style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                                {ship.capacity ? `${ship.capacity}명` : '-'}
                              </div>
                            </div>
                            <div className="flex h-[48px] px-[20px] py-[12px] justify-center items-center gap-[10px] flex-1 border-2 border-[rgba(223,231,244,1)] bg-white">
                              <div className="text-[rgba(39,44,60,1)] font-normal text-[18px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
                                   style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                                {ship.description || '-'}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {totalPages > 0 && (
              <div className="flex w-full max-w-[1056px] py-[50px] justify-center items-center gap-[10px] bg-white">
                <div className="flex items-center gap-[20px]">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 11L10 20.5L20 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M30 11L20 20.5L30 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="30" height="41" viewBox="0 0 30 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 11L10 20.5L20 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-[4px]">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex w-[40px] px-[10px] py-[10px] flex-col justify-center items-center gap-[10px] rounded-[5px] ${
                          currentPage === pageNum ? 'border border-[#73757C] bg-[#F2F2F2]' : ''
                        }`}
                      >
                        <div className="text-center font-medium text-[18px] leading-normal text-[#73757C]" 
                             style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                          {pageNum + 1}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-[20px]">
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="30" height="41" viewBox="0 0 30 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 11L20 20.5L10 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 11L11.5 20.5L1.5 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.5 11L21.5 20.5L11.5 30" stroke="#73757C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ShipInfo;
