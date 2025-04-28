import React from 'react';

interface LoadingIndicatorProps {
  text: string;
}

const PixelDino = () => {
  return (
    <div className="pixel-dino-container mb-4">
      <style jsx>{`
        .pixel-dino-container {
          height: 60px;
          position: relative;
        }
        
        @keyframes run {
          0% { transform: translateX(-50px); }
          100% { transform: translateX(50px); }
        }
        
        @keyframes eat {
          0%, 50%, 100% { transform: scaleY(1); }
          25%, 75% { transform: scaleY(0.8); }
        }
        
        .pixel-dino {
          width: 30px;
          height: 30px;
          background-color: #50fa7b;
          position: relative;
          animation: run 2s infinite alternate ease-in-out;
        }
        
        .pixel-dino::before {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: #50fa7b;
          bottom: 0;
          left: -10px;
          box-shadow: 0 -10px 0 0 #50fa7b;
        }
        
        .pixel-dino::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #f8f8f2;
          top: 5px;
          right: 5px;
          border-radius: 50%;
        }
        
        .pixel-dino-mouth {
          position: absolute;
          width: 12px;
          height: 6px;
          background-color: #282a36;
          bottom: 5px;
          right: -12px;
          animation: eat 0.5s infinite;
        }
        
        .pixel-food {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #ffb86c;
          bottom: 5px;
          right: -30px;
          border-radius: 50%;
        }
      `}</style>
      <div className="flex justify-center">
        <div className="pixel-dino">
          <div className="pixel-dino-mouth"></div>
        </div>
        <div className="pixel-food"></div>
      </div>
    </div>
  );
};

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center py-8">
      <PixelDino />
      <p className="text-lg text-gray-300 mt-4">{text}</p>
      <div className="mt-4 flex space-x-2">
        {[0, 1, 2].map(i => (
          <div 
            key={i} 
            className="w-3 h-3 rounded-full bg-purple-500"
            style={{
              animation: `pulse 1.5s infinite ease-in-out ${i * 0.3}s`
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingIndicator;