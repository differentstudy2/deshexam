import { PostEditor } from '@/components/admin/PostEditor';

export default function AddJobPage() {
  return (
    <PostEditor 
      contentType="Job" 
      backUrl="/admin/job" 
    />
  );
}
