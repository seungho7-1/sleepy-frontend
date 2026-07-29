import React from 'react';

export default function Terms() {
  return (
    <div className="container" style={{ padding: '2rem 1.2rem', maxWidth: 'var(--layout-width)', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '2rem', color: '#111' }}>이용약관</h1>
      
      <div style={{ color: '#333', lineHeight: '1.8', fontSize: '0.95rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>제 1 조 (목적)</h2>
        <p>본 약관은 슬리피 슬라임(이하 "운영자")이 제공하는 슬라임 큐레이션 및 커뮤니티 서비스(이하 "서비스")를 이용함에 있어 운영자와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>

        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>제 2 조 (약관의 명시와 개정)</h2>
        <p>1. 운영자는 이 약관의 내용과 연락처(이메일) 등을 이용자가 쉽게 알 수 있도록 서비스 초기 화면이나 하단에 게시합니다.</p>
        <p>2. 운영자는 관련 법률을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</p>

        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>제 3 조 (용어의 정의)</h2>
        <p>1. "서비스"란 운영자가 슬라임 정보를 선별하여 제공하고, 이용자들이 정보를 교류할 수 있도록 제공하는 웹사이트를 말합니다.</p>
        <p>2. "이용자"란 서비스에 접속하여 이 약관에 따라 운영자가 제공하는 정보를 이용하는 회원 및 비회원을 말합니다.</p>
        <p>3. "회원"이란 서비스에 가입하여 커뮤니티 활동(게시글, 좋아요, 댓글 등)을 지속적으로 이용할 수 있는 자를 말합니다.</p>
        
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>제 4 조 (서비스의 성격 및 면책)</h2>
        <p>1. 본 서비스는 슬라임 상품 정보를 수집하여 소개하는 '정보 큐레이션 사이트'입니다.</p>
        <p>2. 서비스 내에서 상품의 직접적인 결제 및 판매, 배송 등의 상거래 행위는 이루어지지 않습니다.</p>
        <p>3. 상품 구매를 위해 연결된 외부 쇼핑몰에서 발생하는 모든 거래에 대한 책임은 당사자에게 있으며, 운영자는 어떠한 법적 책임도 지지 않습니다.</p>

        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>제 4 조 (회원의 의무 및 게시글 책임)</h2>
        <p>1. 회원은 본 서비스 내 커뮤니티(라운지, 자랑 피드 등) 이용 시 타인을 비방하거나, 광고, 도배, 음란물 등 서비스 운영 정책에 어긋나는 게시글을 작성해서는 안 됩니다.</p>
        <p>2. 회원이 작성한 게시물에 대한 모든 권리와 책임은 해당 회원에게 있으며, 운영자는 위법하거나 운영 정책에 위반되는 게시물을 사전 통지 없이 삭제할 수 있습니다.</p>

        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>제 5 조 (서비스 이용 제한 및 계정 정지)</h2>
        <p>1. 다음과 같은 행위가 적발될 경우, 운영자는 사용자의 계정을 정지하거나 서비스 이용을 제한할 수 있습니다.</p>
        <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
          <li>욕설, 비방, 혐오 표현 등 타인에게 불쾌감을 주는 행위</li>
          <li>상업적 광고 도배 및 스팸 게시물 작성</li>
          <li>거래 사기 시도 및 부적절한 유도 행위</li>
          <li>기타 슬라임 큐레이션 사이트의 본래 목적을 훼손하는 행위</li>
        </ul>

        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>제 6 조 (정보 출처 표시 및 저작권 보호)</h2>
        <p>1. 본 서비스에서 큐레이션 목적으로 제공하는 상품 이미지 및 정보의 원저작권은 각 브랜드(판매처)에 있습니다.</p>
        <p>2. 운영자는 정보 제공 시 이미지 출처, 브랜드명, 공식 판매 링크를 명시하여 원작자의 권리를 존중합니다.</p>
        <p>3. 만약 정보 게재를 원치 않으시는 브랜드 담당자께서는 고객센터(support@sleepyslime.com)로 문의해주시면 즉시 게시물 삭제 등 필요한 조치를 취하겠습니다.</p>
      </div>
    </div>
  );
}
