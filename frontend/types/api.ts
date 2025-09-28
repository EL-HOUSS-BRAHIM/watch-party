
// Re-export all types from the new API types structure;
export * from "@/lib/api/types"

// Keep any additional custom types here if needed;
export interface UploadProgress {}
  loaded: number;
  total: number;
  percentage: number;
}

export interface APIErrorResponse {}
  message: string;
  code?: string;
  field_errors?: Record<string, string[]>
  non_field_errors?: string[]
}
