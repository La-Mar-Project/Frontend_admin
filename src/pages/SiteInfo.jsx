import Layout from '../components/Layout';

function SiteInfo() {
  return (
    <Layout>
      <div className="px-[42px] py-[26px]">
        <div className="flex flex-col gap-[10px] w-full mx-auto">
          <div className="flex flex-col gap-[10px] px-[60px] py-[40px] rounded-[20px] bg-[#F7F8FC] title-section" style={{ boxShadow: '0 4px 4px 0 rgba(39, 84, 218, 0.2)' }}>
            <h1 className="text-[30px] font-bold text-[#272C3C]" style={{ fontFamily: 'Pretendard' }}>
              사이트정보
            </h1>
            <p className="text-[18px] font-normal text-[#272C3C]" style={{ fontFamily: 'Pretendard', lineHeight: '23px' }}>
              사이트 정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-[20px] p-[40px] shadow-md mt-[26px]">
          <p>사이트정보 페이지입니다.</p>
        </div>
      </div>
    </Layout>
  );
}

export default SiteInfo;

