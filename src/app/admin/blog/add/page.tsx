import { PostEditor } from '@/components/admin/PostEditor';

export default function AddBlogPage() {
  return (
    <PostEditor 
      contentType="Blog" 
      backUrl="/admin/blog" 
    />
  );
}
