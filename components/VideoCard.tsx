
import React from 'react';
import { VideoData } from '../types';
import { PlayCircle } from 'lucide-react';

interface VideoCardProps {
  video: VideoData;
  onClick: (video: VideoData) => void;
  isCompact?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, isCompact }) => {
  const isLive = video.duration === 'Live' || video.title.toLowerCase().includes('live');

  return (
    <div 
      className={`flex ${isCompact ? 'flex-row gap-3' : 'flex-col'} cursor-pointer group active:opacity-90 transition-opacity`}
      onClick={() => onClick(video)}
    >
      {/* Thumbnail */}
      <div className={`relative ${isCompact ? 'w-40 min-w-[160px]' : 'w-full'} bg-gray-900 aspect-video rounded-lg overflow-hidden`}>
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
        
        {/* Live Badge or Duration */}
        {isLive ? (
            <div className="absolute bottom-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
            </div>
        ) : (
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                {video.duration}
            </div>
        )}

        <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
          {video.platform}
        </div>
      </div>

      {/* Meta */}
      <div className={`${isCompact ? 'flex-1 py-1' : 'flex flex-row gap-3 mt-3 px-2'}`}>
        {!isCompact && (
          <img 
            src={video.avatar} 
            alt={video.uploader} 
            className={`w-10 h-10 rounded-full bg-gray-700 ${isLive ? 'ring-2 ring-red-600' : ''}`}
          />
        )}
        <div className="flex flex-col">
          <h3 className={`text-sm font-medium leading-snug line-clamp-2 text-gray-900 dark:text-gray-100 ${!isCompact && 'mb-1'}`}>
            {video.title}
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">{video.uploader}</span>
            <span className="mx-1">•</span>
            <span>{video.views}</span>
            <span className="mx-1">•</span>
            <span>{video.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
