@@ .. @@
-import React, { useState } from 'react';
+import React, { useState } from 'react';
+import { Toaster } from 'react-hot-toast';
 import { LoginForm } from './components/Auth/LoginForm';
 import { RegisterForm } from './components/Auth/RegisterForm';
 import { Dashboard } from './components/Dashboard/Dashboard';
 import { ScreenShareHost } from './components/ScreenShare/ScreenShareHost';
 import { ScreenShareViewer } from './components/ScreenShare/ScreenShareViewer';
 import { useAuth } from './hooks/useAuth';
 import { useRooms } from './hooks/useRooms';
 import { Room } from './types';

 type AppState = 'login' | 'register' | 'dashboard' | 'hosting' | 'viewing';

 function App() {
   const [appState, setAppState] = useState<AppState>('login');
   const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
-  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
   
   const { user, isLoading, error, login, register, logout, clearError } = useAuth();
-  const { rooms, createRoom, joinRoom, endRoom } = useRooms(user);
+  const { rooms, isLoading: roomsLoading, createRoom, joinRoom, leaveRoom, endRoom } = useRooms(user);

   // Auto-navigate to dashboard when user logs in
   React.useEffect(() => {
     if (user && (appState === 'login' || appState === 'register')) {
       setAppState('dashboard');
     }
   }, [user, appState]);

   const handleLogin = async (email: string, password: string) => {
     clearError();
     await login(email, password);
   };

   const handleRegister = async (name: string, email: string, password: string) => {
     clearError();
     await register(name, email, password);
   };

-  const handleCreateRoom = (name: string, maxParticipants: number) => {
-    const room = createRoom(name, maxParticipants);
+  const handleCreateRoom = async (name: string, maxParticipants: number) => {
+    const room = await createRoom(name, maxParticipants);
     if (room) {
       setCurrentRoom(room);
       setAppState('hosting');
     }
   };

-  const handleJoinRoom = (code: string) => {
-    const room = joinRoom(code);
+  const handleJoinRoom = async (code: string) => {
+    const room = await joinRoom(code);
     if (room) {
       setCurrentRoom(room);
-      setAppState('viewing');
-    } else {
-      alert('Sala no encontrada');
+      if (user && room.hostId === user.id) {
+        setAppState('hosting');
+      } else {
+        setAppState('viewing');
+      }
     }
   };

   const handleStartShare = (roomId: string) => {
     const room = rooms.find(r => r.id === roomId);
     if (room && user && room.hostId === user.id) {
       setCurrentRoom(room);
       setAppState('hosting');
     } else if (room) {
       setCurrentRoom(room);
       setAppState('viewing');
     }
   };

-  const handleEndShare = () => {
+  const handleEndShare = async () => {
     if (currentRoom) {
-      endRoom(currentRoom.id);
+      await endRoom(currentRoom.id);
     }
     setCurrentRoom(null);
     setAppState('dashboard');
   };

-  const handleLeaveRoom = () => {
+  const handleLeaveRoom = async () => {
+    if (currentRoom && user) {
+      await leaveRoom(currentRoom.id);
+    }
     setCurrentRoom(null);
     setAppState('dashboard');
   };

   const handleLogout = () => {
     logout();
     setCurrentRoom(null);
     setAppState('login');
   };

   const toggleAuthMode = () => {
     setAppState(appState === 'login' ? 'register' : 'login');
   };

+  // Show loading screen while checking auth
+  if (isLoading) {
+    return (
+      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
+        <div className="text-center">
+          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
+          <h1 className="text-2xl font-bold text-gray-900 mb-2">ScreenShare Pro</h1>
+          <p className="text-gray-600">Cargando...</p>
+        </div>
+      </div>
+    );
+  }

   if (appState === 'login') {
     return (
       <div>
+        <Toaster position="top-right" />
         {error && (
           <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
             <div className="flex items-center justify-between">
               <span>{error}</span>
               <button
                 onClick={clearError}
                 className="ml-4 text-red-500 hover:text-red-700"
               >
                 ×
               </button>
             </div>
           </div>
         )}
         <LoginForm
           onLogin={handleLogin}
           onToggleMode={toggleAuthMode}
           isLoading={isLoading}
         />
       </div>
     );
   }

   if (appState === 'register') {
     return (
       <div>
+        <Toaster position="top-right" />
         {error && (
           <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
             <div className="flex items-center justify-between">
               <span>{error}</span>
               <button
                 onClick={clearError}
                 className="ml-4 text-red-500 hover:text-red-700"
               >
                 ×
               </button>
             </div>
           </div>
         )}
         <RegisterForm
           onRegister={handleRegister}
           onToggleMode={toggleAuthMode}
           isLoading={isLoading}
         />
       </div>
     );
   }

   if (appState === 'dashboard' && user) {
     return (
-      <Dashboard
-        user={user}
-        rooms={rooms}
-        onCreateRoom={handleCreateRoom}
-        onJoinRoom={handleJoinRoom}
-        onStartShare={handleStartShare}
-        onLogout={handleLogout}
-      />
+      <div>
+        <Toaster position="top-right" />
+        <Dashboard
+          user={user}
+          rooms={rooms}
+          isLoading={roomsLoading}
+          onCreateRoom={handleCreateRoom}
+          onJoinRoom={handleJoinRoom}
+          onStartShare={handleStartShare}
+          onLogout={handleLogout}
+        />
+      </div>
     );
   }

   if (appState === 'hosting' && currentRoom && user) {
     return (
-      <ScreenShareHost
-        room={currentRoom}
-        onEndShare={handleEndShare}
-        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
-        isAudioEnabled={isAudioEnabled}
-      />
+      <div>
+        <Toaster position="top-right" />
+        <ScreenShareHost
+          room={currentRoom}
+          user={user}
+          onEndShare={handleEndShare}
+        />
+      </div>
     );
   }

-  if (appState === 'viewing' && currentRoom) {
+  if (appState === 'viewing' && currentRoom && user) {
     return (
-      <ScreenShareViewer
-        room={currentRoom}
-        onLeaveRoom={handleLeaveRoom}
-      />
+      <div>
+        <Toaster position="top-right" />
+        <ScreenShareViewer
+          room={currentRoom}
+          user={user}
+          onLeaveRoom={handleLeaveRoom}
+        />
+      </div>
     );
   }

   return (
     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
+      <Toaster position="top-right" />
       <div className="text-center">
         <h1 className="text-2xl font-bold text-gray-900 mb-4">ScreenShare Pro</h1>
         <p className="text-gray-600">Cargando...</p>
       </div>
     </div>
   );
 }

 export default App;