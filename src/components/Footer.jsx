import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* 상단: 로고 & 한줄 소개 */}
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">🫧 Sleepy</span>
            <p className="footer-tagline">나만의 슬라임을 찾는 가장 쉬운 방법</p>
          </div>
          <div className="footer-links-group">
            <div className="footer-links-col">
              <h4>서비스</h4>
              <Link to="/">슬라임 마켓</Link>
              <Link to="/community">커뮤니티</Link>
              <Link to="/community?tab=MEDIA">자랑 피드</Link>
            </div>
            <div className="footer-links-col">
              <h4>지원</h4>
              <a href="mailto:support@sleepy.kr">문의하기</a>
              <a href="#">이용약관</a>
              <a href="#">개인정보처리방침</a>
            </div>
            <div className="footer-links-col">
              <h4>개발자</h4>
              <a href="https://github.com/seungho7-1/Sleepy" target="_blank" rel="noreferrer">GitHub</a>
              <a href="/swagger-ui/index.html" target="_blank" rel="noreferrer">API 문서</a>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="footer-divider" />

        {/* 하단: 사업자 정보 & 카피라이트 */}
        <div className="footer-bottom">
          <div className="footer-legal">
            <p>Sleepy(슬리피)는 통신판매중개자이며, 통신판매의 당사자가 아닙니다.</p>
            <p>상품, 상품정보, 거래에 관한 의무와 책임은 판매자에게 있습니다.</p>
          </div>
          <p className="footer-copyright">
            © {new Date().getFullYear()} Sleepy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
