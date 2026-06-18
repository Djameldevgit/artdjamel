import { Link } from 'react-router-dom'
import {
  FaMountain,
  FaPortrait,
  FaPagelines,
  FaWater,
  FaDog,
  FaAppleAlt,
  FaSeedling
} from 'react-icons/fa'
import Modalsearchhome from './header/Modalsearchhome'
 
const Acordion = () => {
  return (
    <div className="px-2">
      <h5 className="mb-3 text-left text-primary fw-bold">🎨 Categorías</h5>

      <div className="d-flex flex-column gap-3">
        <Link to="/categoria/paisajes" className="d-flex align-items-center gap-2 text-decoration-none text-success">
          <FaMountain color="#228B22" size={18} /> Paisajes
        </Link>

        <Link to="/categoria/retratos" className="d-flex align-items-center gap-2 text-decoration-none text-warning">
          <FaPortrait color="#FF8C00" size={18} /> Retratos
        </Link>

        <Link to="/categoria/oriental" className="d-flex align-items-center gap-2 text-decoration-none text-danger">
          <FaPagelines color="#DC143C" size={18} /> Oriental
        </Link>

        <Link to="/categoria/marinas" className="d-flex align-items-center gap-2 text-decoration-none text-primary">
          <FaWater color="#1E90FF" size={18} /> Marinas
        </Link>

        <Link to="/categoria/animales" className="d-flex align-items-center gap-2 text-decoration-none text-secondary">
          <FaDog color="#8B4513" size={18} /> Animales
        </Link>

        <Link to="/categoria/bodegones-frutas" className="d-flex align-items-center gap-2 text-decoration-none text-danger">
          <FaAppleAlt color="#FF0000" size={18} /> Bodegones - Frutas
        </Link>

        <Link to="/categoria/bodegones-flores" className="d-flex align-items-center gap-2 text-decoration-none text-success">
          <FaSeedling color="#32CD32" size={18} /> Bodegones - Flores
        </Link>
      </div>

      <Modalsearchhome/>
    </div>
  )
}

export default Acordion
