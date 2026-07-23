import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  
  // 숏폼 페이지에서는 푸터를 숨김
  if (location.pathname === '/shorts') return null;

  return (
    <footer style={{ backgroundColor: '#0B0A1A', padding: '5rem 2rem 3rem 2rem', marginTop: 'auto', color: '#8a8e9e', fontFamily: 'Pretendard, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '4rem', marginBottom: '4rem' }}>
          {/* Left: Brand & Info */}
          <div style={{ flex: '1 1 350px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
              <div style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: '12px', backgroundColor: 'var(--primary-color)', color: '#fff', boxShadow: '0 4px 12px rgba(255, 32, 112, 0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <path d="M9 9h.01M15 9h.01" strokeWidth="3" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Sleepy</h2>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#a0a4b8', margin: '0 0 1.5rem 0', lineHeight: '1.6' }}>
              나만의 슬라임을 찾는 가장 쉬운 방법.<br/>
              세상의 모든 슬라임 정보를 한 곳에서 만나보세요.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#686a78' }}>
              <span>이메일 문의: <a href="mailto:sleepyslime.official@gmail.com" style={{ color: '#8a8e9e', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e)=>e.target.style.color='#fff'} onMouseOut={(e)=>e.target.style.color='#8a8e9e'}>sleepyslime.official@gmail.com</a></span>
              <span>운영시간: 평일 10:00 - 18:00 (주말 및 공휴일 휴무)</span>
            </div>
          </div>

          {/* Right: Columns */}
          <div style={{ display: 'flex', gap: '5rem', flexWrap: 'wrap' }}>
            {/* Column 1: 서비스 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', margin: '0 0 0.5rem 0', letterSpacing: '0.5px' }}>서비스</h3>
              <Link to="/" style={{ color: '#8a8e9e', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e)=>e.target.style.color='#var(--primary-color)'} onMouseOut={(e)=>e.target.style.color='#8a8e9e'}>슬라임 마켓</Link>
              <Link to="/gallery" style={{ color: '#8a8e9e', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e)=>e.target.style.color='#var(--primary-color)'} onMouseOut={(e)=>e.target.style.color='#8a8e9e'}>자랑 피드</Link>
              <Link to="/lounge" style={{ color: '#8a8e9e', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e)=>e.target.style.color='#var(--primary-color)'} onMouseOut={(e)=>e.target.style.color='#8a8e9e'}>커뮤니티 라운지</Link>
            </div>

            {/* Column 2: 고객 지원 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', margin: '0 0 0.5rem 0', letterSpacing: '0.5px' }}>고객 지원</h3>
              <Link to="/mypage?tab=inquiries" style={{ color: '#8a8e9e', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e)=>e.target.style.color='#fff'} onMouseOut={(e)=>e.target.style.color='#8a8e9e'}>1:1 문의하기</Link>
              <Link to="/notice" style={{ color: '#8a8e9e', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e)=>e.target.style.color='#fff'} onMouseOut={(e)=>e.target.style.color='#8a8e9e'}>공지사항</Link>
              <Link to="/terms" style={{ color: '#8a8e9e', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e)=>e.target.style.color='#fff'} onMouseOut={(e)=>e.target.style.color='#8a8e9e'}>이용약관</Link>
              <Link to="/privacy" style={{ color: '#8a8e9e', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e)=>e.target.style.color='#fff'} onMouseOut={(e)=>e.target.style.color='#8a8e9e'}>개인정보처리방침</Link>
            </div>
          </div>
        </div>
        
        {/* Bottom: Disclaimer & Copyright */}
        <div style={{ borderTop: '1px solid #1a1829', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', fontSize: '0.8rem', lineHeight: '1.6' }}>
          <div style={{ color: '#545663', flex: '1 1 500px' }}>
            <strong>Sleepy(슬리피)</strong>는 슬라임 정보를 제공하는 큐레이션 플랫폼입니다.<br/>
            직접적인 상품 판매나 결제가 이루어지지 않으며, 연결된 외부 쇼핑몰의 상품 정보 및 거래에 대해 책임을 지지 않습니다.
          </div>
          <div style={{ color: '#545663', textAlign: 'right', display: 'flex', alignItems: 'flex-end' }}>
            &copy; {new Date().getFullYear()} Sleepy. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
