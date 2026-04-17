import React from 'react'

interface VideoEmbedProps {
  url: string
  title?: string
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, title }) => {
  const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
  
  if (!youtubeId) return <div className="bg-gray-900 p-4 text-center text-gray-400">Vídeo indisponível</div>

  return (
    <div className="border border-gray-800 rounded-lg bg-gray-900 overflow-hidden">
      <iframe
        width="100%"
        height="300"
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={title}
        allowFullScreen
        className="border-0"
      />
    </div>
  )
}