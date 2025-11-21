import Layout from '../components/Layout';

function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col gap-[26px] px-[42px] py-[26px]">
        <div className="flex flex-col gap-[10px] w-full mx-auto">
          <div className="flex flex-col gap-[10px] px-[60px] py-[40px] rounded-[20px] bg-[#F7F8FC] title-section" style={{ boxShadow: '0 4px 4px 0 rgba(39, 84, 218, 0.2)' }}>
            <h1 className="text-[30px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
              대시보드
            </h1>
            <p className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard', lineHeight: '23px' }}>
              대시보드를 통해 주요 정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>
        
        <div className="w-full max-w-[1099px] rounded-[20px] bg-white mx-auto px-[42px] py-[40px]" style={{ boxShadow: '0 4px 10px 0 rgba(39, 84, 218, 0.2)' }}>

        <div className="w-full max-w-[1040px] h-[266px] mt-[66px] relative">
          <div className="w-[245px] h-[266px] rounded-[20px] bg-[#EEF4FF] absolute left-0 top-0">
            <div className="absolute left-[20px] top-[22px] w-[182px] h-[52px] text-[#73757C] text-[22px] font-medium leading-normal" style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
              오늘의 예약자 페이지 방문자 수
            </div>
            <div className="inline-flex px-[40px] py-[30px] justify-center items-center gap-[10px] absolute left-[86px] top-[152px]">
              <div className="text-[#172348] text-[45px] font-bold leading-normal" style={{ fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif' }}>
                198
              </div>
            </div>
          </div>

          <div className="w-[245px] h-[266px] rounded-[20px] bg-[#EEF4FF] absolute left-[265px] top-0"></div>
          <div className="w-[245px] h-[266px] rounded-[20px] bg-[#EEF4FF] absolute left-[531px] top-0"></div>
          <div className="w-[245px] h-[266px] rounded-[20px] bg-[#EEF4FF] absolute left-[795px] top-0"></div>
        </div>

        <div className="inline-flex px-[30px] pb-[25px] items-center gap-[20px] mt-[659px] w-full max-w-[1100px] h-[291px]">
          <div className="flex w-[245px] h-[266px] p-[10px] flex-col items-start gap-[10px] rounded-[20px] bg-[#EEF4FF]"></div>
          <div className="w-[245px] h-[266px] rounded-[20px] bg-[#EEF4FF]"></div>
          <div className="w-[245px] h-[266px] rounded-[20px] bg-[#EEF4FF]"></div>
          <div className="w-[245px] h-[266px] rounded-[20px] bg-[#EEF4FF]"></div>
        </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
