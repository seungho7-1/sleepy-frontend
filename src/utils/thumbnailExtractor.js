export const extractThumbnailFromVideo = (file, timeInSeconds = 1.0) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    // Set a blob URL for the file
    const url = URL.createObjectURL(file);
    video.src = url;

    // Wait for the metadata to load to know the dimensions
    video.onloadedmetadata = () => {
      // 0.1초는 페이드인 효과나 로딩 딜레이로 인해 검은 화면이 캡처될 확률이 높으므로
      // 영상의 중간 혹은 1초 지점을 썸네일로 사용합니다.
      let targetTime = timeInSeconds;
      if (video.duration && video.duration > 0) {
        targetTime = Math.min(timeInSeconds, video.duration / 2);
      }
      video.currentTime = targetTime;
    };

    // When seeking is finished, draw the frame to a canvas
    video.onseeked = () => {
      // iOS Safari 버그 방지: 캔버스에 그리기 전 약간의 딜레이
      setTimeout(() => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert the canvas to a JPEG blob
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              // Create a File object from the Blob
              const thumbnailFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "-thumb.jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(thumbnailFile);
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
          }, 'image/jpeg', 0.8);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      }, 100); // 100ms delay to ensure frame is decoded
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Error loading video file to extract thumbnail'));
    };
  });
};

export const extractThumbnailFromUrl = (url, timeInSeconds = 1.0) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; // Important for fetching from S3/external URLs
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    video.src = url;

    video.onloadedmetadata = () => {
      let targetTime = timeInSeconds;
      if (video.duration && video.duration > 0) {
        targetTime = Math.min(timeInSeconds, video.duration / 2);
      }
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      setTimeout(() => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], `thumb-${Date.now()}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(thumbnailFile);
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
          }, 'image/jpeg', 0.8);
        } catch (err) {
          reject(err);
        }
      }, 100);
    };

    video.onerror = (e) => {
      reject(new Error('Error loading video URL to extract thumbnail'));
    };
  });
};
