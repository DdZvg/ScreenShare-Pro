@@ .. @@
-import React, { useState, useRef, useEffect } from 'react';
-import { Monitor, Users, Mic, MicOff, Phone, Settings, Maximize2, Copy, Share2, QrCode } from 'lucide-react';
-import { Room, Participant } from '../../types';
+import React, { useState, useRef, useEffect } from 'react';
+import { Monitor, Users, Mic, MicOff, Phone, Settings, Maximize2, Copy, Share2, MessageCircle, Volume2, VolumeX } from 'lucide-react';
+import { Room, User } from '../../types';
+import { ChatPanel } from '../Chat/ChatPanel';
+import { useWebRTC } from '../../hooks/useWebRTC';
+import { useChat } from '../../hooks/useChat';
+import toast from 'react-hot-toast';

 interface ScreenShareHostProps {
   room: Room;
-  onEndShare: () => void;
-  onToggleAudio: () => void;
-  isAudioEnabled: boolean;
+  user: User;
+  onEndShare: () => void;
 }

-export const ScreenShareHost: React.FC<ScreenShareHostProps> = ({
-  room,
-  onEndShare,
-  onToggleAudio,
-  isAudioEnabled
-}) => {
+export const ScreenShareHost: React.FC<ScreenShareHostProps> = ({ room, user, onEndShare }) => {
   const videoRef = useRef<HTMLVideoElement>(null);
   const [isFullscreen, setIsFullscreen] = useState(false);
-  const [stream, setStream] = useState<MediaStream | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [showShareOptions, setShowShareOptions] = useState(false);
+  const [showChat, setShowChat] = useState(false);
+  const [showSettings, setShowSettings] = useState(false);
   const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
-  const [isInitialized, setIsInitialized] = useState(false);
+  
+  const { 
+    isScreenSharing, 
+    isAudioEnabled, 
+    mediaSettings,
+    startScreenShare, 
+    stopScreenShare, 
+    toggleAudio,
+    updateQuality,
+    cleanup 
+  } = useWebRTC();
+  
+  const { sendSystemMessage } = useChat(room.id, user.id);

   useEffect(() => {
-    if (!isInitialized) {
-      startScreenShare();
-      setIsInitialized(true);
-    }
+    initializeScreenShare();
+    
     return () => {
-      if (stream) {
-        stream.getTracks().forEach(track => track.stop());
-      }
+      cleanup();
     };
-  }, [isInitialized, stream]);
+  }, []);

-  const startScreenShare = async () => {
-    if (stream) {
-      // Ya tenemos un stream activo, no solicitar de nuevo
-      return;
-    }
-    
+  const initializeScreenShare = async () => {
     try {
-      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
-        video: { mediaSource: 'screen' },
-        audio: true
-      });
+      const stream = await startScreenShare();
       
-      setStream(mediaStream);
-      if (videoRef.current) {
-        videoRef.current.srcObject = mediaStream;
+      if (stream && videoRef.current) {
+        videoRef.current.srcObject = stream;
         setConnectionStatus('connected');
+        await sendSystemMessage(`${user.name} comenzó a compartir pantalla`);
+        toast.success('¡Compartiendo pantalla!');
       }
-
-      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
-        onEndShare();
-      });
     } catch (err) {
       console.error('Error accessing screen share:', err);
-      if (err instanceof Error) {
-        if (err.name === 'NotAllowedError' || err.message.includes('Permission denied')) {
-          setError('Permisos de pantalla denegados. Por favor, actualiza la página y permite el acceso para compartir tu pantalla.');
-        } else if (err.name === 'NotSupportedError') {
-          setError('Tu navegador no soporta compartir pantalla. Intenta con Chrome, Firefox o Edge.');
-        } else {
-          setError('Error al acceder a compartir pantalla. Verifica tus permisos y conexión.');
-        }
-      } else {
-        setError('Error desconocido al compartir pantalla.');
-      }
-      setIsInitialized(false); // Permitir reintentar
+      handleScreenShareError(err);
     }
   };

