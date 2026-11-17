import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import OfflineNotice from './components/OfflineNotice.jsx';
import Home from './pages/Home.jsx';
import DragonBall from './pages/DragonBall.jsx';
import Pokemon from './pages/Pokemon.jsx';
import Filmes from './pages/Filmes.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <OfflineNotice />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dragonball" element={<DragonBall />} />
        <Route path="/pokemon" element={<Pokemon />} />
        <Route path="/filmes" element={<Filmes />} />
      </Routes>
    </BrowserRouter>
  );
}
