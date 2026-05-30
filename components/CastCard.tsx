import { useState, useRef } from 'react';
import { User, Upload, X, Camera } from 'lucide-react';

interface CastCardProps {
  characterName: string;
  actorName?: string;
  physicalDescription?: string;
  referenceImagePath?: string;
  onUpdate: (data: {
    actorName?: string;
    physicalDescription?: string;
    image?: File;
  }) => void;
  onRemoveImage?: () => void;
}

export function CastCard({
  characterName,
  actorName = '',
  physicalDescription = '',
  referenceImagePath,
  onUpdate,
  onRemoveImage,
}: CastCardProps) {
  const [localActorName, setLocalActorName] = useState(actorName);
  const [localDescription, setLocalDescription] = useState(physicalDescription);
  const [previewUrl, setPreviewUrl] = useState<string | null>(referenceImagePath || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onUpdate({ image: file });
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemoveImage?.();
  };

  const handleBlur = () => {
    onUpdate({
      actorName: localActorName,
      physicalDescription: localDescription,
    });
  };

  return (
    <div className="bg-card border border-border rounded-card p-5">
      <div className="flex items-start gap-4">
        {/* Image Upload Area */}
        <div className="flex-shrink-0">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt={characterName}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-error rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 bg-surface border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all"
            >
              <Camera className="w-6 h-6 text-text-secondary" />
              <span className="text-xs text-text-secondary">Add Photo</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Character Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary text-lg mb-1">
            {characterName}
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text-secondary uppercase tracking-wide mb-1 block">
                Actor Name (optional)
              </label>
              <input
                type="text"
                value={localActorName}
                onChange={(e) => setLocalActorName(e.target.value)}
                onBlur={handleBlur}
                placeholder="e.g. Tom Hardy"
                className="w-full bg-surface border border-border rounded-input px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            
            <div>
              <label className="text-xs text-text-secondary uppercase tracking-wide mb-1 block">
                Physical Description
              </label>
              <textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                onBlur={handleBlur}
                placeholder="e.g. Tall man, early 30s, dark hair, wearing a leather jacket"
                rows={2}
                className="w-full bg-surface border border-border rounded-input px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
