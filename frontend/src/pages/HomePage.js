import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function HomePage() {
    const [links, setLinks] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const getHomePage = async () => {
            try {
                const token = localStorage.getItem("token");

                // Ask the backend Facade for all home page data in one request
                const response = await axios.get("/api/home", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setLinks(response.data.links);
            } catch (error) {
                setError("Unable to load home page");
            }
        };

        getHomePage();
    }, []);

    return (
        <>
            <Navbar />

            <main className="page-container">
                <h1>Home</h1>

                {error && <p className="error-message">{error}</p>}

                {/* Navigation links at the top of the page */}
                <div className="home-links">
                    {links.map((link) => (
                        <Link
                            className="home-link"
                            key={link.path}
                            to={link.path}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* On-call, news and notes will be added in later stories */}
                <section>
                    <h2>On-call</h2>
                </section>

                <section>
                    <h2>News</h2>
                </section>

                <section>
                    <h2>Notes</h2>
                </section>
            </main>
        </>
    );
}

export default HomePage;
