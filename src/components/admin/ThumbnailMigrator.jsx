import React, { useState } from 'react';
import { boardApi } from '../../api/board';
import { extractThumbnailFromUrl } from '../../utils/thumbnailExtractor';
import { Settings, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

export default function ThumbnailMigrator() {
  const [status, setStatus] = useState('idle'); // idle, migrating, done
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'idle') {
        startMigration(true); // true means auto mode
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [status]);

  const startMigration = async (isAuto = false) => {
    if (!isAuto && !window.confirm('기존 영상들의 썸네일을 일괄 생성하시겠습니까? (이 작업은 브라우저 리소스를 사용하며 다소 시간이 걸릴 수 있습니다)')) {
      return;
    }
    
    setStatus('migrating');
    setLogs([]);
    setProgress(0);
    
    try {
      addLog('게시글 목록을 불러옵니다...');
      // 1. 모든 MEDIA 게시글을 불러옵니다 (간단히 최대 500개)
      const res = await boardApi.getPosts('MEDIA', '', 0, 500);
      const posts = res.content || [];
      
      // 2. 썸네일이 없고, imageUrl이 동영상인 게시물만 필터링
      const targetPosts = posts.filter(p => 
        p.imageUrl && 
        p.imageUrl.match(/\.(mp4|webm|mov)$/i) && 
        !p.thumbnailUrl
      );
      
      setTotal(targetPosts.length);
      addLog(`총 ${targetPosts.length}개의 썸네일 누락 영상을 발견했습니다.`);
      
      if (targetPosts.length === 0) {
        setStatus('done');
        return;
      }
      
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < targetPosts.length; i++) {
        const post = targetPosts[i];
        addLog(`[${i + 1}/${targetPosts.length}] 게시글 #${post.id} 썸네일 생성 중...`);
        
        try {
          // 3. 비디오 URL에서 썸네일 파일 추출
          const thumbnailFile = await extractThumbnailFromUrl(post.imageUrl);
          
          // 4. S3 업로드
          const uploadRes = await boardApi.uploadFile(thumbnailFile, 'post', () => {});
          
          // 5. 게시물 업데이트
          // 게시글 상세 정보를 먼저 불러와야 함 (updatePost 스펙상 title, content 등이 필요)
          const detail = await boardApi.getPostDetail(post.id);
          
          await boardApi.updatePost(post.id, {
            title: detail.title,
            content: detail.content,
            boardType: detail.boardType,
            imageUrl: detail.imageUrl,
            thumbnailUrl: uploadRes.url,
            hashtags: detail.hashtags || []
          });
          
          successCount++;
          addLog(`게시글 #${post.id} 썸네일 생성 및 업데이트 완료.`);
        } catch (err) {
          console.error(err);
          failCount++;
          addLog(`게시글 #${post.id} 오류: ${err.message}`);
        }
        setProgress(i + 1);
      }
      
      addLog(`모든 작업이 완료되었습니다. (성공: ${successCount}, 실패: ${failCount})`);
      setStatus('done');
    } catch (error) {
      console.error(error);
      addLog(`오류 발생: ${error.message}`);
      setStatus('done');
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Settings size={20} color="var(--primary-color)" />
        시스템 도구
      </h3>
      
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem', lineHeight: '1.5' }}>
        과거에 등록된 동영상 게시글 중 썸네일이 누락된 데이터를 찾아 브라우저에서 자동으로 썸네일을 생성하고 서버에 반영합니다.
      </p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button 
          onClick={startMigration}
          disabled={status === 'migrating'}
          style={{
            background: status === 'migrating' ? '#ccc' : 'var(--primary-color)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: status === 'migrating' ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {status === 'migrating' ? (
            <><Loader size={16} className="spin" /> 진행 중... ({progress}/{total})</>
          ) : status === 'done' ? (
            <><CheckCircle size={16} /> 다시 실행하기</>
          ) : (
            <>썸네일 일괄 생성 시작</>
          )}
        </button>
      </div>
      
      {logs.length > 0 && (
        <div style={{ 
          background: '#f8f9fa', 
          border: '1px solid #e9ecef', 
          borderRadius: '8px', 
          padding: '1rem',
          maxHeight: '200px',
          overflowY: 'auto',
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          color: '#495057'
        }}>
          {logs.map((log, idx) => (
            <div key={idx} style={{ marginBottom: '4px' }}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
}
