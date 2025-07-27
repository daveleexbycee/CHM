"use client";

import React from 'react';

interface YouTubeEmbedProps {
  embedId: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ embedId }) => (
  <div className="aspect-video w-full">
    <iframe
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Embedded youtube"
      className="w-full h-full rounded-lg shadow-lg"
    />
  </div>
);

export default YouTubeEmbed;
