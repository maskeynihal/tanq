-- Complete Database Schema for Fuel Efficiency Tracker
-- Run this script in your Supabase SQL Editor

-- Note: Supabase already provides auth.users table for authentication
-- We'll create additional tables for our application

-- Create a profiles table that extends the auth.users table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  preferred_distance_unit TEXT DEFAULT 'km',
  preferred_fuel_unit TEXT DEFAULT 'liter',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create vehicles table (with auth integration)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  image TEXT,
  distance_unit TEXT NOT NULL,
  fuel_unit TEXT NOT NULL,
  fuel_capacity NUMERIC,
  fuel_type TEXT,
  has_two_tanks BOOLEAN DEFAULT FALSE,
  is_hybrid BOOLEAN DEFAULT FALSE,
  make TEXT,
  model TEXT,
  year INTEGER,
  license_plate TEXT,
  vin TEXT,
  insurance_policy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create fuel_logs table (with auth integration)
CREATE TABLE IF NOT EXISTS fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  odometer NUMERIC,
  is_trip BOOLEAN NOT NULL DEFAULT FALSE,
  trip_distance NUMERIC,
  fuel_amount NUMERIC NOT NULL,
  fuel_type TEXT NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  gas_station TEXT,
  notes TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT check_distance CHECK (
    (is_trip = TRUE AND trip_distance IS NOT NULL) OR
    (is_trip = FALSE AND odometer IS NOT NULL)
  )
);

-- Create maintenance_logs table for tracking vehicle maintenance
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  odometer NUMERIC,
  service_type TEXT NOT NULL,
  description TEXT NOT NULL,
  cost NUMERIC,
  currency TEXT,
  service_provider TEXT,
  notes TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create reminders table for maintenance and other reminders
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  odometer_threshold NUMERIC,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create user_settings table for app-specific settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  notification_preferences JSONB DEFAULT '{"email": true, "push": false}'::jsonb,
  dashboard_layout JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_vehicle_id ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_user_id ON fuel_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_date ON fuel_logs(date);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_vehicle_id ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_user_id ON maintenance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_date ON maintenance_logs(date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_vehicle_id ON reminders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_completed ON reminders(is_completed);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON vehicles;

DROP POLICY IF EXISTS "Users can view their own fuel logs" ON fuel_logs;
DROP POLICY IF EXISTS "Users can insert their own fuel logs" ON fuel_logs;
DROP POLICY IF EXISTS "Users can update their own fuel logs" ON fuel_logs;
DROP POLICY IF EXISTS "Users can delete their own fuel logs" ON fuel_logs;

DROP POLICY IF EXISTS "Users can view their own maintenance logs" ON maintenance_logs;
DROP POLICY IF EXISTS "Users can insert their own maintenance logs" ON maintenance_logs;
DROP POLICY IF EXISTS "Users can update their own maintenance logs" ON maintenance_logs;
DROP POLICY IF EXISTS "Users can delete their own maintenance logs" ON maintenance_logs;

DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can insert their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON reminders;

DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policies for vehicles table
CREATE POLICY "Users can view their own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for fuel_logs table
CREATE POLICY "Users can view their own fuel logs"
  ON fuel_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fuel logs"
  ON fuel_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fuel logs"
  ON fuel_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fuel logs"
  ON fuel_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for maintenance_logs table
CREATE POLICY "Users can view their own maintenance logs"
  ON maintenance_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own maintenance logs"
  ON maintenance_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance logs"
  ON maintenance_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance logs"
  ON maintenance_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for reminders table
CREATE POLICY "Users can view their own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for user_settings table
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a trigger to call the function when a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER fuel_logs_updated_at
  BEFORE UPDATE ON fuel_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER maintenance_logs_updated_at
  BEFORE UPDATE ON maintenance_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
