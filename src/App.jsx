import React, { useState, useRef } from 'react';
import { Upload, Download, Scissors, Eye } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState(null);
  const [splitImages, setSplitImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [cropPosition, setCropPosition] = useState('center');
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          setImage(img);
          setSplitImages([]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const splitImage = () => {
    if (!image) return;
    
    setProcessing(true);
    setTimeout(() => {
      const results = [];
      
      const totalWidth = image.width;
      const pieceWidth = totalWidth / 3;
      const margin = pieceWidth * 0.015;
      
      for (let i = 0; i < 3; i++) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        let startX = i * pieceWidth;
        let width = pieceWidth;
        
        if (i === 0) {
          width = pieceWidth + margin;
        } else if (i === 2) {
          startX = i * pieceWidth - margin;
          width = pieceWidth + margin;
        } else {
          startX = i * pieceWidth - margin;
          width = pieceWidth + (margin * 2);
        }
        
        tempCanvas.width = width;
        tempCanvas.height = image.height;
        
        tempCtx.drawImage(
          image,
          startX, 0, width, image.height,
          0, 0, width, image.height
        );
        
        const ratio34Canvas = document.createElement('canvas');
        const ratio34Ctx = ratio34Canvas.getContext('2d');
        ratio34Canvas.width = 1080;
        ratio34Canvas.height = 1440;
        
        const pieceRatio = width / image.height;
        const targetRatio = 0.75;
        
        let sourceX = 0, sourceY = 0, sourceW = width, sourceH = image.height;
        
        if (pieceRatio > targetRatio) {
          sourceW = image.height * targetRatio;
          if (cropPosition === 'left') {
            sourceX = 0;
          } else if (cropPosition === 'right') {
            sourceX = width - sourceW;
          } else {
            sourceX = (width - sourceW) / 2;
          }
        } else {
          sourceH = width / targetRatio;
          if (cropPosition === 'top') {
            sourceY = 0;
          } else if (cropPosition === 'bottom') {
            sourceY = image.height - sourceH;
          } else {
            sourceY = (image.height - sourceH) / 2;
          }
        }
        
        ratio34Ctx.drawImage(
          tempCanvas,
          sourceX, sourceY, sourceW, sourceH,
          0, 0, 1080, 1440
        );
        
        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');
        finalCanvas.width = 1080;
        finalCanvas.height = 1350;
        
        const yOffset = (1350 - 1440) / 2;
        
        const topData = ratio34Ctx.getImageData(540, 0, 10, 1);
        const bottomData = ratio34Ctx.getImageData(540, 1439, 10, 1);
        
        const getAvgColor = (data) => {
          let r = 0, g = 0, b = 0;
          for (let i = 0; i < data.data.length; i += 4) {
            r += data.data[i];
            g += data.data[i + 1];
            b += data.data[i + 2];
          }
          const count = data.data.length / 4;
          return `rgb(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)})`;
        };
        
        const topGrad = finalCtx.createLinearGradient(0, 0, 0, Math.abs(yOffset));
        topGrad.addColorStop(0, getAvgColor(topData).replace('rgb', 'rgba').replace(')', ', 0.7)'));
        topGrad.addColorStop(1, getAvgColor(topData));
        finalCtx.fillStyle = topGrad;
        finalCtx.fillRect(0, 0, 1080, Math.abs(yOffset));
        
        finalCtx.drawImage(ratio34Canvas, 0, Math.abs(yOffset));
        
        const bottomY = Math.abs(yOffset) + 1440;
        const bottomGrad = finalCtx.createLinearGradient(0, bottomY, 0, 1350);
        bottomGrad.addColorStop(0, getAvgColor(bottomData));
        bottomGrad.addColorStop(1, getAvgColor(bottomData).replace('rgb', 'rgba').replace(')', ', 0.7)'));
        finalCtx.fillStyle = bottomGrad;
        finalCtx.fillRect(0, bottomY, 1080, 1350 - bottomY);
        
        results.push({
          dataUrl: finalCanvas.toDataURL('image/jpeg', 0.95),
          index: i
        });
      }
      
      setSplitImages(results);
      setProcessing(false);
    }, 100);
  };

  const downloadImage = (dataUrl, index) => {
    const link = document.createElement('a');
    link.download = `instagram_feed_${index + 1}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    splitImages.forEach((img, index) => {
      setTimeout(() => downloadImage(img.dataUrl, img.index), index * 300);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Scissors className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              인스타그램 피드 분할기
            </h1>
          </div>
          <p className="text-gray-600">
            3장이 하나로 이어지는 피드 이미지 만들기
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-6"
          >
            <Upload className="w-5 h-5" />
            이미지 업로드
          </button>

          {image && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  자르기 기준점
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    onClick={() => setCropPosition('top')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      cropPosition === 'top'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    상단 우선
                  </button>
                  <button
                    onClick={() => setCropPosition('center')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      cropPosition === 'center'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    중앙
                  </button>
                  <button
                    onClick={() => setCropPosition('bottom')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      cropPosition === 'bottom'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    하단 우선
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCropPosition('left')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      cropPosition === 'left'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    좌측 우선
                  </button>
                  <div></div>
                  <button
                    onClick={() => setCropPosition('right')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      cropPosition === 'right'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    우측 우선
                  </button>
                </div>
              </div>

              <div className="mb-6 text-center">
                <img
                  src={image.src}
                  alt="Original"
                  className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                  style={{ maxHeight: '400px' }}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {image.width} × {image.height}px
                </p>
              </div>

              <button
                onClick={splitImage}
                disabled={processing}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Scissors className="w-5 h-5" />
                {processing ? '처리 중...' : '3장으로 분할하기'}
              </button>
            </>
          )}
        </div>

        {splitImages.length > 0 && (
          <>
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-800">인스타 피드 미리보기</h2>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                실제 인스타그램 피드에서 보이는 모습 (3:4 비율, 실제 간격)
              </p>
              <div className="grid grid-cols-3 gap-0.5 bg-black p-0.5 rounded-lg">
                {splitImages.map((img) => (
                  <div key={img.index} className="relative bg-white" style={{ paddingBottom: '133.33%' }}>
                    <img
                      src={img.dataUrl}
                      alt={`Feed ${img.index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        objectPosition: 'center',
                        aspectRatio: '3/4'
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-gray-500 mt-3">
                ↑ 피드에서는 이렇게 3장이 이어져 보입니다
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">다운로드</h2>
                <button
                  onClick={downloadAll}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-6 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  전체 다운로드
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {splitImages.map((img) => (
                  <div key={img.index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 transition-all">
                    <img
                      src={img.dataUrl}
                      alt={`Part ${img.index + 1}`}
                      className="w-full h-auto rounded-lg shadow-md mb-3"
                    />
                    <button
                      onClick={() => downloadImage(img.dataUrl, img.index)}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {img.index + 1}번 다운로드
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📱 업로드 순서</h3>
                <p className="text-blue-800 text-sm">
                  인스타그램에 <strong>3 → 2 → 1</strong> 순서로 업로드하세요!
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}