import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Dynamicform from './components/Dynamicform';
import Fillingform from './components/Fillingform';
import DisplayTable from './components/Table';

function App() {
  return (
    <Router>
      {/* Router outlet equivalent */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dynamicform" element={<Dynamicform />} />
        <Route path="/form/:tableName" element={<Fillingform />} />
        <Route path="/table/:tableName" element={<DisplayTable />} />
      </Routes>
    </Router>
  );
}

export default App;
