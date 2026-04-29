// src/App.tsx
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Hero from "./shared/components/Hero";
import Navbar from "./shared/components/Navbar";
import Icones from "./shared/components/sections/Icones";
import SobreSistema from "./shared/components/sections/SobreSistema";
import Escalavel from "./shared/components/sections/Escalavel";
import Agenda from "./shared/components/sections/Agenda";
import Hero2 from "./shared/components/sections/Hero2";
import "./index.css";
import Footer from "./shared/components/Footer";
import ContainerCollapse from "./shared/components/sections/ContainerCollapse";

// Features
import { 
  LoginScreen, 
  RegisterNameScreen, 
  RegisterEmailScreen, 
  RegisterPasswordScreen, 
  PrivateRoute,
  AdminOnlyRoute,
  DirectoryOnlyRoute,
  StatisticsOnlyRoute,
} from "./features/auth";
import { DashboardScreen } from "./features/dashboard";
import { ProjectsScreen } from "./features/projects";
import { DisciplineScreen, DisciplineDetailScreen } from "./features/disciplines";
import { ChatScreen } from "./features/chat";
import { DirectoryScreen } from "./features/directory";
import { LibraryScreen } from "./features/library";
import { StatisticsScreen } from "./features/statistics";
import { SettingsScreen } from "./features/settings";
import { AdminScreen } from "./features/admin";

function LandingPage() {
  const [landingDark, setLandingDark] = useState(false);

  return (
    <div className={landingDark ? "landing-page landing-page-dark" : "landing-page"}>
      <Navbar
        landingDark={landingDark}
        onToggleLandingTheme={() => setLandingDark((current) => !current)}
      />
      <Hero />
      <SobreSistema />
      <Icones />
      <Escalavel />
      <Hero2 />
      <Agenda />
      <ContainerCollapse />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial pública */}
        <Route path="/" element={<LandingPage />} />

        {/* Páginas públicas */}
        <Route path="/login" element={<LoginScreen />} />
        {/* Mantendo as rotas antigas para compatibilidade se necessário, ou redirecionando */}
        <Route path="/CadastrarNomeScreen" element={<RegisterNameScreen />} />
        <Route path="/CadastrarEmailScreen" element={<RegisterEmailScreen />} />
        <Route path="/CadastrarSenhaScreen" element={<RegisterPasswordScreen />} />
        
        {/* Novas rotas padronizadas */}
        <Route path="/register-name" element={<RegisterNameScreen />} />
        <Route path="/register-email" element={<RegisterEmailScreen />} />
        <Route path="/register-password" element={<RegisterPasswordScreen />} />

        {/* Páginas privadas — exigem login */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/projetos"
          element={
            <PrivateRoute>
              <ProjectsScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/disciplinas"
          element={
            <PrivateRoute>
              <DisciplineScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/disciplinas/:id"
          element={
            <PrivateRoute>
              <DisciplineDetailScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/diretorio"
          element={
            <DirectoryOnlyRoute>
              <DirectoryScreen />
            </DirectoryOnlyRoute>
          }
        />
        <Route
          path="/biblioteca"
          element={
            <PrivateRoute>
              <LibraryScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/estatistica"
          element={
            <StatisticsOnlyRoute>
              <StatisticsScreen />
            </StatisticsOnlyRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminOnlyRoute>
              <AdminScreen />
            </AdminOnlyRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
