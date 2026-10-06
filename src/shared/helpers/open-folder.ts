import { platformService } from "@/infrastructure/platform"

export async function openFolder(path: string): Promise<void> {
  await platformService.invoke("open_folder", { path })
}
