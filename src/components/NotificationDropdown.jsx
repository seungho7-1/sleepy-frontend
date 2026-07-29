import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../api/notification';
import { formatDate } from '../utils/formatDate';
import { useAuthStore } from '../store';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

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
      const envPrefix = import.meta.env.MODE === 'development' ? 'dev_' : '';
      const q = query(
        collection(db, `${envPrefix}notifications`, nickname, "userNotifications"),
        orderBy("createdAt", "desc")
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        const rawData = snapshot.docs.map(doc => ({
          ...doc.data(),
          docId: doc.id
        }));
        
        // 프론트엔드 중복 알림 방어 로직 (메시지+시간 기준 중복 제거)
        const uniqueDataMap = new Map();
        rawData.forEach(n => {
          // Firebase의 id 또는 메시지와 createdAt 시간을 조합하여 유니크 키 생성
          const key = n.id ? String(n.id) : `${n.message}_${n.createdAt?.seconds}`;
          if (!uniqueDataMap.has(key)) {
            uniqueDataMap.set(key, n);
          }
        });
        const data = Array.from(uniqueDataMap.values());
        
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
      // 1. 백엔드 DB 전체 읽음 처리
      await notificationApi.markAllAsRead();
    } catch (e) {
      console.error("Backend DB markAllAsRead failed, continuing to Firebase sync...", e);
    }
    
    // 2. 파이어베이스와 DB의 isRead 상태가 어긋난 경우를 대비하여
    // 프론트엔드에서 파악된 미읽음 알림들에 대해 개별 읽음 처리(파이어베이스 싱크)를 강제합니다.
    try {
      const unreadNotifs = notifications.filter(n => !(n.isRead !== undefined ? n.isRead : n.read));
      await Promise.all(unreadNotifs.map(async (notif) => {
        const notifId = notif.id || notif.docId;
        if (notifId) {
          try {
            await notificationApi.markAsRead(notifId);
          } catch (err) {
            console.error("Backend DB markAsRead failed for", notifId, err);
          }
          // 프론트엔드에서 파이어베이스 직접 업데이트 강제 실행
          try {
            const envPrefix = import.meta.env.MODE === 'development' ? 'dev_' : '';
            const docRef = doc(db, `${envPrefix}notifications`, nickname, "userNotifications", String(notifId));
            await updateDoc(docRef, { isRead: true });
          } catch (fbErr) {
            console.error("Firebase direct update failed", fbErr);
          }
        }
      }));
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const handleNotificationClick = async (notif) => {
    const isAlreadyRead = notif.isRead !== undefined ? notif.isRead : notif.read;
    const targetUrl = notif.relatedUrl || notif.related_url;
    const notifId = notif.id || notif.docId; // ID 안전하게 가져오기
    
    // 1. 읽음 처리 (비동기로 백그라운드에서 실행, 네비게이션 지연 방지)
    if (!isAlreadyRead && notifId) {
      notificationApi.markAsRead(notifId).catch(e => console.error("Failed to mark as read", e));
      const envPrefix = import.meta.env.MODE === 'development' ? 'dev_' : '';
      const docRef = doc(db, `${envPrefix}notifications`, nickname, "userNotifications", String(notifId));
      updateDoc(docRef, { isRead: true }).catch(fbErr => console.error("Firebase direct update failed", fbErr));
    }
    
    // 2. 페이지 이동
    if (targetUrl) {
      // 구버전 알림 호환성을 위한 경로 강제 변환
      let finalUrl = targetUrl;
      if (finalUrl === '/admin/sellers') finalUrl = '/admin/applications';
      if (finalUrl === '/my/seller-status') finalUrl = '/mypage';

      const [path, hash] = finalUrl.split('#');
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
        navigate(finalUrl);
      }
    } else {
      console.warn("이 알림은 이동할 수 있는 링크 정보가 없습니다.");
    }
    
    // 3. 창 닫기 (이동 후에 닫기)
    onClose();
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
              <div className="notification-icon" style={{ 
                background: notif.type === 'NEW_LIKE' ? '#fff0f5' : 
                            notif.type === 'NEW_COMMENT' ? '#f0f8ff' : 
                            notif.type === 'NEW_REVIEW' ? '#fffbf0' : 
                            (notif.type === 'SELLER_APPROVAL' || notif.type === 'NEW_SELLER_APPLICATION') ? '#f0fdf4' : 
                            (notif.type === 'SELLER_REJECTED' || notif.type === 'NEW_REPORT') ? '#fef2f2' : '#f8f9fa'
              }}>
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
