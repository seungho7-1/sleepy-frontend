import React from 'react';

export default function Privacy() {
  return (
    <div className="container" style={{ padding: '2rem 1.2rem', maxWidth: 'var(--layout-width)', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '2rem', color: '#111' }}>개인정보처리방침</h1>
      
      <div style={{ color: '#333', lineHeight: '1.8', fontSize: '0.95rem' }}>
        <p style={{ marginBottom: '1rem' }}>슬리피 슬라임 큐레이션 프로젝트(이하 "운영자")는 개인정보보호법 등 관련 법령상의 개인정보보호 규정을 준수하며, 이용자의 개인정보를 보호하고 이와 관련한 고충을 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>

        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>1. 개인정보의 수집 및 이용 목적</h2>
        <p>본 사이트는 상업적 결제가 이루어지지 않는 커뮤니티 및 정보 제공 목적의 서비스 플랫폼이며, 다음의 목적을 위해서만 최소한의 개인정보를 수집합니다.</p>
        <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
          <li>회원 가입 및 관리: 커뮤니티 활동(좋아요, 찜하기, 댓글 등)을 위한 본인 식별·인증</li>
          <li>서비스 개선: 이용자 피드백 수렴, 접속 빈도 파악 및 서비스 이용 통계 등</li>
        </ul>

        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>2. 수집하는 개인정보의 항목</h2>
        <p>운영자는 커뮤니티 기능 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
        <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
          <li><strong>수집 항목:</strong> 아이디(또는 소셜 로그인 식별자), 비밀번호, 이메일, 닉네임, 프로필 이미지</li>
          <li>※ 결제 정보, 배송지 주소 등은 일절 수집하지 않습니다.</li>
        </ul>

        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>3. 개인정보의 보관 기간 및 파기 방법</h2>
        <p>원칙적으로 회원 탈퇴 시 수집된 개인정보는 지체 없이 파기됩니다.</p>
        <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
          <li><strong>보관 기간:</strong> 회원가입일로부터 회원 탈퇴 시까지</li>
          <li><strong>예외 보관 (법령 및 방침):</strong> 부정이용 기록(1년), 웹사이트 방문 기록(3개월)</li>
          <li><strong>파기 방법:</strong> 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 영구 삭제합니다.</li>
        </ul>

        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>4. 회원 탈퇴 및 정보 삭제 권리</h2>
        <p>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 요청할 수 있습니다.</p>
        <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
          <li><strong>탈퇴 방법:</strong> 로그인 후 [마이페이지] &rarr; [회원 탈퇴] 메뉴를 통해 즉시 탈퇴 및 개인정보 삭제가 가능합니다.</li>
          <li>회원 탈퇴 시 작성한 게시글 및 댓글 등은 자동으로 삭제되지 않을 수 있으므로, 삭제를 원하실 경우 탈퇴 전 직접 삭제하시기 바랍니다.</li>
        </ul>
      </div>
    </div>
  );
}
