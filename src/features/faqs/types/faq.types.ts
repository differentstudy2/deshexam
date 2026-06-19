export type FAQStatus = "draft" | "published" | "hidden";

export interface FAQ {
  id: string;

  question: string;
  answer: string;

  categoryId: string;
  tags: string[];

  status: FAQStatus;

  order: number;

  seo: {
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    schemaEnabled: boolean;
  };

  featured: boolean;
  views: number;

  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface FAQFilters {
  search?: string;
  categoryId?: string;
  status?: FAQStatus;
  tag?: string;
  sortBy?: "latest" | "oldest" | "most_viewed" | "alphabetical";
}

export type CreateFAQDTO = Omit<FAQ, "id" | "views" | "createdAt" | "updatedAt">;
export type UpdateFAQDTO = Partial<CreateFAQDTO>;
