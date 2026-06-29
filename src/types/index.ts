export interface FileMetadata {
  id: number;
  short_id: string;
  original_filename: string;
  stored_filename: string;
  content_type: string;
  file_size: number;
  password_hash: string | null;
  max_access_count: number | null;
  access_count: number;
  expires_at: Date | null;
  created_at: Date;
  ip_address: string | null;
  removed_at: Date | null;
}

export interface UploadResponse {
  short_id: string;
  url: string;
  original_filename: string;
  expires_at: string | null;
  file_count: number;
}

export interface FileInfoResponse {
  short_id: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  requires_password: boolean;
  is_expired: boolean;
  is_access_exhausted: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface UploadOptions {
  password?: string;
  oneTime?: boolean;
  ttlMinutes?: number;
}
