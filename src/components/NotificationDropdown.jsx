import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../api/notification';
import { formatDate } from '../utils/formatDate';
import { useAuthStore } from '../store';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function NotificationDropdown({ onClose }) {
  const { nickname } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe = () => {};
    
    if (nickname) {
      setLoading(true);
      const q = query(
        collection(db, "notifications", nickname, "userNotifications"),
        orderBy("createdAt", "desc")
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          docId: doc.id
        }));
        
        // 안 읽은 알림은 전부 보이고, 읽은 알림은 최근 3개까지만 표시 (시간순 정렬)
        const unreadNotifs = data.filter(n => !(n.isRead !== undefined ? n.isRead : n.read));
        const recentReadNotifs = data.filter(n => (n.isRead !== undefined ? n.isRead : n.read)).slice(0, 3);
        const displayNotifs = [...unreadNotifs, ...recentReadNotifs].sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        
        setNotifications(displayNotifs);
        setLoading(false);
      }, (err) => {
        console.error("Firebase fetch error:", err);
        setLoading(false);
      });
    }

    // 밖을 클릭하면 닫히도록 이벤트 리스너 추가
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) && 
        !event.target.closest('.notification-btn')
      ) {
        onClose();
      }
    };
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      unsubscribe();
    };
  }, [onClose, nickname]);

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAllAsRead();
      // Firestore 데이터는 Spring Boot에서 업데이트 처리되므로 onSnapshot에 의해 자동 갱신됩니다.
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const handleNotificationClick = async (notif) => {
    const isAlreadyRead = notif.isRead !== undefined ? notif.isRead : notif.read;
    const targetUrl = notif.relatedUrl || notif.related_url;
    const notifId = notif.id || notif.docId; // ID 안전하게 가져오기
    
    // 1. 읽음 처리
    if (!isAlreadyRead && notifId) {
      try {
        await notificationApi.markAsRead(notifId);
      } catch (e) {
        console.error("Failed to mark as read", e);
      }
    }
    
    // 2. 창 닫기 (이동 전에 먼저 닫기)
    onClose(true); 
    
    // 3. 페이지 이동
    if (targetUrl) {
      const [path, hash] = targetUrl.split('#');
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;

      if (currentPath === path) {
        // 같은 페이지인 경우
        if (hash) {
          if (currentHash === `#${hash}`) {
            // 이미 해시가 같으면 스크롤만 직접 수행
            const el = document.getElementById(hash);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // 일시적인 하이라이트 효과
              const originalBg = el.style.backgroundColor;
              el.style.transition = 'background-color 1s ease';
              el.style.backgroundColor = '#fff0f2';
              setTimeout(() => { el.style.backgroundColor = originalBg; }, 2000);
            }
          } else {
            // 해시만 다를 경우 해시 변경 -> hashchange 리스너가 스크롤 수행
            window.location.hash = hash;
          }
        } else {
          // 해시가 없는 같은 페이지인 경우 최상단으로
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // 다른 페이지인 경우 해시를 포함하여 전체 주소로 navigate
        navigate(targetUrl);
      }
    } else {
      console.warn("이 알림은 이동할 수 있는 링크 정보가 없습니다.");
    }
  };

  return (
    <div className="notification-dropdown glass-card" ref={dropdownRef}>
      <div className="notification-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <h4 style={{ margin: 0 }}>알림</h4>
        {notifications.some(n => !(n.isRead !== undefined ? n.isRead : n.read)) && (
          <button 
            onClick={handleMarkAllAsRead} 
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            모두 읽음
          </button>
        )}
      </div>
      <div className="notification-list">
        {loading ? (
          <div className="notification-empty">로딩 중...</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">새로운 알림이 없습니다.</div>
        ) : (
          notifications.map(notif => {
            const isAlreadyRead = notif.isRead !== undefined ? notif.isRead : notif.read;
            const targetUrl = notif.relatedUrl || notif.related_url || '';
            const msg = notif.message || '새로운 알림이 도착했습니다.';
            
            return (
            <div 
              key={notif.docId || Math.random()} 
              className={`notification-item ${!isAlreadyRead ? 'unread' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="notification-icon">
                {notif.type === 'NEW_COMMENT' ? '💬' : 
                 notif.type === 'NEW_LIKE' ? '❤️' : 
                 notif.type === 'NEW_REVIEW' ? '⭐' : 
                 notif.type === 'WISHLIST_UPDATE' ? '🛍️' : 
                 notif.type === 'SELLER_APPROVAL' ? '✅' : 
                 notif.type === 'SELLER_REJECTED' ? '❌' : 
                 notif.type === 'NEW_SELLER_APPLICATION' ? '📋' : 
                 notif.type === 'NEW_REPORT' ? '🚨' : 
                 notif.type === 'SYSTEM_ALERT' ? '📣' : '🔔'}
              </div>
              <div className="notification-content">
                <p className="notification-message">
                  {msg.includes('님이') ? msg.split('님이').map((text, i, arr) => 
                    i === 0 && arr.length > 1 ? <strong key={i}>{text}님이</strong> : text
                  ) : msg}
                </p>
                <span className="notification-time">{formatDate(notif.createdAt)}</span>
              </div>
              {!isAlreadyRead && <div className="notification-dot" />}
            </div>
            );
          })
        )}
      </div>
      <div style={{ padding: '0.8rem', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <button 
          onClick={() => { onClose(); navigate('/mypage?tab=notifications'); }} 
          style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          모든 알림 보기
        </button>
      </div>
    </div>
  );
}
