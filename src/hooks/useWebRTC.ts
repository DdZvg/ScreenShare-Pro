import { useState, useRef, useCallback } from 'react';
import { MediaSettings } from '../types';

export const useWebRTC = () => {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [mediaSettings, setMediaSettings] = useState<MediaSettings>({
    video: true,
    audio: true,
    screen: false,
    quality: 'medium',
  });
  
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const startScreenShare = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      screenStreamRef.current = stream;
      setIsScreenSharing(true);
      setMediaSettings(prev => ({ ...prev, screen: true }));

      // Handle stream end
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });

      return stream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    setMediaSettings(prev => ({ ...prev, screen: false }));
  }, []);

  const startAudio = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      audioStreamRef.current = stream;
      setIsAudioEnabled(true);
      setMediaSettings(prev => ({ ...prev, audio: true }));

      return stream;
    } catch (error) {
      console.error('Error starting audio:', error);
      throw error;
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    setIsAudioEnabled(false);
    setMediaSettings(prev => ({ ...prev, audio: false }));
  }, []);

  const toggleAudio = useCallback(() => {
    if (isAudioEnabled) {
      stopAudio();
    } else {
      startAudio();
    }
  }, [isAudioEnabled, startAudio, stopAudio]);

  const updateQuality = useCallback((quality: 'low' | 'medium' | 'high') => {
    setMediaSettings(prev => ({ ...prev, quality }));
  }, []);

  const cleanup = useCallback(() => {
    stopScreenShare();
    stopAudio();
  }, [stopScreenShare, stopAudio]);

  return {
    isScreenSharing,
    isAudioEnabled,
    mediaSettings,
    screenStream: screenStreamRef.current,
    audioStream: audioStreamRef.current,
    startScreenShare,
    stopScreenShare,
    startAudio,
    stopAudio,
    toggleAudio,
    updateQuality,
    cleanup,
  };
};