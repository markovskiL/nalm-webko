"use server"

import { getPayloadClient } from "@/lib/payload"

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

    // Format the submission data for Payload's form submissions
    const submissionData = Object.entries(data).map(([field, value]) => ({
      field,
      value: String(value ?? ""),
    }))

    await payload.create({
      collection: "form-submissions",
      data: {
        form: typeof formId === "string" ? parseInt(formId, 10) : formId,
        submissionData,
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
