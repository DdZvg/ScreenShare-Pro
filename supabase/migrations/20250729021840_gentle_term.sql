/*
  # Esquema inicial para ScreenShare Pro

  1. Nuevas Tablas
    - `users` - Perfiles de usuario
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `avatar_url` (text, opcional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `rooms` - Salas de compartir pantalla
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - `host_id` (uuid, foreign key)
      - `is_active` (boolean)
      - `max_participants` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `participants` - Participantes en salas
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `is_host` (boolean)
      - `joined_at` (timestamp)
      - `left_at` (timestamp, opcional)
    
    - `messages` - Mensajes de chat
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `message_type` (enum: text, system, file)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
    - Políticas específicas para hosts y participantes
*/

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de salas
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  host_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  max_participants integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de participantes
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_host boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  UNIQUE(room_id, user_id)
);

-- Crear enum para tipos de mensaje
DO $$ BEGIN
  CREATE TYPE message_type AS ENUM ('text', 'system', 'file');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type message_type DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_participants_room_id ON participants(room_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas para salas
CREATE POLICY "Users can read rooms they participate in"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT room_id FROM participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

CREATE POLICY "Users can create rooms"
  ON rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their rooms"
  ON rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

-- Políticas para participantes
CREATE POLICY "Users can read participants in their rooms"
  ON participants
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

CREATE POLICY "Users can join rooms"
  ON participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
  ON participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para mensajes
CREATE POLICY "Users can read messages in their rooms"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

CREATE POLICY "Users can send messages in their rooms"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    room_id IN (
      SELECT room_id FROM participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at 
  BEFORE UPDATE ON rooms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();