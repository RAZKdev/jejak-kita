import React from 'react';
import { AlertCircle, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center">
      <div className="mb-4 rounded-full bg-surface p-4 text-brand">
        {icon || <FolderOpen className="h-8 w-8" />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-foreground-muted leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Terjadi Kesalahan',
  message,
  retryLabel = 'Coba Lagi',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-900">
      <div className="mb-3 rounded-full bg-red-100 p-3 text-red-700">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-red-700/90">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry} className="bg-white">
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function LoadingState({ message = 'Memuat data perjalanan...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-foreground-muted">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
      <p className="mt-3 text-sm">{message}</p>
    </div>
  );
}
