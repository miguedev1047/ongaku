import type { Playlist, PlaylistSong } from "@ongaku/types";

export type GetPlaylists = () => Promise<Playlist[]>;
export type GetPlaylistSongs = (playlist: string) => Promise<PlaylistSong[]>;
