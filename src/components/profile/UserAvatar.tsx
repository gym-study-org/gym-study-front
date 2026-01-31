'use client';

import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { usersApi } from '@/lib/api/users.api';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onAvatarChange?: (newUrl: string) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export function UserAvatar({
  src,
  name,
  size = 'md',
  editable = false,
  onAvatarChange,
  className,
}: UserAvatarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPEG, PNG ou WebP.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const updatedUser = await usersApi.uploadAvatar(file);
      toast.success('Avatar atualizado com sucesso!');
      onAvatarChange?.(updatedUser.avatar_url || '');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao fazer upload do avatar');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Avatar
        className={cn(
          sizeClasses[size],
          editable && 'cursor-pointer transition-opacity hover:opacity-80'
        )}
        onClick={handleClick}
      >
        <AvatarImage src={src || undefined} alt={name} />
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full shadow-md"
            onClick={handleClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Camera className="h-3 w-3" />
            )}
          </Button>
        </>
      )}
    </div>
  );
}
