import { useState } from "react";
import axios from 'axios';

export default function Login({ setIsAuthenticated, setUsername }) {
    const [inputUsername, setInputUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                "http://localhost:8080/api/auth/login",
                { username: inputUsername, password },
                { withCredentials: true }
            );
            localStorage.setItem("username", inputUsername);
            console.log(res.data);
            setUsername(inputUsername);
            setIsAuthenticated(true);
        } catch (err) {
            setError("Invalid username or password");
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Enter Username"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
