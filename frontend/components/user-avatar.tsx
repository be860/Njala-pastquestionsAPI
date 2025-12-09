import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, getInitials, resolveAvatarUrl } from '@/lib/utils'

type UserAvatarProps = {
  name?: string | null
  avatarUrl?: string | null
  className?: string
  fallbackClassName?: string
  /**
   * Optional custom content for the fallback.
   * If omitted, initials derived from the name are shown.
   */
  fallbackText?: string
}

export function UserAvatar({
  name,
  avatarUrl,
  className,
  fallbackClassName,
  fallbackText,
}: UserAvatarProps) {
  const resolved = resolveAvatarUrl(avatarUrl)
  const initials = (fallbackText || getInitials(name) || 'U').slice(0, 2)

  return (
    <Avatar className={cn('size-10', className)}>
      {resolved && (
        <AvatarImage
          src={resolved}
          alt={name ? `${name}'s avatar` : 'User avatar'}
          referrerPolicy="no-referrer"
        />
      )}
      <AvatarFallback
        delayMs={0}
        className={cn(
          'bg-gradient-to-br from-primary to-primary/80 text-white font-bold uppercase',
          fallbackClassName,
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}


