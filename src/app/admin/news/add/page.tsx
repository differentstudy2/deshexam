import { PostEditor } from '@/components/admin/PostEditor';

export default function AddNewsPage() {
  return (
    <PostEditor 
      contentType="News" 
      backUrl="/admin/news" 
    />
  );
}
