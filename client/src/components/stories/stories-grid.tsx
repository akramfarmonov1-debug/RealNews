import { useState } from "react";
import { Play, Clock } from "lucide-react";
import { useStories } from "@/hooks/use-stories";
import { StoryViewer } from "./story-viewer";
import type { StoryWithCategory } from "@shared/schema";

export function StoriesGrid() {
  const { data: stories = [], isLoading } = useStories();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const openStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setSelectedStoryId(null);
  };

  const getNextStory = () => {
    if (!selectedStoryId) return;
    const currentIndex = stories.findIndex(s => s.id === selectedStoryId);
    if (currentIndex >= 0 && currentIndex < stories.length - 1) {
      setSelectedStoryId(stories[currentIndex + 1].id);
    }
  };

  const getPreviousStory = () => {
    if (!selectedStoryId) return;
    const currentIndex = stories.findIndex(s => s.id === selectedStoryId);
    if (currentIndex > 0) {
      setSelectedStoryId(stories[currentIndex - 1].id);
    }
  };

  const hasNext = () => {
    if (!selectedStoryId) return false;
    const currentIndex = stories.findIndex(s => s.id === selectedStoryId);
    return currentIndex >= 0 && currentIndex < stories.length - 1;
  };

  const hasPrevious = () => {
    if (!selectedStoryId) return false;
    const currentIndex = stories.findIndex(s => s.id === selectedStoryId);
    return currentIndex > 0;
  };

  if (isLoading) {
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide" data-testid="stories-loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-24 h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
            data-testid={`story-skeleton-${i}`}
          />
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500" data-testid="no-stories">
        Hech qanday story topilmadi
      </div>
    );
  }

  return (
    <>
      <div className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide" data-testid="stories-grid">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            onClick={() => openStory(story.id)}
          />
        ))}
      </div>

      {selectedStoryId && (
        <StoryViewer
          storyId={selectedStoryId}
          isOpen={viewerOpen}
          onClose={closeViewer}
          onNext={hasNext() ? getNextStory : undefined}
          onPrevious={hasPrevious() ? getPreviousStory : undefined}
          hasNext={hasNext()}
          hasPrevious={hasPrevious()}
        />
      )}
    </>
  );
}

interface StoryCardProps {
  story: StoryWithCategory;
  onClick: () => void;
}

function StoryCard({ story, onClick }: StoryCardProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} kun oldin`;
    } else if (diffHours > 0) {
      return `${diffHours} soat oldin`;
    } else {
      return "Yaqinda";
    }
  };

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-24 cursor-pointer group"
      data-testid={`story-card-${story.id}`}
    >
      <div className="relative mb-2">
        {/* Story thumbnail */}
        <div 
          className="w-24 h-32 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 overflow-hidden group-hover:scale-105 transition-transform duration-200"
          style={{
            backgroundImage: story.thumbnail ? `url(${story.thumbnail})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          data-testid="story-thumbnail"
        >
          {/* Category overlay */}
          {story.category && (
            <div className="absolute top-2 left-2">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-md"
                style={{ backgroundColor: story.category.color }}
                data-testid="story-category-badge"
              >
                <i className={story.category.icon}></i>
              </div>
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <Play 
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
              size={20}
              data-testid="story-play-icon"
            />
          </div>

          {/* Items count */}
          <div className="absolute bottom-2 right-2 text-white text-xs bg-black bg-opacity-50 rounded-full px-2 py-1" data-testid="story-items-count">
            {story.itemCount || 0}
          </div>
        </div>

        {/* Story info */}
        <div className="text-center">
          <h3 
            className="text-sm font-medium line-clamp-2 mb-1 text-gray-900 dark:text-gray-100"
            data-testid="story-title"
          >
            {story.title}
          </h3>
          
          <div className="flex items-center justify-center text-xs text-gray-500 space-x-1">
            <Clock size={12} />
            <span data-testid="story-time">
              {formatTimeAgo(new Date(story.createdAt))}
            </span>
          </div>

          {/* View count */}
          <div className="text-xs text-gray-400 mt-1" data-testid="story-views">
            {story.viewCount || 0} ko'rishlar
          </div>
        </div>
      </div>
    </div>
  );
}