import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import './AdminDashboard.css';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await adminApi.getReports();
      setReports(data);
    } catch (err) {
      alert('신고 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, action) => {
    if (!window.confirm('해당 조치를 취하시겠습니까?')) return;
    try {
      await adminApi.resolveReport(id, action);
      alert('처리 완료되었습니다.');
      fetchReports();
    } catch (err) {
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="admin-loading">로딩 중...</div>;

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h2 className="admin-title">신고 관리</h2>
        <p className="admin-subtitle">사용자들의 신고 내역을 모니터링하고 신속하게 조치합니다.</p>
      </div>
      
      {reports.length === 0 ? (
        <div className="admin-empty-msg" style={{ border: '1px solid #eee', borderRadius: '12px', background: 'white' }}>
          ✨ 대기 중인 신고가 없습니다. 평화로운 슬라임 마켓이네요!
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table-clean">
            <thead>
              <tr>
                <th>신고 유형</th>
                <th>대상 ID</th>
                <th>사유</th>
                <th>신고일시</th>
                <th style={{ textAlign: 'right' }}>조치하기</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <span className="text-danger font-semibold">{report.targetType}</span>
                  </td>
                  <td className="text-muted">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{report.targetId}</span>
                        <a 
                          href={
                            report.targetType === 'POST' ? `/shorts?postId=${report.targetId}` : 
                            report.targetType === 'COMMENT' ? `/shorts?postId=${report.postId || ''}` : 
                            report.targetType === 'REVIEW' ? `/product/${report.productId || ''}` : 
                            report.targetType === 'PRODUCT' ? `/product/${report.targetId}` : '#'
                          } 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'underline' }}
                          title="새 창으로 열기"
                        >
                          (원문보기)
                        </a>
                      </div>
                      {report.targetContent && (
                        <div style={{ fontSize: '0.8rem', color: '#555', background: '#f9fafb', padding: '6px', borderRadius: '4px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ fontWeight: 'bold' }}>{report.targetAuthor}</span>: {report.targetContent}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="font-semibold">{report.reason}</td>
                  <td className="text-sm text-muted">{report.createdAt?.replace('T', ' ')}</td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleResolve(report.id, 'NONE')}
                      className="admin-btn-action admin-btn-secondary"
                    >
                      기각(무시)
                    </button>
                    <button 
                      onClick={() => handleResolve(report.id, 'BLIND')}
                      className="admin-btn-action admin-btn-warning"
                    >
                      숨김
                    </button>
                    <button 
                      onClick={() => handleResolve(report.id, 'SUSPEND_USER')}
                      className="admin-btn-action admin-btn-danger"
                    >
                      숨김+정지
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
