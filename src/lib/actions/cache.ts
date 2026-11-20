"use server";

import { revalidatePath } from "next/cache";

export async function clearAllCache() {
  try {
    revalidatePath("/", "layout");
    return { success: true, message: "Cache cleared successfully!" };
  } catch (error) {
    console.error("Error clearing cache:", error);
    return { success: false, message: "Failed to clear cache." };
  }
}
