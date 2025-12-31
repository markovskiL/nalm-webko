"use server"

import { getPayloadClient } from "@webko-labs/sdk"

interface SubmitResult {
  success: boolean
  error?: string
}

/**
 * Server action to submit form data to Payload CMS.
 * Creates a form submission entry in the database.
 */
export async function submitFormAction(
  formId: string | number,
  data: Record<string, unknown>
): Promise<SubmitResult> {
  try {
    const payload = await getPayloadClient()

    await payload.create({
      collection: "form-submissions",
      draft: false,
      data: {
        form: typeof formId === "string" ? parseInt(formId, 10) : formId,
        submittedAt: new Date().toISOString(),
        data,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Form submission error:", error)
    return {
      success: false,
      error: "Failed to submit form. Please try again.",
    }
  }
}
