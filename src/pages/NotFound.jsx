import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const navigate = useNavigate()
  const [count, setCount] = useState(5)

  // 5초 후 자동으로 홈으로 이동
  useEffect(() => {
    if (count <= 0) {
      navigate('/')
      return
    }
    const timer = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [count, navigate])

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      background: 'var(--bg-color)'
    }}>
      {/* 슬라임 이모지 애니메이션 */}
      <div style={{
        fontSize: '6rem',
        marginBottom: '1.5rem',
        animation: 'bounce 1.5s infinite',
        lineHeight: 1
      }}>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <h1 style={{
          fontSize: '6rem',
          fontWeight: '900',
          color: 'var(--primary-color)',
          margin: '0 0 0.5rem',
          lineHeight: 1,
          letterSpacing: '-2px'
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--text-main)',
          margin: '0 0 0.75rem'
        }}>
          페이지를 찾을 수 없어요
        </h2>

        <p style={{
          fontSize: '1rem',
          color: 'var(--text-sub)',
          margin: '0 0 2rem',
          lineHeight: '1.6',
          maxWidth: '400px'
        }}>
          요청하신 페이지가 존재하지 않거나,<br />
          삭제되었거나, 주소가 잘못 입력되었습니다.
        </p>

        {/* 버튼 그룹 */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.75rem 1.8rem',
              borderRadius: '30px',
              border: '2px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-main)' }}
          >
            ← 이전 페이지
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.75rem 1.8rem',
              borderRadius: '30px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff2070 0%, #ff5c97 100%)',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 32, 112, 0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 32, 112, 0.3)' }}
          >
            홈으로 가기
          </button>
        </div>

        {/* 자동 리다이렉트 카운트다운 */}
        <p style={{
          marginTop: '2rem',
          fontSize: '0.85rem',
          color: '#aaa'
        }}>
          <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{count}초</span> 후 자동으로 홈으로 이동합니다.
        </p>
      </div>
    </div>
  )
}
