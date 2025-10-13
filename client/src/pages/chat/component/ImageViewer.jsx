
import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Trash } from "lucide-react";
import ChatImage from "./ChatImage";
import { useRef } from "react";

const ImageViewer = ({ index = 0, images = [], onDeleteFile, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(index);
    const [zoom, setZoom] = useState(1);
    const [origin, setOrigin] = useState({ x: '50%', y: '50%' });
    const containerRef = React.useRef();
    const imgRef = useRef()

    if (!images.length) return null;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setZoom(1);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setZoom(1);
    };

    const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 1));
    const handleWheelZoom = (e) => {
        // e.preventDefault();

        const container = containerRef.current;
        const img = imgRef.current;
        const rect = container.getBoundingClientRect();

        // Get actual rendered image size (since object-contain keeps aspect ratio)
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const containerRatio = rect.width / rect.height;

        let renderWidth, renderHeight;

        if (imgRatio > containerRatio) {
            // image fills width
            renderWidth = rect.width;
            renderHeight = rect.width / imgRatio;
        } else {
            // image fills height
            renderHeight = rect.height;
            renderWidth = rect.height * imgRatio;
        }

        // Calculate padding around image
        const offsetX = (rect.width - renderWidth) / 2;
        const offsetY = (rect.height - renderHeight) / 2;

        // Get mouse position relative to actual image area
        const x = ((e.clientX - rect.left - offsetX) / renderWidth) * 100;
        const y = ((e.clientY - rect.top - offsetY) / renderHeight) * 100;

        // Clamp within 0–100
        const clamp = (v) => Math.min(100, Math.max(0, v));
        setOrigin({ x: `${clamp(x)}%`, y: `${clamp(y)}%` });

        // Smooth zooming
        setZoom(prev => {
            const newScale = Math.min(Math.max(prev + e.deltaY * -0.001, 1), 5);
            return newScale;
        });
    };


    const handleDelete = () => {
        if (onDeleteFile) onDeleteFile(images[currentIndex].file);
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-20 right-4 text-white hover:text-gray-300"
            >
                <X size={28} />
            </button>

            {/* Image container */}
            <div className={` max-w-[90%] h-[85%] flex items-center justify-center overflow-hidden`}
                ref={containerRef}
            >
                {images[currentIndex].file &&
                    <ChatImage file={images[currentIndex]}
                        onZoom={handleWheelZoom}
                        imgRef={imgRef}
                        stylesprop={{ transform: `scale(${zoom})`, transformOrigin: `${origin.x} ${origin.y}`, transition: 'transform 0.2s ease-out' }} classes='w-full h-full object-contain' />
                }
                {
                    images[currentIndex].preview &&
                    <img ref={imgRef} src={images[currentIndex].preview} alt={images[currentIndex].filename}
                        className={`w-full h-full object-contain `}
                        style={{ transform: `scale(${zoom})`, transformOrigin: `${origin.x} ${origin.y}`, transition: 'transform 0.2s ease-out' }}

                        onWheel={handleWheelZoom}
                    />
                }

                {/* Prev/Next Buttons */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 text-white/70 hover:text-white"
                        >
                            <ChevronLeft size={36} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 text-white/70 hover:text-white"
                        >
                            <ChevronRight size={36} />
                        </button>
                    </>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-6 flex gap-4 text-white">
                <button
                    onClick={handleZoomOut}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                >
                    <ZoomOut size={22} />
                </button>
                <button
                    onClick={handleZoomIn}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                >
                    <ZoomIn size={22} />
                </button>
                {images[currentIndex].file && onDeleteFile &&
                    <button
                        onClick={handleDelete}
                        className="p-2 bg-red-500 rounded-full hover:bg-red-600"
                    >
                        <Trash size={22} />
                    </button>
                }
            </div>

            {/* Counter */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-white text-sm">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
};

export default ImageViewer;
