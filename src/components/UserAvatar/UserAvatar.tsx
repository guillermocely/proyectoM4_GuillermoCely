import { useAvatar } from '../../hooks/useAvatar';
import type { UserAvatarProps } from './UserAvatar.types';
import './UserAvatar.css';

// Avatar circular: muestra la foto guardada o la inicial del email.
export default function UserAvatar({ uid, email, size = 'sm' }: UserAvatarProps) {
  const { avatar } = useAvatar(uid);
  const initial = email?.trim().charAt(0).toUpperCase() || '?';

  return (
    <span className={`avatar avatar--${size}`}>
      {avatar ? <img src={avatar} alt="" /> : <span aria-hidden="true">{initial}</span>}
    </span>
  );
}
