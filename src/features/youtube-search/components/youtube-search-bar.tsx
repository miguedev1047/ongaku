import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Field, FieldError } from "@/components/ui/field"
import { youtubeSearchSchema } from "@/shared/schemas/youtube-search"

interface YoutubeSearchBarProps {
  initialQuery?: string
}

export function YoutubeSearchBar({ initialQuery = "" }: YoutubeSearchBarProps) {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: { q: initialQuery },
    validators: { onSubmit: youtubeSearchSchema },
    onSubmit: async ({ value }) => {
      await navigate({ to: "/search-youtube", search: { q: value.q } })
    }
  })

  useEffect(() => {
    form.setFieldValue("q", initialQuery)
  }, [initialQuery])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field name="q">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field
              data-invalid={isInvalid}
              className="w-full"
            >
              <InputGroup aria-invalid={isInvalid}>
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon icon={SearchIcon} />
                </InputGroupAddon>
                <InputGroupInput
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Type to search..."
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="submit"
                    variant="secondary"
                  >
                    Search
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
    </form>
  )
}
