import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { boardApi } from '../../api/board'
import { extractThumbnailFromVideo } from '../../utils/thumbnailExtractor'
import { Edit, Sparkles, Megaphone, MessageCircle, UploadCloud, Image as ImageIcon, Film, X, RefreshCw, Plus } from 'lucide-react'

export default function PostCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token, role } = useAuthStore()
  
  const initialBoardType = searchParams.get('boardType') || (role === 'ADMIN' ? 'ALL' : 'FREE')
  const editId = searchParams.get('edit')
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [boardType, setBoardType] = useState(initialBoardType)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [hashtags, setHashtags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPinned, setIsPinned] = useState(false)

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
          if (postData.hashtags) {
            setHashtags(postData.hashtags);
          }
          if (postData.imageUrl) {
            setPreviewUrl(postData.imageUrl);
          }
          if (postData.isPinned !== undefined) {
            setIsPinned(postData.isPinned);
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

  // 공지사항은 관리자만 작성 가능
  useEffect(() => {
    if (boardType === 'NOTICE' && role !== 'ADMIN') {
      alert('공지사항은 관리자만 작성할 수 있습니다.');
      navigate(-1);
    }
  }, [boardType, role, navigate])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const isVideo = selectedFile.type.startsWith('video/');
      const maxSizeMB = isVideo ? 50 : 10;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (selectedFile.size > maxSizeBytes) {
        alert(`파일 용량이 너무 큽니다!\n${isVideo ? '영상은 최대 50MB' : '사진은 최대 10MB'}까지만 업로드 가능합니다.\n\n현재 파일 크기: ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB`);
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

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !hashtags.includes(val) && hashtags.length < 5) {
        setHashtags([...hashtags, val]);
        setTagInput('');
      } else if (hashtags.length >= 5) {
        alert('해시태그는 최대 5개까지만 등록할 수 있습니다.');
      }
    } else if (e.key === 'Backspace' && tagInput === '' && hashtags.length > 0) {
      setHashtags(hashtags.slice(0, -1));
    }
  };

  const removeTag = (idxToRemove) => {
    setHashtags(hashtags.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      alert('로그인이 필요합니다.')
      return
    }
    if (boardType === 'ALL' && role !== 'ADMIN') {
      alert('카테고리를 선택해주세요.')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      let finalImageUrl = previewUrl;
      let finalThumbnailUrl = null;
      
      if (file) {
        let fileToUpload = file;
        
        if (file.type.startsWith('video/')) {
          setUploadStatus('썸네일 추출 중...');
          try {
            const thumbFile = await extractThumbnailFromVideo(file);
            const thumbRes = await boardApi.uploadFile(thumbFile, 'post', () => {});
            finalThumbnailUrl = thumbRes.url;
          } catch (e) {
            console.error('썸네일 추출 실패:', e);
          }
        }
        setUploadStatus('서버에 다이렉트 업로드 중...');
        setUploadProgress(0);
        const uploadRes = await boardApi.uploadFile(fileToUpload, 'post', (progress) => {
          setUploadProgress(progress);
        });
        finalImageUrl = uploadRes.url;
      }

      setUploadStatus('게시글 저장 중...');
      if (isEditMode) {
        await boardApi.updatePost(editId, { title, content, boardType, imageUrl: finalImageUrl, thumbnailUrl: finalThumbnailUrl, hashtags, isPinned });
        alert('게시글이 수정되었습니다.');
        navigate(`/community/${editId}`);
      } else {
        await boardApi.createPost({ title, content, boardType, imageUrl: finalImageUrl, thumbnailUrl: finalThumbnailUrl, hashtags, isPinned });
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

  const isMediaPost = boardType === 'MEDIA';
  const isVideoFile = (file?.type.startsWith('video/')) || (previewUrl && previewUrl.match(/\.(mp4|webm|mov)$/i));

  return (
    <div className="container" style={{ maxWidth: isMediaPost ? '1040px' : '820px', margin: '2rem auto', padding: '0 1.2rem 80px' }}>
      {/* 헤더 타이틀 */}
      <div style={{ marginBottom: '1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEditMode ? <><Edit size={24} color="var(--primary-color)" /> 게시글 수정하기</> : 
             isMediaPost ? <><Sparkles size={24} color="var(--primary-color)" /> 슬라임 자랑하기</> : 
             boardType === 'NOTICE' ? <><Megaphone size={24} color="var(--primary-color)" /> 공지사항 작성</> : 
             <><MessageCircle size={24} color="var(--primary-color)" /> 게시글 작성</>}
          </h2>
          {isMediaPost && (
            <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#666' }}>
              쫀득하고 재미있는 나만의 슬라임 영상이나 사진을 슬라임 갤러리에 공유해 보세요!
            </p>
          )}
        </div>

        {role === 'ADMIN' && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--primary-color)', cursor: 'pointer', background: '#fff0f5', padding: '8px 16px', borderRadius: '20px', border: '1px solid #ffccd8' }}>
            <input 
              type="checkbox" 
              checked={isPinned} 
              onChange={(e) => {
                setIsPinned(e.target.checked);
                if (e.target.checked) setBoardType('ALL');
                else setBoardType('FREE');
              }} 
              style={{ accentColor: 'var(--primary-color)', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            📌 상단 고정 공지로 등록
          </label>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* 슬라임 갤러리 미디어 전용 2컬럼 레이아웃 */}
        {isMediaPost ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 400px) 1fr', gap: '1.8rem', alignItems: 'stretch' }}>
            {/* 좌측: 미디어 업로드 카드 */}
            <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
             슬라임 미디어 첨부
              </label>
              
              {(!file && !previewUrl) ? (
                <div 
                  onClick={() => document.getElementById('media-upload-input').click()}
                  style={{
                    flex: 1,
                    minHeight: '380px',
                    borderRadius: '14px',
                    border: '2px dashed #ffb3c6',
                    background: '#fff0f5',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem 1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                    e.currentTarget.style.background = '#ffeef3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#ffb3c6';
                    e.currentTarget.style.background = '#fff0f5';
                  }}
                >
                 
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
                    슬라임 영상 또는 사진 등록
                  </div>a
                  <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 1.5rem 0', lineHeight: '1.4' }}>
                    세로형 숏폼 비디오(mp4) 및<br/>고화질 사진(png, jpg) 지원
                  </p>
                  <span style={{ 
                    background: 'var(--primary-color)', 
                    color: 'white', 
                    fontWeight: '700', 
                    fontSize: '0.85rem', 
                    padding: '10px 22px', 
                    borderRadius: '24px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Plus size={16} /> 파일선택
                  </span>
                  <input 
                    id="media-upload-input"
                    type="file" 
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                /* 미디어 프리뷰 카드 (3:4 종횡비 숏폼 느낌) */
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  flex: 1,
                  minHeight: '380px',
                  borderRadius: '14px', 
                  overflow: 'hidden', 
                  backgroundColor: '#000',
                  border: '1px solid #e0e0e0'
                }}>
                  {isVideoFile ? (
                    <video 
                      src={previewUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="slime preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}

                  {/* 미디어 유형 배지 */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.8rem', fontWeight: '700', padding: '5px 10px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isVideoFile ? <Film size={14} color="#ff6b8b" /> : <ImageIcon size={14} color="#ff6b8b" />}
                    {isVideoFile ? '숏폼 비디오' : '슬라임 사진'}
                  </div>

                  {/* 변경 / 삭제 버튼 툴바 */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => document.getElementById('media-upload-input-change').click()}
                      style={{ background: 'white', border: '1px solid #ccc', color: '#333', padding: '5px 10px', borderRadius: '14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshCw size={13} /> 변경
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      style={{ background: '#ff2070', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <input 
                    id="media-upload-input-change"
                    type="file" 
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {/* 진행률 바 */}
              {isUploading && uploadStatus && (
                <div style={{ marginTop: '1rem', padding: '12px', borderRadius: '10px', backgroundColor: '#f8f0ff', border: '1px solid #e8d5f5' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#7c3aed', marginBottom: '6px' }}>
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
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', textAlign: 'right' }}>
                    {uploadProgress}%
                  </div>
                </div>
              )}
            </div>

            {/* 우측: 상세 정보 입력 카드 */}
            <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              {/* 제목 입력 */}
              <div>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                  제목 <span style={{ color: 'var(--primary-color)' }}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="예: 쫀득하고 퐁신한 복숭아 슬라임 플레잉" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: '12px 14px', 
                    borderRadius: '10px', 
                    border: '1px solid #ccc', 
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => e.target.style.borderColor = '#ccc'}
                />
              </div>

              {/* 해시태그 입력 */}
              <div>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                  해시태그 (최대 5개)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '10px', minHeight: '44px', alignItems: 'center', boxSizing: 'border-box' }}>
                  {hashtags.map((tag, idx) => (
                    <span key={idx} style={{ background: '#fff0f5', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', border: '1px solid #ffccd8' }}>
                      #{tag}
                      <button type="button" onClick={() => removeTag(idx)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={hashtags.length < 5 ? "엔터나 스페이스바로 태그 추가 (예: 클리어슬라임)" : "최대 5개까지 설정 완료"}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    disabled={hashtags.length >= 5}
                    style={{ border: 'none', outline: 'none', flex: 1, minWidth: '140px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* 설명 작성 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                  슬라임 이야기 / 설명 <span style={{ color: 'var(--primary-color)' }}>*</span>
                </label>
                <textarea 
                  placeholder="슬라임의 촉감, 베이스 조합, 플레이 느낌 등 자랑하고 싶은 포인트를 작성해 보세요!" 
                  required 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    flex: 1,
                    minHeight: '180px',
                    padding: '12px 14px', 
                    borderRadius: '10px', 
                    border: '1px solid #ccc', 
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => e.target.style.borderColor = '#ccc'}
                />
              </div>

              {/* 버튼 그룹 */}
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  disabled={isUploading}
                  style={{ 
                    flex: 1, 
                    padding: '13px', 
                    borderRadius: '10px', 
                    border: '1px solid #ccc', 
                    backgroundColor: 'white', 
                    color: '#666', 
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
                    flex: 2, 
                    padding: '13px', 
                    borderRadius: '10px', 
                    border: 'none', 
                    background: isUploading ? '#ff8da1' : 'var(--primary-color)', 
                    color: 'white', 
                    fontWeight: '800',
                    fontSize: '0.98rem',
                    cursor: isUploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUploading ? '업로드 중...' : isEditMode ? '수정 완료하기' : '등록하기'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 일반 커뮤니티 게시판 폼 (QNA, FREE, REVIEW, INFO) */
          <div style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            {/* 카테고리 선택 */}
            {boardType !== 'NOTICE' && !isPinned && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  카테고리 선택
                </label>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {['QNA', 'REVIEW', 'INFO', 'FREE'].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setBoardType(type)}
                      style={{
                        flex: 1,
                        padding: '12px 0',
                        borderRadius: '10px',
                        border: boardType === type ? '1px solid var(--primary-color)' : '1px solid #eee',
                        background: boardType === type ? 'var(--primary-color)' : '#f8f9fa',
                        color: boardType === type ? 'white' : '#666',
                        fontWeight: boardType === type ? '700' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {type === 'QNA' ? '질문' : type === 'REVIEW' ? '후기' : type === 'INFO' ? '정보' : '잡담'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 제목 입력 */}
            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                제목
              </label>
              <input 
                type="text" 
                placeholder="제목을 입력해 주세요" 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: '10px', 
                  border: '1px solid #ccc', 
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                onBlur={(e) => e.target.style.borderColor = '#ccc'}
              />
            </div>

            {/* 미디어 첨부 영역 */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                미디어 첨부 (선택)
              </label>
              {(!file && !previewUrl) ? (
                <div 
                  onClick={() => document.getElementById('file-upload-input-general').click()}
                  style={{ 
                    border: '2px dashed #ffccd8', 
                    borderRadius: '14px', 
                    padding: '2rem 1rem', 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    backgroundColor: '#fff0f5',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-color)' }}>사진 또는 영상 추가</div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>이미지(png, jpg) 또는 비디오(mp4) 파일</div>
                  <input 
                    id="file-upload-input-general"
                    type="file" 
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', backgroundColor: '#f9f9f9', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isVideoFile ? (
                        <video src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                        {file ? file.name : '기존 첨부 파일'}
                      </div>
                      {file && (
                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={handleRemoveFile} 
                      style={{ background: '#fff0f2', border: 'none', color: 'var(--primary-color)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 내용 입력 */}
            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                내용
              </label>
              <textarea 
                placeholder="내용을 입력해 주세요" 
                required 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: '10px', 
                  border: '1px solid #ccc', 
                  minHeight: '220px', 
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                onBlur={(e) => e.target.style.borderColor = '#ccc'}
              />
            </div>

            {/* 버튼 그룹 */}
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                disabled={isUploading}
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: '10px', 
                  border: '1px solid #ccc', 
                  backgroundColor: 'white', 
                  color: '#666', 
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
                  padding: '14px', 
                  borderRadius: '10px', 
                  border: 'none', 
                  backgroundColor: isUploading ? '#ff8da1' : 'var(--primary-color)', 
                  color: 'white', 
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: isUploading ? 'not-allowed' : 'pointer'
                }}
              >
                {isUploading ? '업로드 중...' : isEditMode ? '수정하기' : '등록하기'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
