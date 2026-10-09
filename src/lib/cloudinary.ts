
type UploadToCloudinaryOptions = {
  forceFormat?: string;
};

export const uploadToCloudinary = async (file: File, options: UploadToCloudinaryOptions = {}): Promise<string> => {
  const cloudName = 'dkmqvyso4';
  const uploadPreset = 'baojiajia_upload';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (options.forceFormat) {
    formData.append('format', options.forceFormat);
  }

  try {
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const uploadImageToCloudinaryWebp = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, { forceFormat: 'webp' });
};

// 顯示用的縮圖網址：原圖不動，只在網址裡加上參數，讓 Cloudinary 即時縮成指定寬度並壓縮。
// f_auto 自動選瀏覽器支援的格式、q_auto 自動調整畫質。非 Cloudinary 的網址（例如 Readdy 舊圖）原樣回傳。
export const cloudinaryImage = (url: string | null | undefined, width: number): string => {
  if (!url) return '';
  const marker = '/image/upload/';
  if (!url.includes('res.cloudinary.com') || !url.includes(marker)) return url;
  return url.replace(marker, `${marker}f_auto,q_auto,w_${width}/`);
};
