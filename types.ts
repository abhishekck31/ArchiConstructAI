export type Role = 'user' | 'model';
export type AspectRatio = '16:9' | '9:16';
export type GenerationMode = 'video' | 'image';

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: {
    src: string; // base64
    mimeType: string;
  };
  video?: string; // object URL for <video>
  isLoadingVideo?: boolean;
  isLoadingImage?: boolean;
}
