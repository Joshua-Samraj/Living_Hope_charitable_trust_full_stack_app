import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Donation from './pages/Donation';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/footer';
import Scrolltop from './components/ScrollToTop';
import CategoryProjects from './components/CategoryProjects';
import Volunteer from './pages/Volunteer';
import './index.css';
import GalleryPage from './pages/GalleryPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';
import GalleryUploadPage from './pages/GalleryUploadPage';
import GalleryEditPage from './pages/GalleryEditPage';
import GalleryEdit from './components/GalleryEdit';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatePresence mode="wait" initial={true}>  
            <motion.div key="app-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Scrolltop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:category" element={<CategoryProjects />} />
                <Route path="/donation" element={<Donation />} />
                <Route path="/volunteer" element={<Volunteer />} />
                {/* <Route path="/gallery" element={<Gallery />} /> */}
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/gallery/upload" element={<GalleryUploadPage />} />
                <Route path="/admin/gallery/edit" element={<GalleryEditPage />} />
                <Route path="/admin/gallery/edit/:id" element={<GalleryEdit />} />


              </Routes>
              <Footer />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;