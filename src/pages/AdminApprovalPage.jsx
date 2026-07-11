import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';

export default function AdminApprovalPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await adminApi.getApplications();
      setApplications(data);
    } catch (error) {
      alert(error.message || '신청 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('이 셀러를 승인하시겠습니까?')) return;
    try {
      await adminApi.approveApplication(id);
      alert('승인되었습니다.');
      fetchApplications();
    } catch (error) {
      alert(error.message || '승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('반려 사유를 입력해 주세요:');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('반려 사유는 필수 입력 사항입니다.');
      return;
    }
    try {
      await adminApi.rejectApplication(id, reason);
      alert('반려 처리되었습니다.');
      fetchApplications();
    } catch (error) {
      alert(error.message || '반려 처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>셀러 신청 관리</h2>
      
      {applications.length === 0 ? (
        <div style={{ padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
          대기 중인 신청이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map((app) => (
            <div key={app.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>신청자 ID: {app.memberId} (신청번호: {app.id})</h3>
                <p style={{ margin: '0 0 0.25rem 0', color: '#4b5563' }}><strong>URL:</strong> <a href={app.siteUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{app.siteUrl}</a></p>
                <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}><strong>상태:</strong> {app.status}</p>
                <div style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '0.9rem' }}>
                  {app.introduction}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.5rem' }}>
                <button 
                  onClick={() => handleApprove(app.id)}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  승인
                </button>
                <button 
                  onClick={() => handleReject(app.id)}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  거절
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
