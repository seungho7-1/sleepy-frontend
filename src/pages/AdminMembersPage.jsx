import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import './AdminDashboard.css';

export default function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await adminApi.getMembers();
      setMembers(data);
    } catch (err) {
      alert('회원 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('정말로 이 회원을 정지하시겠습니까?')) return;
    try {
      await adminApi.suspendMember(id);
      alert('회원 정지가 완료되었습니다.');
      fetchMembers();
    } catch (err) {
      alert('정지 처리 중 오류가 발생했습니다.');
    }
  };

  const handleUnsuspend = async (id) => {
    if (!window.confirm('이 회원의 정지를 해제하시겠습니까?')) return;
    try {
      await adminApi.unsuspendMember(id);
      alert('회원 정지가 해제되었습니다.');
      fetchMembers();
    } catch (err) {
      alert('정지 해제 처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="admin-loading">로딩 중...</div>;

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h2 className="admin-title">회원 관리</h2>
        <p className="admin-subtitle">서비스를 이용 중인 전체 회원을 관리합니다.</p>
      </div>
      
      <div className="admin-table-wrapper">
        <table className="admin-table-clean">
          <thead>
            <tr>
              <th>ID</th>
              <th>이메일</th>
              <th>닉네임</th>
              <th>권한</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td className="text-muted">{m.id}</td>
                <td>{m.email}</td>
                <td className="font-semibold">{m.nickname}</td>
                <td>
                  <span className={`text-xs font-semibold ${m.role === 'ADMIN' ? 'text-primary' : ''}`}>
                    {m.role}
                  </span>
                </td>
                <td>
                  <span className={`font-semibold ${m.status === 'SUSPENDED' ? 'text-danger' : 'text-success'}`}>
                    {m.status === 'SUSPENDED' ? '정지됨' : '활동중'}
                  </span>
                </td>
                <td>
                  {m.role !== 'ADMIN' && (
                    m.status === 'SUSPENDED' ? (
                      <button 
                        onClick={() => handleUnsuspend(m.id)}
                        className="admin-btn-action admin-btn-success"
                      >
                        정지 해제
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleSuspend(m.id)}
                        className="admin-btn-action admin-btn-danger"
                      >
                        계정 정지
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
