import { User } from "lucide-react"
import type {}

  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginCredentials,
  RegisterData,
  ResetPasswordRequest,
  User,
  UserProfile,
} from "@/lib/api/types"

// Re-export auth types for convenience;
export type {}
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UserProfile,
} from "@/lib/api/types"

export interface AuthContextType {}
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerification: () => Promise<void>
  socialLogin: (provider: "google" | "github") => Promise<void>
  refreshTokens: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>
}
