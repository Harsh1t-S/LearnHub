# LearnHub

A W3Schools-style learning platform. Write a lecture in Word/Google Docs, paste it straight into the editor, drop in images/videos, and publish — students get a live "Try it Yourself" code editor, quizzes, and progress tracking on every lesson.

## Stack
- Frontend (`frontend/`): React + Vite + Tailwind CSS, Tiptap (rich text editor), Monaco Editor (live code playground), Pyodide (in-browser Python)
- Backend (`backend/`): Node.js + Express, MySQL (via mysql2), JWT auth, Multer (file uploads)

## 1. Set up the database

From the `backend` folder, run:

```
cd backend
npm install
npm run initdb
```

This creates all tables from `config/schema.sql`, using either `DATABASE_URL` (hosted MySQL) or the discrete `DB_*` vars in `.env` (local MySQL). Safe to re-run.

## 2. Configure environment variables

Copy `.env.example` to `.env` in both `backend/` and `frontend/` and fill in your values:
- `backend/.env` — `DATABASE_URL` or `DB_*`, `JWT_SECRET`, `ADMIN_INVITE_CODE`, `CLIENT_URL`
- `frontend/.env` — `VITE_API_URL` (only needed in production, when frontend and backend are on different domains)

## 3. Run the backend

```
cd backend
npm run dev
```

Runs on http://localhost:5000. Uploaded images/videos are stored in `backend/uploads/`.

## 4. Run the frontend

```
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173 and proxies `/api` and `/uploads` requests to the backend.

## 5. Create your first account

Go to http://localhost:5173/signup, choose Student or Instructor, and sign up. Instructor accounts need the invite code from `.env` (`ADMIN_INVITE_CODE`, shown on the signup form as a demo hint). Instructor accounts can create courses, write/publish lessons, and add quizzes.

## How publishing works

1. Log in as an instructor, go to **Admin** in the nav bar.
2. Create a course (title + description + emoji icon).
3. Click "Manage lessons" → add a new lesson → click "Edit".
4. Paste your lecture from Word or Google Docs directly into the editor — headings, bold, lists, and paragraphs carry over automatically.
5. Drop in images/video anywhere via the toolbar, drag-and-drop, or clipboard paste. Embed YouTube clips, attach any file type.
6. Click **Save draft** to keep working later, or **Publish** to make it live.
7. Pick which "Try it Yourself" languages apply (HTML/CSS/JS run in an iframe, Python runs for real via Pyodide/WebAssembly).

Anonymous visitors can browse the course catalog and lesson titles, but full lesson content, the playground, and quizzes require signing up.

## Deployment

- Backend (`backend/`): Railway (or any Node host). Set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`.
- Frontend (`frontend/`): Vercel/Netlify. Set `VITE_API_URL` to your backend's URL + `/api`.
- Database: Railway MySQL (or any hosted MySQL) — `DATABASE_URL` support is built in.

## Project structure

```
learnhub/
  backend/           Express + MySQL backend
    config/          db.js (pool), schema.sql, initDb.js
    routes/          auth, courses, lessons, media, progress
    middleware/       auth.js (JWT + role checks)
    uploads/          uploaded images/videos (served at /uploads/...)
  frontend/          React + Tailwind frontend
    src/pages/        Home, Courses, CourseView, LessonView, Login, Signup, Admin*
    src/components/   Navbar, Sidebar, LessonEditor (Tiptap), TryItEditor (Monaco + Pyodide), Quiz
    src/context/      AuthContext (JWT stored in localStorage)
```

## Notes

- Roles are `admin` (instructor/publisher) and `student`.
- Lesson content is stored as HTML in `lessons.content_html` and rendered with `dangerouslySetInnerHTML` — fine for trusted authors, sanitize server-side if you ever open publishing to untrusted users.
- Uploads are local disk storage — fine for a demo, swap for S3/Cloudinary before scaling.
