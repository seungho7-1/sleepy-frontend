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
  const [isUploading, setIsUploading] = useState(false)

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
        const uploadRes = await boardApi.uploadFile(file);
        imageUrl = uploadRes.url;
      }

      await boardApi.createPost({ title, content, boardType, imageUrl });
      alert('게시글이 등록되었습니다.');
      navigate('/community');
    } catch (err) {
      alert(err.message || '게시글 등록에 실패했습니다.');
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="login-container" style={{ maxWidth: '800px' }}>
      <h2>새 게시글 작성 ✍️</h2>
      <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '2rem' }}>
        <select 
          value={boardType} 
          onChange={(e) => setBoardType(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}
        >
          <option value="FREE">자유게시판</option>
          <option value="QNA">질문게시판</option>
          <option value="MEDIA">📷 미디어(사진/영상) 게시판</option>
          {role === 'ADMIN' && <option value="NOTICE">공지사항</option>}
        </select>
        
        <input 
          type="text" 
          placeholder="제목을 입력하세요" 
          required 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          style={{ width: '100%', padding: '12px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        
        <textarea 
          placeholder="내용을 입력하세요" 
          required 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          style={{ width: '100%', padding: '12px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '300px' }}
        />

        {boardType === 'MEDIA' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>미디어 파일 업로드 (선택)</label>
            <input 
              type="file" 
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '8px' }}
            />
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" className="btn-danger" style={{ flex: 1 }} onClick={() => navigate(-1)} disabled={isUploading}>취소</button>
          <button type="submit" className="submit-btn" style={{ flex: 1 }} disabled={isUploading}>
            {isUploading ? '업로드 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
