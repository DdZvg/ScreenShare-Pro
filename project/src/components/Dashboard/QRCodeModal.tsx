import React from 'react';
import { X, Copy, Share2, QrCode } from 'lucide-react';
import { Room } from '../../types';

interface QRCodeModalProps {
  room: Room;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ room, onClose }) => {
  const roomUrl = `${window.location.origin}/join/${room.code}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      alert('¡Enlace copiado al portapapeles!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const shareRoom = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Únete a ${room.name}`,
          text: `${room.hostName} te invita a ver su pantalla`,
          url: roomUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  // Generate QR code using a placeholder (in real implementation, use qrcode library)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomUrl)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Invitar Participantes</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-1">{room.name}</h3>
            <p className="text-sm text-gray-600">Código: {room.code}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl mb-4">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="mx-auto w-48 h-48 rounded-lg"
            />
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Escanea el código QR o comparte el enlace
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 break-all">{roomUrl}</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </button>
            
            <button
              onClick={shareRoom}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};