import { useState, useEffect } from 'react'
import { useAuthStore } from '../store'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../api/admin'

export default function AdminDashboard() {
  const { token, role } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (role !== 'ADMIN') {
      alert('접근 권한이 없습니다.')
      navigate('/')
      return
    }
    fetchStats()
  }, [role])

  const fetchStats = async () => {
    try {
      const data = await adminApi.getDashboard();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }

  if (!stats) return <div className="empty-state">불러오는 중...</div>

  return (
    <div className="admin-container">
      <h2>관리자 대시보드</h2>
      
      <div className="stats-cards">
        <div className="stat-card">
          <h3>총 가입자 수</h3>
          <p className="stat-number">{stats.totalMembers}명</p>
        </div>
        <div className="stat-card">
          <h3>총 등록 상품 수</h3>
          <p className="stat-number">{stats.totalProducts}개</p>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', backgroundColor: '#eef2ff' }} onClick={() => navigate('/admin/applications')}>
          <h3>셀러 신청 관리 ➡️</h3>
          <p style={{ marginTop: '1rem', color: '#4f46e5', fontWeight: 'bold' }}>미승인된 판매자 신청을 관리합니다</p>
        </div>
      </div>

      <div className="admin-table-container">
        <h3>회원 목록</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이메일</th>
              <th>닉네임</th>
              <th>권한</th>
            </tr>
          </thead>
          <tbody>
            {stats.members.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.email}</td>
                <td>{m.nickname}</td>
                <td>{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
