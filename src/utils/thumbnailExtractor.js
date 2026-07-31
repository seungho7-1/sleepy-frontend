export const extractThumbnailFromVideo = (file, timeInSeconds = 0.1) => {
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
      // Seek to the target time
      video.currentTime = timeInSeconds;
    };

    // When seeking is finished, draw the frame to a canvas
    video.onseeked = () => {
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
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Error loading video file to extract thumbnail'));
    };
  });
};

export const extractThumbnailFromUrl = (url, timeInSeconds = 0.1) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; // Important for fetching from S3/external URLs
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    video.src = url;

    video.onloadedmetadata = () => {
      video.currentTime = timeInSeconds;
    };

    video.onseeked = () => {
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
    };

    video.onerror = (e) => {
      reject(new Error('Error loading video URL to extract thumbnail'));
    };
  });
};
