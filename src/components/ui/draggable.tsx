
import { ReactNode, useState, DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface DraggableProps {
  id: string;
  index: number;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const Draggable = ({ 
  id, 
  index, 
  onReorder, 
  children, 
  className,
  disabled = false 
}: DraggableProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDragStart = (e: DragEvent) => {
    if (disabled) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, index }));
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setDragOver(false);
    
    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (dragData.index !== index) {
      onReorder(dragData.index, index);
    }
  };

  return (
    <div
      className={cn(
        'group relative transition-all duration-200',
        isDragging && 'opacity-50 scale-105',
        dragOver && 'border-t-2 border-blue-500',
        !disabled && 'cursor-move',
        className
      )}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!disabled && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      )}
      {children}
    </div>
  );
};
