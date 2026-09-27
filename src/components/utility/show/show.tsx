import { ReactNode } from "react"

type ShowProps<T> = {
  when: T | null | undefined | false
  fallback?: ReactNode
  children:
    | ReactNode
    | ((item: Exclude<T, null | undefined | false>) => ReactNode)
}

export function Show<T>({ when, fallback = null, children }: ShowProps<T>) {
  if (!when) {
    return <>{fallback}</>
  }

  if (typeof children === "function") {
    return (
      <>
        {(
          children as (
            item: Exclude<T, null | undefined | false>
          ) => ReactNode
        )(when as Exclude<T, null | undefined | false>)}
      </>
    )
  }

  return <>{children}</>
}
