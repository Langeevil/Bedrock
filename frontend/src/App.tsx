// src/App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Icones from "./components/sections/Icones";
import SobreSistema from "./components/sections/SobreSistema";
import Escalavel from "./components/sections/Escalavel";
import Agenda from "./components/sections/Agenda";
import Hero2 from "./components/sections/Hero2";
import "./index.css";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import ContainerCollapse from "./components/sections/ContainerCollapse";
import CadastrarNomeScreen from "./pages/CadastrarNomeScreen";
import CadastrarEmailScreen from "./pages/CadastrarEmailScreen";
import CadastrarSenhaScreen from "./pages/CadastrarSenhaScreen";
import DashBoardScreen from "./pages/DashBoardScreen";
import ProjetosScreen from "./pages/ProjetosScreen";
import DisciplineScreen from "./features/disciplines/pages/DisciplineScreen";
import DisciplinaDetailScreen from "./features/disciplines/pages/DisciplineDetailScreen";
import ChatScreen from "./pages/ChatScreen";
import BibliotecaScreen from "./pages/BibliotecaScreen";
import EstatisticaScreen from "./pages/EstatisticaScreen";
import SettingsScreen from "./pages/SettingsScreen";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial pública */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Hero />
              <SobreSistema />
              <Icones />
              <Escalavel />
              <Hero2 />
              <Agenda />
              <ContainerCollapse />
              <Footer />
            </>
          }
        />

        {/* Páginas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/CadastrarNomeScreen" element={<CadastrarNomeScreen />} />
        <Route path="/CadastrarEmailScreen" element={<CadastrarEmailScreen />} />
        <Route path="/CadastrarSenhaScreen" element={<CadastrarSenhaScreen />} />

        {/* Páginas privadas — exigem login */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashBoardScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/projetos"
          element={
            <PrivateRoute>
              <ProjetosScreen />
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
              <DisciplinaDetailScreen />
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
          path="/biblioteca"
          element={
            <PrivateRoute>
              <BibliotecaScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/estatistica"
          element={
            <PrivateRoute>
              <EstatisticaScreen />
            </PrivateRoute>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
