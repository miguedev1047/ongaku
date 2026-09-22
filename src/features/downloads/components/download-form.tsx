import { Button } from "@/components/ui/button"
import {
  FieldDescription,
  Field,
  FieldLabel,
  FieldError,
  FieldGroup
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { checkBinariesQueryOpts } from "@/shared/queries/binaries"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import {
  downloadSongSchema,
  type TDownloadSongSchema
} from "@/shared/schemas/download-playlist"
import { useForm } from "@tanstack/react-form"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { useDownloadsStore } from "@/shared/stores/use-downloads"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

export function DownloadForm() {
  const { data: playlists } = useSuspenseQuery(playlistsQueryOpts())
  const { data: isBinariesInstalled } = useSuspenseQuery(
    checkBinariesQueryOpts()
  )

  const isDownloading = useDownloadsStore((state) => state.isDownloading)
  const setIsDownloading = useDownloadsStore((state) => state.setIsDownloading)
  const setSong = useDownloadsStore((state) => state.setSong)

  const queryClient = useQueryClient()
  const { queryKey } = playlistsQueryOpts()

  const mutation = useMutation({
    mutationFn: async (value: TDownloadSongSchema) => {
      setIsDownloading(true)
      try {
        const song = await invoke<TPlaylistSong>("download_song", {
          url: value.url,
          playlistName: value.playlistName
        })

        setSong(song)
        return song
      } finally {
        setIsDownloading(false)
      }
    },
    onMutate: () => {
      setSong(null)
    },
    onSuccess: async () => {
      toast.success("The song has downloaded successfully!")
      form.reset()
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error) => {
      console.log(error)
      toast.error("An error occurred while downloading the song")
    }
  })

  const form = useForm({
    defaultValues: {
      url: "",
      playlistName: ""
    },
    validators: {
      onSubmit: downloadSongSchema
    },
    onSubmit: ({ value }) => {
      mutation.mutate({ url: value.url, playlistName: value.playlistName })
    }
  })

  const isPending = mutation.isPending || isDownloading

  if (!isBinariesInstalled) return null

  return (
    <div>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field
            name="url"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Youtube URL</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="https://..."
                    autoComplete="false"
                    disabled={isPending}
                  />
                  <FieldDescription>
                    Put the youtube url song want you download it
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="playlistName"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Playlists</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (value) field.handleChange(value)
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={isInvalid}
                      className="w-full"
                      disabled={isPending}
                    >
                      <SelectValue placeholder="Select a playlist" />
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.map((item) => (
                        <SelectItem
                          key={item.id}
                          value={item.name}
                        >
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </FieldGroup>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending && <Spinner />}
            {isPending ? "Downloading..." : "Download"}
          </Button>
        </div>
      </form>
    </div>
  )
}
