-- Run this in your Supabase SQL editor to set up the database schema.

create table if not exists file_metadata (
  id               bigserial primary key,
  short_id         text not null unique,
  original_filename text not null,
  stored_filename  text not null,
  content_type     text not null,
  file_size        bigint not null,
  password_hash    text,
  max_access_count integer,
  access_count     integer not null default 0,
  expires_at       timestamptz,
  created_at       timestamptz not null default now(),
  ip_address       text,
  removed_at       timestamptz
);

create index if not exists file_metadata_short_id_idx on file_metadata (short_id);

-- Storage: create a private bucket named "warp-files" in the Supabase dashboard
-- (Storage → New bucket → Name: warp-files → Public: off)
--
-- Then disable Row Level Security on the table (service role key bypasses it):
alter table file_metadata disable row level security;
