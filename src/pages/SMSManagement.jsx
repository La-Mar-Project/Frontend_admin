import Layout from '../components/Layout';

function SMSManagement() {
  return (
    <Layout>
      <div className="flex flex-col items-start gap-[26px] pb-[300px] px-[42px] py-[26px] w-full max-w-[1119px] mx-auto">
        <div className="flex flex-col items-start gap-[10px] w-full mx-auto">
          <div className="flex flex-col items-start gap-[10px] rounded-[20px] px-[60px] py-[40px] title-section" style={{ background: 'rgba(247, 248, 252, 1)', boxShadow: '0 4px 4px 0 rgba(39, 84, 218, 0.2)' }}>
            <div className="font-bold text-[30px] leading-normal" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
              SMS 문구
            </div>
            <div className="font-normal text-[18px] leading-normal" style={{ color: 'rgba(39, 44, 60, 1)', fontFamily: 'Pretendard' }}>
              예약자/관리자 SMS 문구를 확인할 수 있습니다.
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-[65px]" style={{ paddingLeft: '42px' }}>
          <div className="flex flex-col items-start gap-[10px]">
            <div className="flex items-center justify-center gap-[10px] px-[60px] py-[40px]">
              <div className="font-bold text-[25px] leading-normal" style={{ color: '#1840B8', fontFamily: 'Pretendard' }}>
                예약자 SMS
              </div>
            </div>

            <div className="flex flex-col items-start justify-center gap-[40px] self-stretch" style={{ paddingLeft: '122px' }}>
              {/* 첫 번째 행 */}
              <div className="flex items-start gap-[30px]">
                {/* 예약접수 */}
                <div className="flex flex-col items-start w-[380px]" style={{ aspectRatio: '380/280' }}>
                  <div className="flex items-center justify-center gap-[10px] w-[380px] px-[20px] py-[18px] rounded-t-[10px] border-2" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#F7F8FC' }}>
                    <div className="font-medium text-[22px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      예약접수
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] self-stretch px-[35px] py-[20px] rounded-b-[10px] border-2 flex-1" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#FFF' }}>
                    <div className="flex-1 font-normal text-[18px] leading-[27px] text-justify whitespace-pre-line" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      [예약접수 확인 안내문자]

안녕하세요 쭈불 낚시입니다. 25.09.17(수) 쭈갑 예약 접수 확인 안내 문자 드립니다. 입금 완료 후에 예약이 확정되니, 아래의 계좌로 금액만큼 입금해주시길 바랍니다.

[예약정보]
출항일: 25.09.17(수) 3물 쭈갑
예약자명: 원종윤
닉네임: 쭈불종윤
예약인원: 1명

입금계좌: 신한 110-345-678910
입금금액: 90,000원
                    </div>
                  </div>
                </div>

                {/* 마감 12시간 전 입금 안내 */}
                <div className="flex flex-col items-start w-[380px]" style={{ aspectRatio: '380/280' }}>
                  <div className="flex items-center justify-center gap-[10px] w-[380px] px-[20px] py-[18px] rounded-t-[10px] border-2" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#F7F8FC' }}>
                    <div className="font-medium text-[22px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      마감 12시간 전 입금 안내
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] self-stretch px-[35px] py-[20px] rounded-b-[10px] border-2 flex-1" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#FFF' }}>
                    <div className="flex-1 font-normal text-[18px] leading-[27px] text-justify whitespace-pre-line" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      [입금 재안내문자]

안녕하세요 쭈불 낚시입니다. 25.10.30(목) 푸갑 예약 입금 재안내 문자 드립니다. 입금 마감시간이 이후에는 예약이 자동 취소되니, 입금 마감시간 전까지 아래의 계좌로 금액만큼 입금해주시길 바랍니다.

[예약정보]
출항일: 25.09.17(수) 3물 쭈갑
예약자명: 원종윤
닉네임: 쭈불종윤
예약인원: 1명

입금계좌: 신한 110-345-678910
입금금액: 90,000원
                    </div>
                  </div>
                </div>
              </div>

              {/* 두 번째 행 */}
              <div className="flex items-start gap-[30px]">
                {/* 출조 1일 전 */}
                <div className="flex flex-col items-start w-[380px]" style={{ aspectRatio: '380/280' }}>
                  <div className="flex items-center justify-center gap-[10px] w-[380px] px-[20px] py-[18px] rounded-t-[10px] border-2" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#F7F8FC' }}>
                    <div className="font-medium text-[22px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      출조 1일 전
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] self-stretch px-[35px] py-[20px] rounded-b-[10px] border-2 flex-1" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#FFF' }}>
                    <div className="flex-1 font-normal text-[18px] leading-[27px] text-justify whitespace-pre-line" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      [출조 1일 전 안내문자]

안녕하세요 쭈불 낚시입니다.
25.10.30(목) 쭈갑 예약 접수 확인 안내 문자
드립니다. 아래의 출항 시간을 잘 확인하시어
당일 출조에 차질 없도록 도와주시면 감사하
겠습니다. 출항 항구 및 상세 정보는 쭈불 블
로그를 확인해주시기 바랍니다. 상세 예약정
보는 쭈불 예약자 페에지의 마이페이지에서
도 확인하실 수 있습니다. 출항일 뵙겠습니
다!

