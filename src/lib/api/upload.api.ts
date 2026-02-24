import apiClient from './client';

export interface UploadedMedia {
  url: string;
  type: 'image' | 'video';
  mimetype: string;
}

export const uploadApi = {
  uploadMedia: async (file: File): Promise<UploadedMedia> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ data: UploadedMedia }>('/upload/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};
