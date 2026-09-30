import { Skeleton } from '@/components/ui/skeleton'

export function SettingsTabLoadingState() {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-28 w-full rounded-md' />
      <Skeleton className='h-36 w-full rounded-md' />
    </div>
  )
}
