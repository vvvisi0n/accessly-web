export interface PhotoUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

export default function PhotoUpload(_props: PhotoUploadProps) {
  return null;
}
