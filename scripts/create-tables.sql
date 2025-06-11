-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
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

-- Create fuel_logs table
CREATE TABLE IF NOT EXISTS fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
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

-- Create indexes
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_fuel_logs_vehicle_id ON fuel_logs(vehicle_id);
CREATE INDEX idx_fuel_logs_user_id ON fuel_logs(user_id);
CREATE INDEX idx_fuel_logs_date ON fuel_logs(date);

-- Set up Row Level Security (RLS)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;

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
