import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import GuestLayout from './components/GuestLayout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Home from './pages/Home.jsx';
import Projects from './pages/Projects.jsx';
import ProjectShow from './pages/ProjectShow.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import TechCategories from './pages/admin/TechCategories.jsx';
import TechCategoryForm from './pages/admin/TechCategoryForm.jsx';
import TechItems from './pages/admin/TechItems.jsx';
import TechItemForm from './pages/admin/TechItemForm.jsx';
import AdminProjects from './pages/admin/AdminProjects.jsx';
import ProjectForm from './pages/admin/ProjectForm.jsx';
import Certifications from './pages/admin/Certifications.jsx';
import CertificationForm from './pages/admin/CertificationForm.jsx';
import Experiences from './pages/admin/Experiences.jsx';
import ExperienceForm from './pages/admin/ExperienceForm.jsx';
import Settings from './pages/admin/Settings.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectShow />} />
      </Route>

      <Route element={<GuestLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route path="admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="tech-categories" element={<TechCategories />} />
        <Route path="tech-categories/new" element={<TechCategoryForm />} />
        <Route path="tech-categories/:id/edit" element={<TechCategoryForm />} />
        <Route path="tech-items" element={<TechItems />} />
        <Route path="tech-items/new" element={<TechItemForm />} />
        <Route path="tech-items/:id/edit" element={<TechItemForm />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/new" element={<ProjectForm />} />
        <Route path="projects/:id/edit" element={<ProjectForm />} />
        <Route path="certifications" element={<Certifications />} />
        <Route path="certifications/new" element={<CertificationForm />} />
        <Route path="certifications/:id/edit" element={<CertificationForm />} />
        <Route path="experiences" element={<Experiences />} />
        <Route path="experiences/new" element={<ExperienceForm />} />
        <Route path="experiences/:id/edit" element={<ExperienceForm />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
