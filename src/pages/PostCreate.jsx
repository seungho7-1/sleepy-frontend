import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { boardApi } from '../api/board'

export default function PostCreate() {
  const navigate = useNavigate()
  const { token, role } = useAuthStore()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [boardType, setBoardType] = useState('FREE')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      setIsUploading(true)
      let imageUrl = null;
      if (file) {
        // Axios가 자동으로 boundary를 설정할 수 있도록 Content-Type 헤더가 제거된 파일 업로드 호출
        const uploadRes = await boardApi.uploadFile(file, 'post');
        imageUrl = uploadRes.url;
      }

      await boardApi.createPost({ title, content, boardType, imageUrl });
      alert('게시글이 등록되었습니다.');
      navigate(boardType === 'MEDIA' ? '/gallery' : '/lounge');
    } catch (err) {
      alert(err.message || '게시글 등록에 실패했습니다.');
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="post-create-container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1.2rem 80px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.8rem', color: 'var(--text-main)' }}>새 게시글 작성 ✍️</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* 게시판 카테고리 선택 버튼그룹 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            게시판 선택
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setBoardType('FREE')}
              style={{
                flex: 1,
                minWidth: '90px',
                padding: '10px 8px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                border: '1px solid ' + (boardType === 'FREE' ? 'var(--primary-color)' : 'var(--border-color)'),
                backgroundColor: boardType === 'FREE' ? 'var(--primary-color)' : 'white',
                color: boardType === 'FREE' ? 'white' : 'var(--text-sub)'
              }}
            >
              자유게시판
            </button>
            <button
              type="button"
              onClick={() => setBoardType('QNA')}
              style={{
                flex: 1,
                minWidth: '90px',
                padding: '10px 8px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                border: '1px solid ' + (boardType === 'QNA' ? 'var(--primary-color)' : 'var(--border-color)'),
                backgroundColor: boardType === 'QNA' ? 'var(--primary-color)' : 'white',
                color: boardType === 'QNA' ? 'white' : 'var(--text-sub)'
              }}
            >
              질문게시판
            </button>
            <button
              type="button"
              onClick={() => setBoardType('MEDIA')}
              style={{
                flex: 1,
                minWidth: '90px',
                padding: '10px 8px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                border: '1px solid ' + (boardType === 'MEDIA' ? 'var(--primary-color)' : 'var(--border-color)'),
                backgroundColor: boardType === 'MEDIA' ? 'var(--primary-color)' : 'white',
                color: boardType === 'MEDIA' ? 'white' : 'var(--text-sub)'
              }}
            >
              📷 자랑피드
            </button>
            {role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => setBoardType('NOTICE')}
                style={{
                  flex: 1,
                  minWidth: '90px',
                  padding: '10px 8px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  border: '1px solid ' + (boardType === 'NOTICE' ? 'var(--primary-color)' : 'var(--border-color)'),
                  backgroundColor: boardType === 'NOTICE' ? 'var(--primary-color)' : 'white',
                  color: boardType === 'NOTICE' ? 'white' : 'var(--text-sub)'
                }}
              >
                공지사항
              </button>
            )}
          </div>
        </div>

        {/* 제목 입력 필드 */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            제목
          </label>
          <input 
            type="text" 
            placeholder="제목을 입력하세요" 
            required 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ 
              width: '100%', 
              padding: '12px 14px', 
              borderRadius: '10px', 
              border: '1px solid var(--border-color)', 
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>
        
        {/* 내용 입력 필드 */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            내용
          </label>
          <textarea 
            placeholder="슬라임에 대한 리얼한 이야기나 유용한 팁을 작성해 주세요!" 
            required 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: '10px', 
              border: '1px solid var(--border-color)', 
              minHeight: '240px', 
              fontSize: '0.95rem',
              lineHeight: '1.6',
              outline: 'none',
              resize: 'vertical',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        {/* 미디어 업로드 (모든 게시판 선택 시 노출) */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            미디어 첨부 (선택)
          </label>
          {!file ? (
            <div 
              style={{ 
                border: '2px dashed #ffccd8', 
                borderRadius: '12px', 
                padding: '1.8rem 1rem', 
                textAlign: 'center', 
                cursor: 'pointer',
                backgroundColor: '#fffcfd',
                transition: 'border-color 0.2s',
              }}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>📷</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-color)' }}>사진 또는 영상 추가</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '4px' }}>이미지(png, jpg) 또는 비디오(mp4) 파일</div>
              <input 
                id="file-upload-input"
                type="file" 
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ffd6e0', backgroundColor: '#fffcfd', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {file.type.startsWith('video/') ? (
                    <video src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{file.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '2px' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button 
                  type="button" 
                  onClick={handleRemoveFile} 
                  style={{ background: '#fff0f2', border: 'none', color: 'var(--primary-color)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  ❌
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* 하단 취소 / 등록 버튼 */}
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            disabled={isUploading}
            style={{ 
              flex: 1, 
              padding: '13px', 
              borderRadius: '10px', 
              border: '1px solid var(--border-color)', 
              backgroundColor: 'white', 
              color: 'var(--text-sub)', 
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            취소
          </button>
          <button 
            type="submit" 
            disabled={isUploading}
            style={{ 
              flex: 1, 
              padding: '13px', 
              borderRadius: '10px', 
              border: 'none', 
              backgroundColor: isUploading ? '#ff8da1' : 'var(--primary-color)', 
              color: 'white', 
              fontWeight: '700',
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(255, 32, 112, 0.12)',
              cursor: isUploading ? 'not-allowed' : 'pointer'
            }}
          >
            {isUploading ? '업로드 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
