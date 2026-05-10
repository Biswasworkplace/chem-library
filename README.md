# 🧪 Chem Library — Setup Guide

Your personal chemistry file manager with cloud storage + login.

---

## Step 1 — Set up Supabase (5 minutes)

1. Go to **https://supabase.com** → Sign up (free)
2. Click **"New Project"** → give it any name (e.g. "chem-library") → set a database password → Create

### Create the files table
3. In your project, click **SQL Editor** (left sidebar)
4. Paste this SQL and click **Run**:

```sql
create table files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  folder_id text not null,
  name text not null,
  size bigint,
  type text,
  storage_path text not null,
  public_url text,
  created_at timestamptz default now()
);

alter table files enable row level security;

create policy "Users can manage their own files"
  on files for all
  using (auth.uid() = user_id);
```

### Create the storage bucket
5. Click **Storage** (left sidebar) → **New bucket**
6. Name it exactly: `files`
7. Check **"Public bucket"** → Create bucket
8. Click the `files` bucket → **Policies** tab → **New policy** → choose "Full customization"
9. Paste this policy:

```sql
(auth.uid() = (storage.foldername(name))[1]::uuid)
```
   Set: Policy name = `user_owns_file`, Allowed operations = SELECT, INSERT, DELETE → Save

### Get your API keys
10. Go to **Settings** → **API**
11. Copy:
    - **Project URL** (looks like `https://xxxx.supabase.co`)
    - **anon public** key (long string starting with `eyJ`)

---

## Step 2 — Deploy to Vercel (3 minutes)

1. Go to **https://github.com** → create a new repository called `chem-library`
2. Upload all these project files to it (drag and drop in GitHub's interface)
3. Go to **https://vercel.com** → Sign up with GitHub → **New Project**
4. Import your `chem-library` repository → click **Deploy**
5. After deploy, go to **Settings → Environment Variables** and add:
   - `REACT_APP_SUPABASE_URL` = your Project URL from step 10
   - `REACT_APP_SUPABASE_ANON_KEY` = your anon key from step 10
6. Go to **Deployments** → click the three dots on the latest deploy → **Redeploy**

Your app is now live at `https://chem-library-xxxx.vercel.app` 🎉

---

## Step 3 — Create your account

1. Open your Vercel URL
2. Click **"Create account"** tab → enter your email + password → Submit
3. Check your email for a confirmation link → click it
4. Sign in → you're in!

---

## How to use

- **Browse folders**: Click any subject → drill into subfolders
- **Upload files**: Navigate to any leaf folder → click **"+ Upload"** → drag & drop or browse
- **Open files**: Click **"Open"** next to any file to view it in your browser
- **Download files**: Click the **↓** button
- **Delete files**: Click 🗑 → confirm

## Supported file types
PDF, images (JPG, PNG), Word docs (.docx), PowerPoint (.pptx), Excel (.xlsx), and any other file type.

---

## Troubleshooting

**"Failed to upload"** → Check your Supabase storage bucket is named exactly `files` and is public

**Can't sign in** → Make sure you confirmed your email (check spam folder)

**White screen** → Check Vercel environment variables are set correctly and you redeployed after adding them
