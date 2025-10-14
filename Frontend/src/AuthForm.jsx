// import { useState } from "react";
// import React from 'react'

// export default function AuthForm() {
//     const [mode, setMode] = useState(null);
//     const [form, setForm] = useState({ username: "", email: "", password: "" });

//     const handleLogout = async () => {
//         try {
//             const res = await fetch("http://localhost:8080/api/auth/logout", {
//                 method: "POST",
//                 credentials: "include",
//             });
//             const data = await res.json();
//             alert(data.message); // optional
//             // Reset state after logout
//             setForm({ username: "", email: "", password: "" });
//             setMode(null); // hide forms or show login/signup buttons
//         } catch (err) {
//             console.error("Logout failed", err);
//         }
//     };


//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         let url = "";

//         if (mode === "signup") {
//             url = "http://localhost:8080/api/auth/register";
//         } else {
//             url = "http://localhost:8080/api/auth/login";
//         }

//         const res = await fetch(url, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//             body: JSON.stringify(form)
//         });

//         const data = await res.json();
//         alert(data.message || data.error);

//         if (res.ok) {
//             const profileRes = await fetch("http://localhost:8080/api/auth/profile", {
//                 credentials: "include"
//             });
//             const profile = await profileRes.json();
//             console.log("Logged in user:", profile);
//         }
//     }
//     return (
//         <div style={{ maxWidth: "400px", margin: "auto" }}>
//                 <button onClick={handleLogout}>Logout</button>
//             <div>
//                 <button onClick={() => setMode("login")}>Login</button>
//                 <button onClick={() => setMode("signup")}>Signup</button>
//             </div>
//             {mode && (
//                 <form onSubmit={handleSubmit}>
//                     {mode === "signup" && (
//                         <input
//                             type="text"
//                             placeholder="Username"
//                             value={form.username}
//                             onChange={(e) => setForm({ ...form, username: e.target.value })}
//                         />
//                     )}
//                     <input
//                         type="email" placeholder="Email"
//                         value={form.email}
//                         onChange={(e) => setForm({ ...form, email: e.target.value })}
//                     />

//                     <input
//                         type="password" placeholder="Password"
//                         value={form.password}
//                         onChange={(e) => setForm({ ...form, password: e.target.value })}
//                     />

//                     <button type="submit">
//                         {mode === "login" ? "Login" : "SignUp"}
//                     </button>
//                 </form>
//             )}
//         </div>
//     )
// }
