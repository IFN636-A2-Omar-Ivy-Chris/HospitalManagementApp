import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">Hospital Management App</div>

            <div className="navbar-links">
                <Link to="/home">Home</Link>
                <Link to="/wards">Wards</Link>
                <Link to="/pharmacy">Pharmacy</Link>

                {/* Other navigation links can be added here later */}

                <button onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    );
}

export default Navbar;
