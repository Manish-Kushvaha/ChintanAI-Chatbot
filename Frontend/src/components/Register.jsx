import { useState } from "react";
import axios from 'axios';
import api from "../api/axios.js";


export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const API_BASE = import.meta.env.VITE_API_BASE_URL;


    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post(
                "/api/auth/register",
                { username, email, password },
                { withCredentials: true }
            );
            setMessage("Registered successfully! You can now login.");
        } catch (err) {
            setMessage("User already exists or registration failed");
            console.error(err);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Enter Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    // type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

