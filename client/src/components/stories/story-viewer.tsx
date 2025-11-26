import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStory } from "@/hooks/use-stories";
import { Link } from "wouter";
import type { StoryItem } from "@shared/schema";

interface StoryViewerProps {
  storyId: string;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function StoryViewer({ 
  storyId, 
  isOpen, 
  onClose, 
  onNext, 
  onPrevious,
  hasNext = false,
  hasPrevious = false 
}: StoryViewerProps) {
  const { data: story, isLoading } = useStory(isOpen ? storyId : null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentItem = story?.items[currentItemIndex];
  const totalItems = story?.items.length || 0;

  // Reset when story changes
  useEffect(() => {
    if (isOpen && story) {
      setCurrentItemIndex(0);
      setProgress(0);
      progressRef.current = 0;
      setIsPlaying(true);
    }
  }, [storyId, isOpen, story]);

  // Progress timer
  useEffect(() => {
    if (!isOpen || !isPlaying || !currentItem) return;

    const duration = (currentItem.duration || 5) * 1000; // Convert to milliseconds
    startTimeRef.current = Date.now() - (progressRef.current * duration);

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(elapsed / duration, 1);
      
      setProgress(newProgress);
      progressRef.current = newProgress;

      if (newProgress >= 1) {
        handleNext();
      } else {
        timerRef.current = setTimeout(updateProgress, 50);
      }
    };

    timerRef.current = setTimeout(updateProgress, 50);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentItemIndex, isPlaying, isOpen, currentItem]);

  const handleNext = () => {
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(prev => prev + 1);
      setProgress(0);
      progressRef.current = 0;
    } else if (onNext && hasNext) {
      onNext();
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (progress > 0.1) {
      // If we're in the middle of an item, restart it
      setProgress(0);
      progressRef.current = 0;
    } else if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
      setProgress(0);
      progressRef.current = 0;
    } else if (onPrevious && hasPrevious) {
      onPrevious();
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          if (e.key === ' ') {
            togglePlay();
          } else {
            handleNext();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" data-testid="story-viewer-loading">
        <div className="text-white text-lg">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!story || !currentItem) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" data-testid="story-viewer-error">
        <div className="text-white text-lg">Story topilmadi</div>
        <Button 
          onClick={onClose}
          className="ml-4"
          variant="outline"
          data-testid="button-close-story"
        >
          Yopish
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50" data-testid={`story-viewer-${storyId}`}>
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-2 z-10">
        {story.items.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
            onClick={() => {
              setCurrentItemIndex(index);
              setProgress(0);
              progressRef.current = 0;
              setIsPlaying(true);
            }}
            data-testid={`story-progress-${index}`}
          >
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: `${
                  index < currentItemIndex ? 100 : 
                  index === currentItemIndex ? progress * 100 : 0
                }%`
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-16 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          {story.category && (
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm"
              style={{ backgroundColor: story.category.color }}
              data-testid="story-category-icon"
            >
              <i className={story.category.icon}></i>
            </div>
          )}
          <div>
            <h2 className="text-white font-semibold" data-testid="story-title">{story.title}</h2>
            <p className="text-white/70 text-sm" data-testid="story-description">{story.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={togglePlay}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            data-testid="button-toggle-play"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            data-testid="button-close-story"
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      {hasPrevious && (
        <Button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
          variant="ghost"
          size="sm"
          data-testid="button-previous-story"
        >
          <ChevronLeft className="text-white" size={24} />
        </Button>
      )}

      {hasNext && (
        <Button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
          variant="ghost"
          size="sm"
          data-testid="button-next-story"
        >
          <ChevronRight className="text-white" size={24} />
        </Button>
      )}

      {/* Main content area */}
      <div 
        className="w-full h-full flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
        data-testid={`story-item-${currentItemIndex}`}
      >
        {currentItem.type === 'image' && currentItem.mediaUrl && (
          <img
            src={currentItem.mediaUrl}
            alt={currentItem.title || story.title}
            className="max-w-full max-h-full object-contain"
            data-testid="story-image"
          />
        )}
        
        {currentItem.type === 'text' && (
          <div className="text-center px-8 py-12 max-w-2xl" data-testid="story-text">
            {currentItem.title && (
              <h3 className="text-white text-2xl font-bold mb-4">{currentItem.title}</h3>
            )}
            {currentItem.content && (
              <p className="text-white text-lg leading-relaxed">{currentItem.content}</p>
            )}
          </div>
        )}
        
        {currentItem.type === 'video' && currentItem.mediaUrl && (
          <video
            src={currentItem.mediaUrl}
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted
            loop
            data-testid="story-video"
          />
        )}
      </div>

      {/* Bottom overlay with article link */}
      {currentItem.articleId && (
        <div className="absolute bottom-8 left-4 right-4 z-10">
          <Link href={`/article/${currentItem.articleId}`}>
            <Button 
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
              data-testid="button-read-article"
            >
              <ExternalLink size={16} className="mr-2" />
              Maqolani o'qish
            </Button>
          </Link>
        </div>
      )}

      {/* Touch areas for navigation */}
      <div 
        className="absolute left-0 top-0 w-1/3 h-full z-5"
        onClick={handlePrevious}
        data-testid="touch-area-previous"
      />
      <div 
        className="absolute right-0 top-0 w-1/3 h-full z-5"
        onClick={handleNext}
        data-testid="touch-area-next"
      />
    </div>
  );
}