"use client";

import { FAQForm } from "@/features/faqs/components/faq-form";
import { createFaq } from "@/features/faqs/services/faq.api";
import { CreateFAQDTO } from "@/features/faqs/types/faq.types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateFAQPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateFAQDTO) => {
    try {
      setIsSubmitting(true);
      await createFaq(data);
      toast({ title: "FAQ Created", description: "The FAQ has been successfully created." });
      router.push("/admin/faqs");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <FAQForm 
        title="Create New FAQ" 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
}
