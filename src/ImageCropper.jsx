import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropper = ({ imageSrc, onCropComplete, initialAspect = 1 }) => {
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(initialAspect);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    const { naturalWidth, naturalHeight } = e.currentTarget;
    // Set initial crop to cover the center of the image, maintaining aspect ratio
    const initialCropWidth = Math.min(naturalWidth, naturalHeight * aspect);
    const initialCropHeight = initialCropWidth / aspect;

    setCrop({
      unit: 'px',
      width: initialCropWidth,
      height: initialCropHeight,
      x: (naturalWidth - initialCropWidth) / 2,
      y: (naturalHeight - initialCropHeight) / 2,
      aspect: aspect,
    });
  }, [aspect]);

  useEffect(() => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
      const image = imgRef.current;
      const canvas = previewCanvasRef.current;
      const crop = completedCrop;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext('2d');

      const pixelRatio = window.devicePixelRatio;

      canvas.width = crop.width * pixelRatio;
      canvas.height = crop.height * pixelRatio;

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      // Convert canvas to blob and then to data URL
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          onCropComplete(reader.result, blob);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg'); // or 'image/png'
    }
  }, [completedCrop, onCropComplete, scale, rotate]);

  const handleAspectRatioChange = (newAspect) => {
    setAspect(newAspect);
    // When aspect changes, react-image-crop needs to re-evaluate the crop area.
    // Setting crop to undefined first, then to a new object with the aspect, helps.
    setCrop(undefined); // Clear crop to trigger re-evaluation
    setCrop({
      unit: '%', // Use percentage for initial crop on aspect change
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      aspect: newAspect,
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-2 my-4">
        <button
          className={`px-4 py-2 rounded-md ${aspect === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleAspectRatioChange(1)}
        >
          1:1
        </button>
        <button
          className={`px-4 py-2 rounded-md ${aspect === 4 / 5 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleAspectRatioChange(4 / 5)}
        >
          4:5
        </button>
        <button
          className={`px-4 py-2 rounded-md ${aspect === 16 / 9 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleAspectRatioChange(16 / 9)}
        >
          16:9
        </button>
        {/* Add more aspect ratios as needed */}
      </div>

      <ReactCrop
        crop={crop}
        onChange={(_, percentCrop) => setCrop(percentCrop)}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={aspect}
        className="max-w-full h-auto"
      >
        <img
          ref={imgRef}
          alt="Crop me"
          src={imageSrc}
          onLoad={onImageLoad}
          style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
        />
      </ReactCrop>

      <div style={{ display: 'none' }}>
        <canvas
          ref={previewCanvasRef}
          // Set to actual crop width and height for high-res output
        />
      </div>
    </div>
  );
};

export default ImageCropper;