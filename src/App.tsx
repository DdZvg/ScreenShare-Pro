import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
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
  
  const { user, isLoading, error, login, register, logout, clearError } = useAuth();
  const { rooms, isLoading: roomsLoading, createRoom, joinRoom, endRoom, leaveRoom } = useRooms(user);

  // Auto-navigate to dashboard when user logs in
  React.useEffect(() => {
    if (user && (appState === 'login' || appState === 'register')) {
      setAppState('dashboard');
    } else if (!user && !isLoading && appState !== 'login' && appState !== 'register') {
      setAppState('login');
    }
  }, [user, appState, isLoading]);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    await register(name, email, password);
  };

  const handleCreateRoom = async (name: string, maxParticipants: number) => {
    const room = await createRoom(name, maxParticipants);
    if (room) {
      setCurrentRoom(room);
      setAppState('hosting');
    }
  };

  const handleJoinRoom = async (code: string) => {
    const room = await joinRoom(code);
    if (room) {
      setCurrentRoom(room);
      // If user is host, go to hosting view, otherwise viewing
      if (user && room.hostId === user.id) {
        setAppState('hosting');
      } else {
        setAppState('viewing');
      }
    }
  };

  const handleStartShare = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room && user) {
      setCurrentRoom(room);
      if (room.hostId === user.id) {
        setAppState('hosting');
      } else {
        setAppState('viewing');
      }
    }
  };

  const handleEndShare = async () => {
    if (currentRoom) {
      await endRoom(currentRoom.id);
    }
    setCurrentRoom(null);
    setAppState('dashboard');
  };

  const handleLeaveRoom = async () => {
    if (currentRoom && user) {
      await leaveRoom(currentRoom.id);
    }
    setCurrentRoom(null);
    setAppState('dashboard');
  };

  const handleLogout = async () => {
    await logout();
    setCurrentRoom(null);
    setAppState('login');
  };

  const toggleAuthMode = () => {
    clearError();
    setAppState(appState === 'login' ? 'register' : 'login');
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (appState === 'login') {
    return (
      <>
        <LoginForm
          onLogin={handleLogin}
          onToggleMode={toggleAuthMode}
          isLoading={isLoading}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  if (appState === 'register') {
    return (
      <>
        <RegisterForm
          onRegister={handleRegister}
          onToggleMode={toggleAuthMode}
          isLoading={isLoading}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  if (appState === 'dashboard' && user) {
    return (
      <>
        <Dashboard
          user={user}
          rooms={rooms}
          isLoading={roomsLoading}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartShare={handleStartShare}
          onLogout={handleLogout}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  if (appState === 'hosting' && currentRoom && user) {
    return (
      <>
        <ScreenShareHost
          room={currentRoom}
          user={user}
          onEndShare={handleEndShare}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  if (appState === 'viewing' && currentRoom && user) {
    return (
      <>
        <ScreenShareViewer
          room={currentRoom}
          user={user}
          onLeaveRoom={handleLeaveRoom}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ScreenShare Pro</h1>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );
}

export default App;