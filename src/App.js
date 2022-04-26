import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {GamePage} from "./Game/Game"

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path='/Where-s-Waldo' element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;