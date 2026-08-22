-- GlobeTrotter Supabase Schema

-- 1. Create tables
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  language text default 'en',
  created_at timestamptz default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  start_date date not null,
  end_date date not null,
  description text,
  cover_photo_url text,
  currency text default 'USD',
  is_public boolean default false,
  interests text[],
  created_at timestamptz default now()
);

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  cost_index numeric default 2,
  popularity int default 85,
  image_url text,
  latitude numeric,
  longitude numeric
);

create table if not exists stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade not null,
  city_id uuid references cities(id) not null,
  start_date date not null,
  end_date date not null,
  order_index int not null
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references cities(id) not null,
  name text not null,
  category text default 'activity',
  cost numeric default 0,
  duration_minutes int default 120,
  description text,
  image_url text
);

create table if not exists stop_activities (
  id uuid primary key default gen_random_uuid(),
  stop_id uuid references stops(id) on delete cascade not null,
  activity_id uuid references activities(id) not null,
  scheduled_date date,
  scheduled_time time,
  cost_override numeric
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade not null,
  category text not null check (category in ('transport','stay','activity','meal','other')),
  amount numeric not null,
  note text
);

create table if not exists shared_trips (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade not null,
  share_token text unique not null default encode(gen_random_bytes(8), 'hex'),
  created_at timestamptz default now()
);

create table if not exists saved_destinations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  city_id uuid references cities(id) not null
);

-- 2. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table trips enable row level security;
alter table stops enable row level security;
alter table stop_activities enable row level security;
alter table expenses enable row level security;
alter table cities enable row level security;
alter table activities enable row level security;
alter table shared_trips enable row level security;
alter table saved_destinations enable row level security;

-- 3. RLS Policies
create policy "Users manage own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Owner full access" on trips for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read shared trips" on trips for select using (is_public = true);

create policy "Access via trip ownership" on stops for all using (
  exists (select 1 from trips where trips.id = stops.trip_id and (trips.user_id = auth.uid() or trips.is_public = true))
);

create policy "Access via stop-trip ownership" on stop_activities for all using (
  exists (
    select 1 from stops join trips on trips.id = stops.trip_id
    where stops.id = stop_activities.stop_id and (trips.user_id = auth.uid() or trips.is_public = true)
  )
);

create policy "Access via trip ownership" on expenses for all using (
  exists (select 1 from trips where trips.id = expenses.trip_id and (trips.user_id = auth.uid() or trips.is_public = true))
);

create policy "Public read cities" on cities for select using (true);
create policy "Public read activities" on activities for select using (true);

create policy "Public read share links" on shared_trips for select using (true);
create policy "Owner insert share links" on shared_trips for insert with check (
  exists (select 1 from trips where trips.id = trip_id and trips.user_id = auth.uid())
);

create policy "Owner manages saved destinations" on saved_destinations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Seed Data for Cities
insert into cities (id, name, country, cost_index, popularity, image_url) values
  ('c1010101-0000-0000-0000-000000000001', 'Paris', 'France', 3, 98, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000002', 'Tokyo', 'Japan', 3, 96, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000003', 'Rome', 'Italy', 2, 94, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000004', 'Barcelona', 'Spain', 2, 92, 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000005', 'Kyoto', 'Japan', 2, 90, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000006', 'New York', 'United States', 3, 97, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000007', 'Bali', 'Indonesia', 1, 89, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000008', 'London', 'United Kingdom', 3, 95, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000009', 'Sydney', 'Australia', 3, 88, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000010', 'Cairo', 'Egypt', 1, 86, 'https://images.unsplash.com/photo-1572252821143-035a0049f7e5?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000011', 'Dubrovnik', 'Croatia', 2, 87, 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000012', 'Cape Town', 'South Africa', 2, 85, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000013', 'Rio de Janeiro', 'Brazil', 2, 84, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000014', 'Istanbul', 'Turkey', 1, 91, 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80'),
  ('c1010101-0000-0000-0000-000000000015', 'Reykjavik', 'Iceland', 3, 83, 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80')
on conflict (id) do nothing;
