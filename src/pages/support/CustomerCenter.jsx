import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Info, AlertTriangle, ShieldCheck, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../../store';
import { inquiryApi } from '../../api/inquiry';

export default function CustomerCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  
  const tabFromUrl = searchParams.get('tab') || 'FAQ';
  const [activeTab, setActiveTab] = useState(tabFromUrl.toUpperCase());
  
  // Inquiry state
  const [inquiryForm, setInquiryForm] = useState({ title: '', content: '' });

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    const validTabs = ['FAQ', 'INQUIRY', 'GUIDE'];
    const formattedTab = tabFromUrl.toUpperCase();
    if (validTabs.includes(formattedTab)) {
      setActiveTab(formattedTab);
    } else {
      setActiveTab('FAQ');
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab: tab.toLowerCase() });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (!inquiryForm.title.trim() || !inquiryForm.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    try {
      await inquiryApi.create(inquiryForm);
      alert('1:1 문의가 성공적으로 등록되었습니다.\n답변은 마이페이지에서 확인하실 수 있습니다.');
      setInquiryForm({ title: '', content: '' });
      navigate('/mypage?tab=inquiries');
    } catch (err) {
      console.error(err);
      alert('문의 등록 중 오류가 발생했습니다.');
    }
  };

  const faqData = [
    { q: '회원가입 시 어떤 혜택이 있나요?', a: '슬리피에 가입하시면 판매자들의 다채로운 슬라임 구매 기록을 관리할 수 있을 뿐만 아니라, 슬라임 갤러리에 나만의 슬라임 숏폼 영상 업로드, 커뮤니티 게시글 및 댓글 작성, 1:1 문의 등 다양한 활동이 가능합니다. 소셜 계정으로 3초 만에 가입해보세요!' },
    { q: '회원 탈퇴는 어떻게 하나요?', a: '마이페이지 하단의 \'회원 탈퇴\' 버튼을 통해 간편하게 진행하실 수 있습니다. 탈퇴 시 모든 개인 정보 및 게시글, 댓글 내역은 영구 삭제되니 유의해주세요.' },
    { q: '숏폼 영상(슬라임 갤러리)은 어떻게 올리나요?', a: '로그인 후 [슬라임 갤러리] 탭에서 우측 하단의 \'+\' 플로팅 버튼을 눌러 소장하고 계신 슬라임 영상을 자유롭게 업로드할 수 있습니다.' },
    { q: '커뮤니티 게시판은 어떻게 구분되나요?', a: '커뮤니티는 질문, 후기, 정보, 잡담 총 4가지 카테고리로 세분화되어 운영됩니다. 다른 유저들에게 궁금한 점은 \'질문\' 탭에, 구매하신 슬라임 리뷰는 \'후기\' 탭에 자유롭게 남겨주세요.' },
    { q: '게시글이나 댓글을 수정/삭제하고 싶어요.', a: '본인이 작성한 게시글 및 댓글은 각 화면 우측의 메뉴(또는 수정/삭제 버튼)를 통해 언제든지 수정하거나 삭제하실 수 있습니다.' }
  ];

  const renderFAQ = () => (
    <div className="support-section">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>자주 묻는 질문 (FAQ)</h2>
      <div className="faq-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqData.map((faq, idx) => (
          <div key={idx} className="faq-item" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <button 
              onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: '1rem', color: '#374151' }}
            >
              <span>Q. {faq.q}</span>
              {openFaqIndex === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openFaqIndex === idx && (
              <div style={{ padding: '1.5rem', background: 'white', color: '#4b5563', lineHeight: '1.6' }}>
                <p style={{ margin: 0 }}>A. {faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderInquiry = () => (
    <div className="support-section">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>1:1 문의하기</h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        이용 중 불편하신 점이나 궁금한 점을 남겨주시면 관리자가 빠르게 확인 후 답변해 드립니다.<br/>
        (작성하신 문의 내역과 답변은 마이페이지의 '나의 1:1 문의' 탭에서 언제든지 확인하실 수 있습니다.)
      </p>
      
      {!token ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#f3f4f6', borderRadius: '12px' }}>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>1:1 문의를 작성하려면 로그인이 필요합니다.</p>
          <button onClick={() => navigate('/login')} style={{ padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            로그인하러 가기
          </button>
        </div>
      ) : (
        <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <input 
            type="text" 
            placeholder="문의 제목을 입력해주세요" 
            value={inquiryForm.title}
            onChange={(e) => setInquiryForm({...inquiryForm, title: e.target.value})}
            style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
          />
          <textarea 
            placeholder="상세 문의 내용을 입력해주세요 (최소 10자 이상)" 
            value={inquiryForm.content}
            onChange={(e) => setInquiryForm({...inquiryForm, content: e.target.value})}
            rows={8}
            style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical', fontSize: '1rem', fontFamily: 'inherit' }}
          />
          <button type="submit" style={{ padding: '1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' }}>
            문의 등록하기
          </button>
        </form>
      )}
    </div>
  );

  const renderGuide = () => (
    <div className="support-section">
      <header className="notice-header" style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '1rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '0.5rem', fontWeight: '800' }}>슬리피 이용 가이드</h1>
        <p style={{ color: '#666', fontSize: '1rem' }}>슬리피(Sleepy) 플랫폼을 더욱 즐겁고 안전하게 이용하는 방법!</p>
      </header>

      <section className="notice-card" style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={cardTitleStyle}>환영합니다! 슬리피 오픈</h2>
        </div>
        <div style={cardContentStyle}>
          <p>슬라임 러버들을 위한 최고의 놀이터, <strong>Sleepy</strong>에 오신 것을 환영합니다! 🎉</p>
          <p>슬리피는 다양한 판매자들의 개성 넘치는 수제 슬라임을 한곳에서 만나보고, 숏폼 영상을 시청하며, 유저들과 소통할 수 있는 <strong>슬라임 전문 커뮤니티 마켓플랫폼</strong>입니다.</p>
        </div>
      </section>

      <section className="notice-card" style={cardStyle}>
        <div style={cardHeaderStyle}>
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

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', paddingBottom: '5rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#111827' }}>고객센터</h1>
      
      <div className="support-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #f3f4f6' }}>
        {['FAQ', 'INQUIRY', 'GUIDE'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--primary-color)' : '#6b7280',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              fontSize: '1.1rem',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            {tab === 'FAQ' ? '자주 묻는 질문' : tab === 'INQUIRY' ? '1:1 문의하기' : '이용 가이드'}
          </button>
        ))}
      </div>

      <div className="support-content">
        {activeTab === 'FAQ' && renderFAQ()}
        {activeTab === 'INQUIRY' && renderInquiry()}
        {activeTab === 'GUIDE' && renderGuide()}
      </div>
    </div>
  );
}

// Inline Styles for Guide Tab
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
