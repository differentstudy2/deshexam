"use client";

import { useEffect, useState } from "react";
import { FAQForm } from "@/features/faqs/components/faq-form";
import { getFaqById, updateFaq } from "@/features/faqs/services/faq.api";
import { CreateFAQDTO, FAQ } from "@/features/faqs/types/faq.types";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditFAQPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const router = useRouter();
  const [initialData, setInitialData] = useState<FAQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchFaq = async () => {
      try {
        const data = await getFaqById(id);
        if (!data) {
          toast({ variant: "destructive", title: "Not Found", description: "FAQ could not be found." });
          router.push("/admin/faqs");
          return;
        }
        setInitialData(data);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load FAQ." });
        router.push("/admin/faqs");
      } finally {
        setLoading(false);
      }
    };
    fetchFaq();
  }, [id, router, toast]);

  const handleSubmit = async (data: CreateFAQDTO) => {
    try {
      setIsSubmitting(true);
      await updateFaq(id, data);
      toast({ title: "FAQ Updated", description: "The FAQ has been successfully updated." });
      router.push("/admin/faqs");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <div className="container mx-auto py-6">
      <FAQForm 
        title="Edit FAQ" 
        initialData={initialData}
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
}
