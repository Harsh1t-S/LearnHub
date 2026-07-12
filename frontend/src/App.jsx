import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import api from './api/client'

import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseView from './pages/CourseView'
import LessonView from './pages/LessonView'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Admin from './pages/Admin'
import AdminCourseManage from './pages/AdminCourseManage'
import AdminLessonEdit from './pages/AdminLessonEdit'

export default function App() {
  const [courses, setCourses] = useState([])
  const location = useLocation()
  const showSidebar = location.pathname.startsWith('/courses') || location.pathname.startsWith('/lessons')

  useEffect(() => {
    api.get('/courses').then((res) => setCourses(res.data)).catch(() => {})
  }, [])

  const hideFooter = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {showSidebar && <Sidebar courses={courses} />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseView />} />
            <Route path="/lessons/:id" element={<LessonView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="/admin/courses/:courseId" element={<ProtectedRoute adminOnly><AdminCourseManage /></ProtectedRoute>} />
            <Route path="/admin/lessons/:lessonId" element={<ProtectedRoute adminOnly><AdminLessonEdit /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
      {!hideFooter && !showSidebar && <Footer />}
    </div>
  )
}
