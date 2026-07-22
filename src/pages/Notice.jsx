import React from 'react';
import { Info, AlertTriangle, ShieldCheck, Heart } from 'lucide-react';

export default function Notice() {
  return (
    <div className="notice-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', paddingBottom: '5rem' }}>
      <header className="notice-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '0.5rem', fontWeight: '800' }}>📢 공지사항 및 이용 가이드</h1>
        <p style={{ color: '#666', fontSize: '1rem' }}>슬리피(Sleepy) 플랫폼을 더욱 즐겁고 안전하게 이용하는 방법!</p>
      </header>

      <section className="notice-card" style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div style={iconWrapperStyle('#FFE3E3')}><Info size={24} color="#ff5b94" /></div>
          <h2 style={cardTitleStyle}>환영합니다! 슬리피 오픈 베타</h2>
        </div>
        <div style={cardContentStyle}>
          <p>슬라임 러버들을 위한 최고의 놀이터, <strong>Sleepy</strong>에 오신 것을 환영합니다! 🎉</p>
          <p>슬리피는 다양한 판매자들의 개성 넘치는 수제 슬라임을 한곳에서 만나보고, 숏폼 영상을 시청하며, 유저들과 소통할 수 있는 <strong>슬라임 전문 커뮤니티 마켓플랫폼</strong>입니다.</p>
        </div>
      </section>

      <section className="notice-card" style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div style={iconWrapperStyle('#FFF0D4')}><AlertTriangle size={24} color="#FF9F1C" /></div>
          <h2 style={cardTitleStyle}>슬라임 안전 이용 가이드</h2>
        </div>
        <div style={cardContentStyle}>
          <p>슬리피에서 권장하는 올바른 슬라임 이용 방법입니다.</p>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <strong>🚫 먹지 마세요:</strong> 슬라임은 장난감입니다. <strong>절대 입에 넣거나 드시지 마세요!</strong> (14세 이상 사용 권장)
            </li>
            <li style={listItemStyle}>
              <strong>🧼 손 씻기 필수:</strong> 슬라임을 만지기 전후로는 반드시 손을 깨끗하게 씻어주세요.
            </li>
            <li style={listItemStyle}>
              <strong>🌡️ 온도 민감성:</strong> 슬라임은 온도에 매우 민감하여 날씨에 따라 녹거나 굳을 수 있습니다. 구매하신 판매자님의 안내에 따라 농도를 조절해 주세요.
            </li>
          </ul>
        </div>
      </section>

      <section className="notice-card" style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div style={iconWrapperStyle('#E3F2FD')}><Heart size={24} color="#2196F3" /></div>
          <h2 style={cardTitleStyle}>구매 및 리뷰 작성 규칙</h2>
        </div>
        <div style={cardContentStyle}>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <strong>개별 판매자 정책 확인:</strong> 슬리피에 입점한 판매자마다 배송 및 교환/환불 정책이 다를 수 있습니다. 상품 구매 전 상세페이지의 안내를 꼭 확인해 주세요!
            </li>
            <li style={listItemStyle}>
              <strong>솔직하고 유익한 리뷰:</strong> 구매 후 사진이나 영상과 함께 솔직한 리뷰를 남겨주시면 다른 슬라임 러버들에게 큰 도움이 됩니다.
            </li>
          </ul>
        </div>
      </section>

      <section className="notice-card" style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div style={iconWrapperStyle('#E8F5E9')}><ShieldCheck size={24} color="#4CAF50" /></div>
          <h2 style={cardTitleStyle}>커뮤니티 에티켓</h2>
        </div>
        <div style={cardContentStyle}>
          <p>슬리피는 모두가 기분 좋게 이용할 수 있는 따뜻한 공간을 지향합니다.</p>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              리뷰, Q&A, 댓글 작성 시 타인을 존중해 주세요. 비방, 욕설, 광고성 글은 <strong>무통보 블라인드(신고) 처리</strong> 및 이용 제한이 될 수 있습니다.
            </li>
            <li style={listItemStyle}>
              판매자에게 무리한 요구나 악의적인 후기를 남기는 행위는 삼가주시기 바랍니다.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

// Inline Styles for simplicity and portability
const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '2rem',
  marginBottom: '1.5rem',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: '1px solid #f0f0f0'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1.5rem',
  gap: '12px'
};

const iconWrapperStyle = (bgColor) => ({
  backgroundColor: bgColor,
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const cardTitleStyle = {
  fontSize: '1.4rem',
  fontWeight: '700',
  color: '#222',
  margin: 0
};

const cardContentStyle = {
  color: '#555',
  lineHeight: '1.7',
  fontSize: '0.95rem'
};

const listStyle = {
  paddingLeft: '1.2rem',
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const listItemStyle = {
  marginBottom: '0.5rem'
};
