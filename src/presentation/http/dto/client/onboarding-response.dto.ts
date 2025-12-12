import type { CompleteOnboardingResult } from "@/application/client/use-cases/complete-onboarding/complete-onboarding.use-case";

/**
 * Onboarding Response DTO
 * 
 * Data Transfer Object for onboarding completion API response.
 * Returns summary information after successful onboarding.
 */
export class OnboardingResponseDto {
  clientId!: string;
  userId!: string;
  specializationCount!: number;
  onboardingCompleted!: boolean;

  /**
   * Maps CompleteOnboardingResult to DTO
   * 
   * @param result - Use case result
   * @returns OnboardingResponseDto instance
   */
  static fromResult(result: CompleteOnboardingResult): OnboardingResponseDto {
    return {
      clientId: result.clientId,
      userId: result.userId,
      specializationCount: result.specializationCount,
      onboardingCompleted: result.onboardingCompleted,
    };
  }
}