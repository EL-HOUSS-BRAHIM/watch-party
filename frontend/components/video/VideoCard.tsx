"use client"

import Link from "next/link"
import { VideoSummary } from "@/lib/api-client"
import { formatDuration, formatFileSize, getStatusColor } from "./video-utils"

interface VideoCardProps {
  video: VideoSummary
  onDelete: (videoId: string) => void
}

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      onDelete(video.id)
    }
  }

  return (
    <article className="glass-card group rounded-3xl overflow-hidden hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5">
      {/* Thumbnail */}
      <div className="aspect-video bg-brand-navy/5 flex items-center justify-center relative overflow-hidden">
        {(video.thumbnail_url ?? video.thumbnail) ? (
          <img
            src={video.thumbnail_url ?? video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="text-6xl animate-float select-none" aria-hidden="true">
            🎬
          </div>
        )}
        
        {/* Status Badge */}
        {video.upload_status && (
          <span 
            className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-lg font-bold backdrop-blur-md shadow-sm ${getStatusColor(video.upload_status)}`}
          >
            {video.upload_status}
          </span>
        )}
        
        {/* Duration Badge */}
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <h3 className="text-lg font-bold text-brand-navy line-clamp-2 group-hover:text-brand-purple transition-colors">
          {video.title}
        </h3>

        {video.description && (
          <p className="text-brand-navy/60 text-sm line-clamp-2 font-medium">
            {video.description}
          </p>
        )}

        {/* Metadata */}
        <dl className="space-y-1 text-xs text-brand-navy/50 font-medium">
          {video.source_type && (
            <div className="flex gap-1">
              <dt className="sr-only">Source</dt>
              <dd>Source: {video.source_type}</dd>
            </div>
          )}
          {video.file_size && (
            <div className="flex gap-1">
              <dt className="sr-only">Size</dt>
              <dd>Size: {formatFileSize(video.file_size)}</dd>
            </div>
          )}
          <div className="flex gap-1">
            <dt className="sr-only">Added date</dt>
            <dd>Added: {new Date(video.created_at).toLocaleDateString()}</dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {video.upload_status === "ready" && (
            <Link
              href={`/dashboard/videos/${video.id}/preview`}
              className="flex-1 bg-brand-navy hover:bg-brand-navy-light text-white py-2.5 px-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-navy/20 text-center focus:outline-none focus:ring-2 focus:ring-brand-navy/50 focus:ring-offset-2"
            >
              Preview
            </Link>
          )}
          
          <Link
            href={`/dashboard/videos/${video.id}/edit`}
            className="px-3 py-2 bg-white hover:bg-brand-purple/10 text-brand-navy hover:text-brand-purple border border-brand-navy/10 rounded-xl transition-colors text-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:ring-offset-2"
            title="Edit Video"
            aria-label={`Edit ${video.title}`}
          >
            <span aria-hidden="true">✏️</span>
          </Link>
          
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-white hover:bg-red-50 text-brand-coral hover:text-red-600 border border-brand-navy/10 rounded-xl transition-colors text-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2"
            title="Delete Video"
            aria-label={`Delete ${video.title}`}
          >
            <span aria-hidden="true">🗑️</span>
          </button>
        </div>
      </div>
    </article>
  )
}
