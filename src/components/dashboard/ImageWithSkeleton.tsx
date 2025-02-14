import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageWithSkeletonProps {
  src: string;
  alt?: string;
  className?: string;
}

const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({ src, alt = "", className = "" }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full pb-[177.78%]">
      {!loaded && <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover rounded-lg shadow-md ${loaded ? "block" : "hidden"} ${className}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default ImageWithSkeleton;
