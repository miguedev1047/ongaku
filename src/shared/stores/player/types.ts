export type LocalPlayerState = "idle" | "playing" | "paused"

export type PlaybackContext =
  | { type: "playlist"; playlistName: string }
  | { type: "library" }

export type ActivePlayerType = "local" | "streaming" | null
