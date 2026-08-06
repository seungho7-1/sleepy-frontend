import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import ThumbnailMigrator from '../../components/admin/ThumbnailMigrator'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const { token, role } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentData, setRecentData] = useState({ members: [], products: [], applications: [], reports: [] })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [inquiries, setInquiries] = useState([])
  const [replyContent, setReplyContent] = useState({})

  useEffect(() => {
    if (role !== 'ADMIN') {
      alert('접근 권한이 없습니다.')
      navigate('/')
      return
    }
    fetchData()
  }, [role])

  const fetchData = async () => {
    try {
      const statsData = await adminApi.getDashboardStats()
      setStats(statsData)

      const [members, products, apps, reports] = await Promise.all([
        adminApi.getMembers(),
        adminApi.getProducts(),
        adminApi.getApplications(),
        adminApi.getReports()
      ])

      setRecentData({
        members: members.slice(0, 5),
        products: products.slice(0, 5),
        applications: apps.slice(0, 5),
        reports: reports.slice(0, 5)
      })
    } catch (err) {
      console.error(err)
    }
  }

  const fetchInquiries = async () => {
    try {
      const data = await adminApi.getInquiries();
      setInquiries(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (activeTab === 'inquiries') {
      fetchInquiries();
    }
  }, [activeTab]);

  const handleReplySubmit = async (id) => {
    const reply = replyContent[id];
    if (!reply || !reply.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }
    try {
      await adminApi.replyToInquiry(id, reply);
      alert('답변이 등록되었습니다.');
      setReplyContent(prev => ({ ...prev, [id]: '' }));
      fetchInquiries();
    } catch (err) {
      alert('답변 등록 중 오류가 발생했습니다.');
    }
  }

  if (!stats) return <div className="admin-loading">데이터를 불러오는 중입니다...</div>

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h2 className="admin-title">관리자 대시보드</h2>
        <p className="admin-subtitle">서비스의 전반적인 상태와 최신 업데이트를 확인하세요.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          style={{ padding: '0.5rem 1rem', background: activeTab === 'dashboard' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'dashboard' ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          대시보드 홈
        </button>
        <button 
          onClick={() => setActiveTab('inquiries')} 
          style={{ padding: '0.5rem 1rem', background: activeTab === 'inquiries' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'inquiries' ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          1:1 문의 관리
        </button>
      </div>
      
      {activeTab === 'dashboard' && (
        <>
          <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h4 className="admin-stat-label">오늘 신규 가입</h4>
          <p className="admin-stat-value">{stats.todaySignupCount}</p>
        </div>
        <div className="admin-stat-card">
          <h4 className="admin-stat-label">오늘 신규 상품</h4>
          <p className="admin-stat-value">{stats.todayProductCount}</p>
        </div>
        <div className="admin-stat-card highlight-card" onClick={() => navigate('/admin/applications')}>
          <h4 className="admin-stat-label">셀러 승인 대기</h4>
          <p className="admin-stat-value text-primary">{stats.pendingSellerCount}</p>
        </div>
        <div className="admin-stat-card highlight-card" onClick={() => navigate('/admin/reports')}>
          <h4 className="admin-stat-label">미처리 신고</h4>
          <p className="admin-stat-value text-danger">{stats.newReportCount}</p>
        </div>
      </div>

      <div className="admin-preview-grid">
        {/* 미처리 신고 */}
        <div className="admin-preview-section">
          <div className="admin-preview-header">
            <h3>최근 접수된 신고</h3>
            <button className="admin-more-btn" onClick={() => navigate('/admin/reports')}>더보기 &gt;</button>
          </div>
          <div className="admin-preview-list">
            {recentData.reports.length === 0 ? <div className="admin-empty-msg">대기 중인 신고가 없습니다.</div> : 
              recentData.reports.map(r => (
                <div key={r.id} className="admin-preview-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="text-danger font-semibold">[{r.targetType}] {r.reason}</span>
                      <a 
                        href={
                          r.targetType === 'POST' ? `/shorts?postId=${r.targetId}` : 
                          r.targetType === 'COMMENT' ? `/shorts?postId=${r.postId || ''}` : 
                          r.targetType === 'REVIEW' ? `/product/${r.productId || ''}` : 
                          r.targetType === 'PRODUCT' ? `/product/${r.targetId}` : '#'
                        } 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'underline' }}
                        title="새 창으로 열기"
                      >
                        (원문보기)
                      </a>
                    </div>
                    <span className="text-muted text-sm">{r.createdAt?.split('T')[0]}</span>
                  </div>
                  {r.targetContent && (
                    <div style={{ fontSize: '0.85rem', color: '#555', background: '#f9fafb', padding: '6px', borderRadius: '4px', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '4px' }}>{r.targetAuthor}</span>: {r.targetContent}
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>

        {/* 셀러 승인 대기 */}
        <div className="admin-preview-section">
          <div className="admin-preview-header">
            <h3>셀러 승인 대기</h3>
            <button className="admin-more-btn" onClick={() => navigate('/admin/applications')}>더보기 &gt;</button>
          </div>
          <div className="admin-preview-list">
            {recentData.applications.length === 0 ? <div className="admin-empty-msg">승인 대기 중인 셀러가 없습니다.</div> : 
              recentData.applications.map(a => (
                <div key={a.id} className="admin-preview-item">
                  <span className="font-semibold">{a.shopName}</span>
                  <span className="text-muted text-sm">{a.memberNickname} ({a.memberEmail})</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* 신규 상품 */}
        <div className="admin-preview-section">
          <div className="admin-preview-header">
            <h3>최근 등록된 상품</h3>
            <button className="admin-more-btn" onClick={() => navigate('/admin/products')}>더보기 &gt;</button>
          </div>
          <div className="admin-preview-list">
            {recentData.products.length === 0 ? <div className="admin-empty-msg">등록된 상품이 없습니다.</div> : 
              recentData.products.map(p => (
                <div key={p.id} className="admin-preview-item">
                  <span className="font-semibold">{p.name} {p.isHidden && <span className="text-danger text-xs">(숨김)</span>}</span>
                  <span className="text-muted text-sm">{p.shopName}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* 신규 가입자 */}
        <div className="admin-preview-section">
          <div className="admin-preview-header">
            <h3>최근 가입한 회원</h3>
            <button className="admin-more-btn" onClick={() => navigate('/admin/members')}>더보기 &gt;</button>
          </div>
          <div className="admin-preview-list">
            {recentData.members.length === 0 ? <div className="admin-empty-msg">가입한 회원이 없습니다.</div> : 
              recentData.members.map(m => (
                <div key={m.id} className="admin-preview-item">
                  <span className="font-semibold">{m.nickname} <span className="text-muted text-sm">({m.email})</span></span>
                  <span className={`text-xs font-bold ${m.status === 'SUSPENDED' ? 'text-danger' : 'text-success'}`}>{m.status}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
        </>
      )}

      {activeTab === 'inquiries' && (
        <div className="admin-preview-section" style={{ maxWidth: 'var(--layout-width)', margin: '0 auto' }}>
          <h3>1:1 문의 관리</h3>
          {inquiries.length === 0 ? (
            <div className="admin-empty-msg">문의가 없습니다.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
              {inquiries.map(inquiry => (
                <div key={inquiry.id} style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{inquiry.title}</h4>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                        작성자: {inquiry.memberNickname || inquiry.authorId}
                      </span>
                    </div>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold',
                      backgroundColor: inquiry.status === 'PENDING' ? '#fef3c7' : '#d1fae5',
                      color: inquiry.status === 'PENDING' ? '#d97706' : '#10b981',
                      height: 'fit-content'
                    }}>
                      {inquiry.status === 'PENDING' ? '답변 대기' : '답변 완료'}
                    </span>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '4px', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                    {inquiry.content}
                  </div>

                  {inquiry.status === 'PENDING' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <textarea 
                        value={replyContent[inquiry.id] || ''} 
                        onChange={(e) => setReplyContent({...replyContent, [inquiry.id]: e.target.value})}
                        placeholder="답변을 입력하세요..."
                        rows={3}
                        style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #d1d5db', resize: 'vertical' }}
                      />
                      <button 
                        onClick={() => handleReplySubmit(inquiry.id)}
                        style={{ alignSelf: 'flex-end', padding: '0.6rem 1.2rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        답변 등록
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', borderLeft: '4px solid var(--primary-color)', backgroundColor: '#f3f4f6' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>관리자 답변:</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{inquiry.reply}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
