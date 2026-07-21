import { useState, useEffect } from 'react'
import { useAuthStore } from '../store'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../api/admin'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const { token, role } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentData, setRecentData] = useState({ members: [], products: [], applications: [], reports: [] })

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

  if (!stats) return <div className="admin-loading">데이터를 불러오는 중입니다...</div>

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h2 className="admin-title">관리자 대시보드</h2>
        <p className="admin-subtitle">서비스의 전반적인 상태와 최신 업데이트를 확인하세요.</p>
      </div>
      
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
                <div key={r.id} className="admin-preview-item">
                  <span className="text-danger font-semibold">[{r.targetType}] {r.reason}</span>
                  <span className="text-muted text-sm">{r.createdAt?.split('T')[0]}</span>
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
                  <span className="font-semibold">{a.businessName}</span>
                  <span className="text-muted text-sm">{a.contactNumber}</span>
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
    </div>
  )
}