+  const handleScreenShareError = (err: any) => {
+    if (err instanceof Error) {
+      if (err.name === 'NotAllowedError' || err.message.includes('Permission denied')) {
+        setError('Permisos de pantalla denegados. Por favor, actualiza la página y permite el acceso para compartir tu pantalla.');
+      } else if (err.name === 'NotSupportedError') {
+        setError('Tu navegador no soporta compartir pantalla. Intenta con Chrome, Firefox o Edge.');
+      } else {
+        setError('Error al acceder a compartir pantalla. Verifica tus permisos y conexión.');
+      }
+    } else {
+      setError('Error desconocido al compartir pantalla.');
+    }
+    toast.error('Error al compartir pantalla');
+  };
+
+  const handleEndShare = async () => {
+    await sendSystemMessage(`${user.name} finalizó la sesión`);
+    stopScreenShare();
+    onEndShare();
+  };
+
+  const handleToggleAudio = async () => {
+    toggleAudio();
+    const message = isAudioEnabled ? 'desactivó' : 'activó';
+    await sendSystemMessage(`${user.name} ${message} su micrófono`);
+  };
+
   const copyRoomCode = async () => {
     try {
       await navigator.clipboard.writeText(room.code);
-      alert('¡Código copiado al portapapeles!');
+      toast.success('¡Código copiado al portapapeles!');
     } catch (err) {
       console.error('Error copying to clipboard:', err);
+      toast.error('Error al copiar código');
     }
   };

   const shareRoom = async () => {
     const roomUrl = `${window.location.origin}/join/${room.code}`;
     if (navigator.share) {
       try {
         await navigator.share({
           title: `Únete a ${room.name}`,
           text: `Te invito a ver mi pantalla en ScreenShare Pro`,
           url: roomUrl,
         });
       } catch (err) {
         console.error('Error sharing:', err);
       }
     } else {
       try {
         await navigator.clipboard.writeText(roomUrl);
-        alert('¡Enlace copiado al portapapeles!');
+        toast.success('¡Enlace copiado al portapapeles!');
       } catch (err) {
         console.error('Error copying to clipboard:', err);
       }
     }
   };

   const toggleFullscreen = () => {
     if (!document.fullscreenElement) {
       videoRef.current?.requestFullscreen();
       setIsFullscreen(true);
     } else {
       document.exitFullscreen();
       setIsFullscreen(false);
     }
   };

   const participants = room.participants.filter(p => !p.isHost);

   // Show error state if screen sharing failed
   if (error) {
     return (
       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
         <div className="bg-gray-800 text-white p-8 rounded-lg max-w-md text-center">
           <Monitor className="w-16 h-16 text-red-500 mx-auto mb-4" />
           <h2 className="text-xl font-semibold mb-4">Error al Compartir Pantalla</h2>
           <p className="text-gray-300 mb-6">{error}</p>
           <div className="space-y-3">
             <button
-              onClick={() => { setError(null); startScreenShare(); }}
+              onClick={() => { setError(null); initializeScreenShare(); }}
               className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
             >
               Intentar de Nuevo
             </button>
             <button
               onClick={onEndShare}
               className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
             >
               Volver al Dashboard
             </button>
           </div>
         </div>
       </div>
     );
   }

   return (
-    <div className="min-h-screen bg-gray-900 flex flex-col">
+    <div className="min-h-screen bg-gray-900 flex flex-col relative">
       {/* Header */}
       <header className="bg-gray-800 text-white p-4">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
-              <Monitor className="w-6 h-6 text-green-500" />
+              <Monitor className={`w-6 h-6 ${isScreenSharing ? 'text-green-500' : 'text-yellow-500'}`} />
               <div>
                 <h1 className="font-semibold">{room.name}</h1>
                 <p className="text-sm text-gray-300">
                   Código: {room.code} • {connectionStatus === 'connected' ? 'Conectado' : 'Conectando...'}
                 </p>
               </div>
             </div>
             
             <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
               connectionStatus === 'connected' ? 'bg-green-600' : 'bg-yellow-600'
             }`}>
               <div className={`w-2 h-2 bg-white rounded-full ${
                 connectionStatus === 'connected' ? 'animate-pulse' : 'animate-bounce'
               }`}></div>
               EN VIVO
             </div>
           </div>

           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-sm">
               <Users className="w-4 h-4" />
               <span>{room.participants.length} participantes</span>
             </div>
             
+            <button
+              onClick={() => setShowChat(!showChat)}
+              className={`p-3 rounded-full transition-colors ${
+                showChat ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
+              }`}
+            >
+              <MessageCircle className="w-5 h-5" />
+            </button>
+            
             <div className="relative">
               <button
                 onClick={() => setShowShareOptions(!showShareOptions)}
                 className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
               >
                 <Share2 className="w-5 h-5" />
               </button>
               
               {showShareOptions && (
                 <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border p-2 min-w-48 z-10">
                   <button
                     onClick={copyRoomCode}
                     className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
                   >
                     <Copy className="w-4 h-4" />
                     Copiar código
                   </button>
                   <button
                     onClick={shareRoom}
                     className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
                   >
                     <Share2 className="w-4 h-4" />
                     Compartir enlace
                   </button>
                 </div>
               )}
             </div>
             
             <button
-              onClick={onToggleAudio}
+              onClick={handleToggleAudio}
               className={`p-3 rounded-full transition-colors ${
                 isAudioEnabled ? 'bg-gray-700' : 'bg-red-600'
               }`}
             >
               {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
             </button>
             
             <button
               onClick={toggleFullscreen}
               className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
             >
               <Maximize2 className="w-5 h-5" />
             </button>
             
-            <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
+            <div className="relative">
+              <button 
+                onClick={() => setShowSettings(!showSettings)}
+                className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
+              >
+                <Settings className="w-5 h-5" />
+              </button>
+              
+              {showSettings && (
+                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border p-4 min-w-64 z-10">
+                  <h3 className="font-semibold text-gray-900 mb-3">Configuración</h3>
+                  
+                  <div className="space-y-3">
+                    <div>
+                      <label className="block text-sm font-medium text-gray-700 mb-1">
+                        Calidad de video
+                      </label>
+                      <select
+                        value={mediaSettings.quality}
+                        onChange={(e) => updateQuality(e.target.value as any)}
+                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
+                      >
+                        <option value="low">Baja (720p)</option>
+                        <option value="medium">Media (1080p)</option>
+                        <option value="high">Alta (1440p)</option>
+                      </select>
+                    </div>
+                    
+                    <div className="flex items-center justify-between">
+                      <span className="text-sm text-gray-700">Audio habilitado</span>
+                      <button
+                        onClick={handleToggleAudio}
+                        className={`w-12 h-6 rounded-full transition-colors ${
+                          isAudioEnabled ? 'bg-blue-600' : 'bg-gray-300'
+                        }`}
+                      >
+                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
+                          isAudioEnabled ? 'translate-x-6' : 'translate-x-1'
+                        }`} />
+                      </button>
+                    </div>
+                  </div>
+                </div>
+              )}
+            </div>
+            
+            <button
+              onClick={handleEndShare}
+              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
+            >
+              <Phone className="w-4 h-4" />
+              Finalizar
+            </button>
+          </div>
+        </div>
+      </header>
+
+      {/* Main Content */}
+      <div className="flex-1 flex">
+        {/* Screen Share Area */}
+        <div className="flex-1 bg-black flex items-center justify-center p-4">
+          {connectionStatus === 'connected' ? (
+            <video
+              ref={videoRef}
+              autoPlay
+              muted
+              className="w-full h-full object-contain rounded-lg shadow-lg"
+            />
+          ) : (
+            <div className="text-center text-white">
+              <div className="animate-spin w-16 h-16 border-4 border-gray-600 border-t-white rounded-full mx-auto mb-4"></div>
+              <h3 className="text-xl font-semibold mb-2">Iniciando compartir pantalla...</h3>
+              <p className="text-gray-300">Selecciona la pantalla o ventana que deseas compartir</p>
+            </div>
+          )}
+        </div>
+
+        {/* Participants Panel */}
+        <div className="w-80 bg-gray-800 text-white p-4">
+          <h3 className="font-semibold mb-4 flex items-center gap-2">
+            <Users className="w-5 h-5" />
+            Participantes ({room.participants.length})
+          </h3>
+          
+          <div className="space-y-3">
+            {/* Host */}
+            <div className="flex items-center justify-between p-3 bg-blue-600 rounded-lg">
+              <div className="flex items-center gap-3">
+                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium">
+                  {room.hostName.charAt(0).toUpperCase()}
+                </div>
+                <div>
+                  <p className="font-medium">{room.hostName}</p>
+                  <p className="text-xs text-blue-200">Anfitrión</p>
+                </div>
+              </div>
+              <div className="flex items-center gap-1">
+                <Monitor className="w-4 h-4 text-blue-200" />
+                {isAudioEnabled ? (
+                  <Mic className="w-4 h-4 text-blue-200" />
+                ) : (
+                  <MicOff className="w-4 h-4 text-red-300" />
+                )}
+              </div>
+            </div>
+
+            {/* Participants */}
+            {participants.map((participant) => (
+              <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
+                <div className="flex items-center gap-3">
+                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
+                    {participant.name.charAt(0).toUpperCase()}
+                  </div>
+                  <div>
+                    <p className="font-medium">{participant.name}</p>
+                    <p className="text-xs text-gray-400">
+                      {new Date(participant.joinedAt).toLocaleTimeString()}
+                    </p>
+                  </div>
+                </div>
+                <div className="flex items-center gap-1">
+                  <Volume2 className="w-4 h-4 text-gray-400" />
+                </div>
+              </div>
+            ))}
+            
+            {participants.length === 0 && (
+              <div className="text-center py-8">
+                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
+                <p className="text-gray-400">No hay participantes aún</p>
+                <p className="text-sm text-gray-500 mt-1">
+                  Comparte el código para invitar
+                </p>
+              </div>
+            )}
+          </div>
+        </div>
+      </div>
+
+      {/* Chat Panel */}
+      <ChatPanel
+        roomId={room.id}
+        user={user}
+        isVisible={showChat}
+        onToggle={() => setShowChat(!showChat)}
+      />
+    </div>
+  );
+};