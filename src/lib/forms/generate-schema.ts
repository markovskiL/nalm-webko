import { z } from "zod"

interface FormField {
  name: string
  type?: string | null
  required?: boolean | null
}

interface FormDefinition {
  id: string | number
  fields?: FormField[] | null
}

/**
 * Generate a Zod schema from a Payload form definition.
 * This creates validation rules based on field types and required status.
 */
export function generateFormSchema(
  form: unknown,
  messages: Record<string, string> = {}
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const formData = form as FormDefinition
  const schemaFields: Record<string, z.ZodTypeAny> = {}

  const requiredMessage = messages.required || "This field is required"
  const invalidEmailMessage = messages.invalidEmail || "Please enter a valid email address"

  for (const field of formData.fields ?? []) {
    let fieldSchema: z.ZodTypeAny

    switch (field.type) {
      case "email":
        fieldSchema = z.string().email(invalidEmailMessage)
        break
      case "number":
        fieldSchema = z.coerce.number()
        break
      case "checkbox":
        fieldSchema = z.boolean()
        break
      case "textarea":
      case "text":
      default:
        fieldSchema = z.string()
        break
    }

    if (field.required) {
      if (field.type === "checkbox") {
        fieldSchema = (fieldSchema as z.ZodBoolean).refine((val) => val === true, {
          message: requiredMessage,
        })
      } else if (field.type === "number") {
        // Number fields are already coerced, just add min check
        fieldSchema = (fieldSchema as z.ZodNumber).min(1, requiredMessage)
      } else {
        fieldSchema = (fieldSchema as z.ZodString).min(1, requiredMessage)
      }
    } else {
      fieldSchema = fieldSchema.optional()
    }

    schemaFields[field.name] = fieldSchema
  }

  return z.object(schemaFields)
}