쭈불 블로그: (대충주소)
쭈불 소개: (주소)
                    </div>
                  </div>
                </div>

                {/* 입금확인 */}
                <div className="flex flex-col items-start w-[380px]" style={{ aspectRatio: '380/280' }}>
                  <div className="flex items-center justify-center gap-[10px] w-[380px] px-[20px] py-[18px] rounded-t-[10px] border-2" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#F7F8FC' }}>
                    <div className="font-medium text-[22px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      입금확인
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] self-stretch px-[35px] py-[20px] rounded-b-[10px] border-2 flex-1" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#FFF' }}>
                    <div className="flex-1 font-normal text-[18px] leading-[27px] text-justify whitespace-pre-line" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      [입금확인 안내문자]

안녕하세요 쭈불 낚시입니다.
25.10.30(목) 쭈갑 예약 접수 확인 안내 문자
드립니다. 아래의 출항 시간을 잘 확인하시어
당일 출조에 차질 없도록 도와주시면 감사하
겠습니다. 출항 항구 및 상세 정보는 쭈불 블
로그를 확인해주시기 바랍니다. 상세 예약정
보는 쭈불 예약자 페에지의 마이페이지에서
도 확인하실 수 있습니다. 출항일 뵙겠습니
다!

쭈불 블로그: (대충주소)
쭈불 소개: (주소)
                    </div>
                  </div>
                </div>
              </div>

              {/* 세 번째 행 */}
              <div className="flex items-start gap-[30px]">
                {/* 취소접수 */}
                <div className="flex flex-col items-start w-[380px]" style={{ aspectRatio: '380/280' }}>
                  <div className="flex items-center justify-center gap-[10px] w-[380px] px-[20px] py-[18px] rounded-t-[10px] border-2" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#F7F8FC' }}>
                    <div className="font-medium text-[22px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      취소접수
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] self-stretch px-[35px] py-[20px] rounded-b-[10px] border-2 flex-1" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#FFF' }}>
                    <div className="flex-1 font-normal text-[18px] leading-[27px] text-justify whitespace-pre-line" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      [취소접수 확인 안내문자]

안녕하세요 쭈불 낚시입니다. 25.09.17(수) 쭈갑 취소 접수 확인 안내 문자 드립니다. 환불 받으실 계좌번호를 전송해주세요.

[취소정보]
출항일: 25.09.17(수) 3물 쭈갑
예약자명: 원종윤
닉네임: 쭈불종윤
예약인원: 1명

환불금액: 90,000원
                    </div>
                  </div>
                </div>

                {/* 자동취소 안내 */}
                <div className="flex flex-col items-start w-[380px]" style={{ aspectRatio: '380/280' }}>
                  <div className="flex items-center justify-center gap-[10px] w-[380px] px-[20px] py-[18px] rounded-t-[10px] border-2" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#F7F8FC' }}>
                    <div className="font-medium text-[22px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      자동취소 안내
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] self-stretch px-[35px] py-[20px] rounded-b-[10px] border-2 flex-1" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#FFF' }}>
                    <div className="flex-1 font-normal text-[18px] leading-[27px] text-justify whitespace-pre-line" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      [자동취소 안내문자]

안녕하세요 쭈불 낚시입니다. 25.10.30(목) 쭈갑 자동 취소 안내 문자 드립니다. 입금 마감일 내로 입금이 완료되지 않아 예약이 자동 취소되었음을 안내 드립니다.

[취소정보]
출항일: 25.09.17(수) 3물 쭈갑
예약자명: 원종윤
닉네임: 쭈불종윤
예약인원: 1명
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 관리자 SMS */}
          <div className="flex flex-col items-start gap-[10px]">
            <div className="flex items-center justify-center gap-[10px] px-[60px] py-[40px]">
              <div className="font-bold text-[25px] leading-normal" style={{ color: '#1840B8', fontFamily: 'Pretendard' }}>
                관리자 SMS
              </div>
            </div>

            <div className="flex items-center self-stretch" style={{ paddingLeft: '122px' }}>
              <div className="flex items-start gap-[30px]">
                {/* 예약접수 안내 */}
                <div className="flex flex-col items-start w-[380px]" style={{ aspectRatio: '380/280' }}>
                  <div className="flex items-center justify-center gap-[10px] w-[380px] px-[20px] py-[18px] rounded-t-[10px] border-2" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#F7F8FC' }}>
                    <div className="font-medium text-[22px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      예약접수 안내
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] self-stretch px-[35px] py-[20px] rounded-b-[10px] border-2 flex-1" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#FFF' }}>
                    <div className="flex-1 font-normal text-[18px] leading-[27px] text-justify whitespace-pre-line" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      [예약접수]
새로운 예약이 접수되었습니다.

출항일: 25.09.17(수) 3물 쭈갑
예약자명: 원종윤
닉네임: 쭈불종윤
예약인원: 1명
입금금액: 90,000원
                    </div>
                  </div>
                </div>

                {/* 취소접수 안내 */}
                <div className="flex flex-col items-start w-[380px]" style={{ aspectRatio: '380/280' }}>
                  <div className="flex items-center justify-center gap-[10px] w-[380px] px-[20px] py-[18px] rounded-t-[10px] border-2" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#F7F8FC' }}>
                    <div className="font-medium text-[22px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      취소접수 안내
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-[10px] self-stretch px-[35px] py-[20px] rounded-b-[10px] border-2 flex-1" style={{ borderColor: 'rgba(223, 231, 244, 1)', background: '#FFF' }}>
                    <div className="flex-1 font-normal text-[18px] leading-[27px] text-justify whitespace-pre-line" style={{ color: '#272C3C', fontFamily: 'Pretendard' }}>
                      [취소접수]
새로운 취소가 접수되었습니다.

출항일: 25.09.17(수) 3물 쭈갑
취소자명: 원종윤
닉네임: 쭈불종윤
취소인원: 1명
환불금액: 90,000원
                    </div>
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

export default SMSManagement;
