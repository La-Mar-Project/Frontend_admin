import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <>
      <Sidebar />
      <Header />
      <div className="bg-white layout-container" style={{ position: 'relative', width: '1440px', minWidth: '1440px', minHeight: '100vh', margin: 0, padding: 0 }}>
        {/* 메인 콘텐츠 영역 */}
        <main 
          className="bg-[#FFFFFF] flex flex-col"
          style={{ 
            marginLeft: '256px',
            marginTop: '58px',
            minHeight: 'calc(100vh - 58px)',
            width: 'calc(1440px - 256px)'
          }}
        >
          <div className="flex-1 pb-0 w-full">
            {children}
          </div>
          {/* 푸터 - 메인 콘텐츠 하단에 배치, 전체 너비 차지 */}
          <div className="footer-wrapper" style={{ 
            width: '100vw',
            flexShrink: 0
          }}>
            <Footer />
          </div>
        </main>
      </div>
    </>
  );
}

export default Layout;
