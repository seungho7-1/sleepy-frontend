import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { boardApi } from '../../api/board'
import { compressVideo, needsCompression } from '../../utils/videoCompressor'

export default function PostCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token, role } = useAuthStore()
  
  const initialBoardType = searchParams.get('boardType') || 'QNA'
  
  const editId = searchParams.get('edit')
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [boardType, setBoardType] = useState(initialBoardType)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('') // 현재 단계 텍스트
  const [uploadProgress, setUploadProgress] = useState(0) // 0~100 진행률

  // 수정 모드일 때 기존 게시글 데이터 불러오기
  useEffect(() => {
    if (editId) {
      setIsEditMode(true)
      const fetchPost = async () => {
        try {
          const postData = await boardApi.getPostDetail(editId);
          setTitle(postData.title);
          setContent(postData.content);
          setBoardType(postData.boardType);
          if (postData.imageUrl) {
            setPreviewUrl(postData.imageUrl);
          }
        } catch (err) {
          console.error(err);
          alert('게시글을 불러올 수 없습니다.');
          navigate(-1);
        }
      }
      fetchPost();
    }
  }, [editId])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // 이미지: 5MB 제한 / 영상: 500MB 제한 (브라우저에서 압축 후 업로드되므로 여유 있게 허용)
      const isVideo = selectedFile.type.startsWith('video/');
      const maxSizeMB = isVideo ? 500 : 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (selectedFile.size > maxSizeBytes) {
        alert(`파일 용량이 너무 큽니다!\n${isVideo ? '영상은 최대 500MB' : '사진은 최대 5MB'}까지만 업로드 가능합니다.\n\n현재 파일 크기: ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB`);
        e.target.value = '';
        return;
      }

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
      setUploadProgress(0)
      let finalImageUrl = previewUrl;
      
      if (file) {
        let fileToUpload = file;
        
        // 🎬 영상이고 20MB를 초과하면 → 브라우저에서 자동 압축
        if (file.type.startsWith('video/') && needsCompression(file)) {
          setUploadStatus(`🎬 영상 압축 중... (${(file.size / 1024 / 1024).toFixed(0)}MB → 720p 변환)`);
          try {
            fileToUpload = await compressVideo(file, (progress) => {
              setUploadProgress(progress);
            });
            setUploadStatus(`✅ 압축 완료! (${(file.size / 1024 / 1024).toFixed(0)}MB → ${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB)`);
          } catch (compressErr) {
            console.error('영상 압축 실패, 원본으로 업로드합니다:', compressErr);
            // 압축 실패 시 원본 그대로 업로드 시도
            fileToUpload = file;
          }
        }
        
        // S3 업로드 단계
        setUploadStatus('☁️ 서버에 업로드 중...');
        setUploadProgress(0);
        const uploadRes = await boardApi.uploadFile(fileToUpload, 'post', (progress) => {
          setUploadProgress(progress);
        });
        finalImageUrl = uploadRes.url;
      }

      setUploadStatus('📝 게시글 저장 중...');
      if (isEditMode) {
        await boardApi.updatePost(editId, { title, content, boardType, imageUrl: finalImageUrl });
        alert('게시글이 수정되었습니다.');
        navigate(`/community/post/${editId}`);
      } else {
        await boardApi.createPost({ title, content, boardType, imageUrl: finalImageUrl });
        alert('게시글이 등록되었습니다.');
        navigate(boardType === 'MEDIA' ? '/gallery' : `/lounge?tab=${boardType}`);
      }
    } catch (err) {
      alert(err.message || '게시글 등록에 실패했습니다.');
    } finally {
      setIsUploading(false)
      setUploadStatus('')
      setUploadProgress(0)
    }
  }

  return (
    <div className="post-create-container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1.2rem 80px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.8rem', color: 'var(--text-main)' }}>
        {isEditMode ? '✍️ 게시글 수정하기' : boardType === 'MEDIA' ? '✨ 슬라임 자랑하기' : boardType === 'NOTICE' ? '📢 공지사항 작성' : '💬 질문 남기기'}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
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
          
          {/* 압축/업로드 진행률 표시 */}
          {isUploading && uploadStatus && (
            <div style={{ marginTop: '12px', padding: '14px', borderRadius: '10px', backgroundColor: '#f8f0ff', border: '1px solid #e8d5f5' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#7c3aed', marginBottom: '8px' }}>
                {uploadStatus}
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e8d5f5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${uploadProgress}%`, 
                  height: '100%', 
                  backgroundColor: '#7c3aed', 
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '4px', textAlign: 'right' }}>
                {uploadProgress}%
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
            {isUploading ? '업로드 중...' : isEditMode ? '수정하기' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
