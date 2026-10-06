import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonClasses } from './buttonStyles'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Texto accesible (también se usa como tooltip). */
  label: string
  icon: ReactNode
  size?: 'icon' | 'icon-sm'
}

export function IconButton({ label, icon, size = 'icon-sm', className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={buttonClasses('ghost', size, className)}
      {...rest}
    >
      {icon}
    </button>
  )
}
