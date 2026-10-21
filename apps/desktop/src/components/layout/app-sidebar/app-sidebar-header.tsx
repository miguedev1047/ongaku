import { SidebarHeader, SidebarTrigger } from '@ongaku/ui'

export function AppSidebarHeader() {
  return (
    <SidebarHeader className='flex flex-row items-center justify-between p-2 border-b h-12 bg-accent/40 backdrop-blur-md'>
      <div className='flex items-center gap-2 overflow-hidden px-1 group-data-[collapsible=icon]:hidden'>
        <div className='flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground overflow-hidden'>
          <img src='/ongaku-logo.png' className='size-full object-cover' />
        </div>
        <span className='font-semibold text-sm tracking-tight truncate'>
          Ongaku
        </span>
      </div>
      <SidebarTrigger className='group-data-[collapsible=icon]:mx-auto' />
    </SidebarHeader>
  )
}
