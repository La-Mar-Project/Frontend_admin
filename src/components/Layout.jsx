import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <>
      <Sidebar />
      <Header />
      <Footer />
      <div className="w-full h-screen bg-white overflow-hidden layout-container" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', height: '100vh' }}>
        <div className="relative bg-white layout-wrapper">
          {/* 메인 콘텐츠 영역 */}
          <main 
            className="bg-[#FFFFFF] overflow-y-auto"
            style={{ 
              marginLeft: '256px',
              marginTop: '58px',
              marginBottom: '161px',
              height: 'calc(100vh - 58px - 161px)',
              minHeight: 'calc(100vh - 58px - 161px)'
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

export default Layout;
