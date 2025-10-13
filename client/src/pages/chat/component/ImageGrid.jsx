
import React, { useState } from "react";
import ImageViewer from "./ImageViewer";
import ChatImage from "./ChatImage";

const ImageGrid = ({ images = [],onDeleteFile }) => {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [startIndex, setStartIndex] = useState(0);

    if (!images.length) return null;

    const handleImageClick = (index) => {
        setStartIndex(index);
        setViewerOpen(true);
    };

    const getGridLayout = () => { if (images.length === 1) return "grid-cols-1"; if (images.length === 2) return "grid-cols-2"; if (images.length >= 3) return "grid-cols-2 grid-rows-2"; return "grid-cols-2"; };
    const displayImages = images.slice(0, 4); // show only first 4 in grid

    return (
        <>
            <div
                className={`mb-2.5 grid gap-1 rounded-lg overflow-hidden ${getGridLayout()}`}
            >
                {displayImages.map((img, i) => {
                    const isThree = images.length===3;
                    const GridStyle = isThree && i === 0 ? "col-span-2 h-full" :  "aspect-square";
                    return(
                    <div
                        key={i}
                        className={`relative cursor-pointer group ${GridStyle}`} 
                        onClick={() => handleImageClick(i)}
                    >
                        {img.file &&
                            <ChatImage file={img} classes={`w-full h-full object-cover `}/>
                        }
                        {
                            img.preview &&
                            <img src={img.preview} alt={img.filename} 
                                className={`w-full h-full object-cover `}
                            />
                        }
                        {i === 3 && images.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-semibold">
                                +{images.length - 4} more
                            </div>
                        )}
                    </div>)
                })}
            </div>

            {viewerOpen && (
                <ImageViewer
                    index={startIndex}
                    images={images}
                    onDeleteFile ={onDeleteFile}
                    onClose={() => setViewerOpen(false)}
                />
            )}
        </>
    );
};

export default ImageGrid;