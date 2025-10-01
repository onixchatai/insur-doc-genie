-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  company_address TEXT,
  company_logo_url TEXT,
  license_number TEXT,
  iicrc_certification_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  estimated_value NUMERIC(10, 2),
  purchase_price NUMERIC(10, 2),
  condition TEXT,
  brand TEXT,
  model TEXT,
  color TEXT,
  room_location TEXT,
  serial_number TEXT,
  image_url TEXT,
  purchase_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create inventory_jobs table
CREATE TABLE public.inventory_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_address TEXT,
  claim_number TEXT,
  policy_number TEXT,
  job_status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id),
  supervisor UUID REFERENCES auth.users(id),
  due_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Inventory items policies
CREATE POLICY "Users can view own items"
  ON public.inventory_items FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own items"
  ON public.inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON public.inventory_items FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own items"
  ON public.inventory_items FOR DELETE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Inventory jobs policies
CREATE POLICY "Users can view assigned jobs"
  ON public.inventory_jobs FOR SELECT
  USING (
    auth.uid() = assigned_to 
    OR auth.uid() = created_by 
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create jobs"
  ON public.inventory_jobs FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update jobs"
  ON public.inventory_jobs FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete jobs"
  ON public.inventory_jobs FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_inventory_jobs_updated_at
  BEFORE UPDATE ON public.inventory_jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger function for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();