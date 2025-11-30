"use client"

import { GDriveMovie } from "@/hooks/useVideos"
import { IconButton } from "@/components/ui/icon-button"
import { formatDuration, formatFileSize } from "./video-utils"

interface GDriveFileCardProps {
  movie: GDriveMovie
  isImporting: boolean
  isStreaming: boolean
  isDeleting: boolean
  onImport: (movie: GDriveMovie) => void
  onStream: (videoId: string) => void
  onDelete: (videoId: string, movie: GDriveMovie) => void
}

export function GDriveFileCard({
  movie,
  isImporting,
  isStreaming,
  isDeleting,
  onImport,
  onStream,
  onDelete,
}: GDriveFileCardProps) {
  const handleImport = () => {
    onImport(movie)
  }

  const handleStream = () => {
    if (movie.video_id) {
      onStream(movie.video_id)
    }
  }

  const handleDelete = () => {
    if (movie.video_id && confirm("Delete this Google Drive video from your library and Drive?")) {
      onDelete(movie.video_id, movie)
    }
  }

  return (
    <article className="bg-white/60 border border-white/60 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all">
      {/* Thumbnail */}
      <div className="aspect-video bg-brand-navy/5 flex items-center justify-center relative group">
        {movie.thumbnail_url ? (
          <img
            src={movie.thumbnail_url}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-4xl select-none" aria-hidden="true">
            🎞️
          </div>
        )}
        
        {/* Duration Badge */}
        {movie.duration && (
          <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold">
            {formatDuration(movie.duration)}
          </span>
        )}
        
        {/* Imported Badge */}
        {movie.in_database && (
          <span className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg font-bold shadow-sm">
            Imported
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <h4 className="text-lg font-bold text-brand-navy line-clamp-2">
          {movie.title}
        </h4>
        
        {/* Metadata */}
        <dl className="text-xs text-brand-navy/60 space-y-1 font-medium">
          {movie.size && (
            <div>
              <dt className="sr-only">Size</dt>
              <dd>Size: {formatFileSize(movie.size)}</dd>
            </div>
          )}
          {movie.duration && (
            <div>
              <dt className="sr-only">Duration</dt>
              <dd>Duration: {formatDuration(movie.duration)}</dd>
            </div>
          )}
          {movie.modified_time && (
            <div>
              <dt className="sr-only">Last updated</dt>
              <dd>Updated: {new Date(movie.modified_time).toLocaleDateString()}</dd>
            </div>
          )}
          {movie.resolution && (
            <div>
              <dt className="sr-only">Resolution</dt>
              <dd>Resolution: {movie.resolution}</dd>
            </div>
          )}
        </dl>

        {/* Actions */}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {movie.in_database && movie.video_id ? (
            <>
              <IconButton
                onClick={handleStream}
                loading={isStreaming}
                className="flex-1 bg-brand-navy text-white hover:bg-brand-navy-light"
                aria-label={`Stream ${movie.title}`}
              >
                <span aria-hidden="true">▶️</span> Stream
              </IconButton>
              <IconButton
                onClick={handleDelete}
                loading={isDeleting}
                variant="danger"
                className="flex-1"
                aria-label={`Delete ${movie.title}`}
              >
                <span aria-hidden="true">🗑️</span> Delete
              </IconButton>
            </>
          ) : (
            <IconButton
              onClick={handleImport}
              loading={isImporting}
              className="w-full btn-gradient"
              aria-label={`Import ${movie.title} to library`}
            >
              <span aria-hidden="true">📥</span> Import to Library
            </IconButton>
          )}
        </div>
      </div>
    </article>
  )
}
