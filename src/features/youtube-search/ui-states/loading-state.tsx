import { Blocks } from "loading-dev"

export function YoutubeLoading() {
  return (
    <div className="relative w-full h-full grid place-content-center p-4">
      <div className="flex flex-col items-center space-y-10">
        <Blocks size={100} />
        <h2>Searching Songs</h2>
      </div>
    </div>
  )
}
