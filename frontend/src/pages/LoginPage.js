import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();
    const handleLogin = async (event) => {
        event.preventDefault();
        setMessage("");
        setIsError(false);
        try {
            const response = await axios.post(
                "/api/auth/login",
                { email, password },
            );
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            navigate("/home");
        } catch (error) {
            setIsError(true);
            if (error.response?.data?.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("Unable to connect to the server");
            }
        }
    };
    return (
        <div className="login-page">
            {" "}
            <div className="login-container">
                {" "}
                <h1>Welcome to Hospital Management App</h1>{" "}
                <form className="login-form" onSubmit={handleLogin}>
                    {" "}
                    <h2>Login</h2>{" "}
                    <div className="form-group">
                        {" "}
                        <label htmlFor="email">Email</label>{" "}
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email"
                            required
                        />{" "}
                    </div>{" "}
                    <div className="form-group">
                        {" "}
                        <label htmlFor="password">Password</label>{" "}
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter your password"
                            required
                        />{" "}
                    </div>{" "}
                    <button type="submit">Login</button>{" "}
                    {message && (
                        <p
                            className={
                                isError ? "login-error" : "login-success"
                            }
                        >
                            {" "}
                            {message}{" "}
                        </p>
                    )}{" "}
                </form>{" "}
            </div>{" "}
        </div>
    );
}
export default LoginPage;
