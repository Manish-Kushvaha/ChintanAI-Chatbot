import './App.css';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import { MyContext } from './MyContext.jsx';
import { v1 as uuid1 } from 'uuid';
import { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import axios from 'axios';
import { ScaleLoader } from 'react-spinners';
import api from "./api/axios.js";

// const API_BASE = import.meta.env.VITE_API_BASE_URL;

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);

  const [currThreadId, setCurrThreadId] = useState(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      return localStorage.getItem(`activeThreadId_${savedUsername}`) || null;
    }
    return null;
  });
  const [prevChats, setPrevChats] = useState([]); //Stores all chats of curr thread
  const [newChat, setNewChat] = useState(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      return !localStorage.getItem(`activeThreadId_${savedUsername}`);
    }
    return true;
  });
  const [allThreads, setAllThreads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      return JSON.parse(localStorage.getItem(`sidebarOpen_${savedUsername}`)) || false;
    }
    return false;
  });
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");

  // Load saved theme from localStorage based on username (initial load)
  const [darkMode, setDarkMode] = useState(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      return JSON.parse(localStorage.getItem(`darkMode_${savedUsername}`)) || false;
    }
    return false;
  });

  useEffect(() => {
    if (username) {
      const savedTheme = JSON.parse(localStorage.getItem(`darkMode_${username}`));
      setDarkMode(savedTheme || false);
      const savedSidebar = JSON.parse(localStorage.getItem(`sidebarOpen_${username}`));
      setSidebarOpen(savedSidebar || false);
    } else {
      setDarkMode(false); // Default to light mode if no user
      setSidebarOpen(false);
    }
  }, [username]);


  // Apply theme class to body
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Save sidebar state
  useEffect(() => {
    if (username) {
      localStorage.setItem(`sidebarOpen_${username}`, JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen, username]);

  const toggleMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      if (username) {
        localStorage.setItem(`darkMode_${username}`, JSON.stringify(newMode));
      }
      return newMode;
    });
  };

  // Save active thread to localStorage
  useEffect(() => {
    if (username) {
      if (currThreadId) {
        localStorage.setItem(`activeThreadId_${username}`, currThreadId);
      } else {
        localStorage.removeItem(`activeThreadId_${username}`);
      }
    }
  }, [currThreadId, username]);

  // Restore active thread messages on load (if thread ID exists)
  useEffect(() => {
    const restoreChatMessages = async () => {
      if (!username || !currThreadId) return;

      // Only fetch if we don't have messages yet (optimization)
      // But on refresh, prevChats is empty, so we fetch.
      if (prevChats.length === 0) {
        try {
          const res = await api.get(`/api/thread/${currThreadId}`, { withCredentials: true });
          setPrevChats(res.data);
          setNewChat(false);
        } catch (err) {
          console.error("Failed to restore chat messages", err);
          // If fetch fails (e.g. thread deleted), reset state
          setCurrThreadId(null);
          setNewChat(true);
          localStorage.removeItem(`activeThreadId_${username}`);
        }
      }
    };
    restoreChatMessages();
  }, [username, currThreadId]);

  const provideValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads
  };  //passing values

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/api/auth/check", { withCredentials: true });
        setIsAuthenticated(res.data.loggedIn);
        if (res.data.loggedIn && res.data.user) {
          setUsername(res.data.user.username);
        } else {
          setUsername("");
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: darkMode ? '#333' : '#fff' }}>
        <ScaleLoader color={darkMode ? "#fff" : "black"} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-wrapper">
        {showRegister ? (
          <>
            <Register />
            <p>
              Already have an account ? {" "}
              <button onClick={() => setShowRegister(false)}>Login</button>
            </p>
          </>
        ) : (
          <>
            <Login setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />
            <p>
              Don't have an account ? {" "}
              <button onClick={() => setShowRegister(true)}>Register</button>
            </p>
          </>
        )}
      </div>
    );
  }
  return (
    <div className={`app app-container ${sidebarOpen ? "sidebar-open" : ""} ${darkMode ? "dark" : "light"}`}>
      <MyContext.Provider value={provideValues}>
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <ChatWindow toggleMode={toggleMode} darkMode={darkMode} setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />
      </MyContext.Provider>
    </div>
  )
}

export default App
