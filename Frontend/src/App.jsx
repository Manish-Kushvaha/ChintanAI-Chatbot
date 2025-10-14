import './App.css';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import { MyContext } from './MyContext.jsx';
import { v1 as uuid1 } from 'uuid';
import { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import axios from 'axios';



function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);

  const [currThreadId, setCurrThreadId] = useState(null);
  const [prevChats, setPrevChats] = useState([]); //Stores all chats of curr thread
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleMode = () =>
    setDarkMode(!darkMode);

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
        const res = await axios.get("http://localhost:8080/api/auth/check", { withCredentials: true });
        setIsAuthenticated(res.data.loggedIn);
      } catch (err) {
        console.error(err)
      }
    };
    checkAuth();
  }, []);

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
            <Login setIsAuthenticated={setIsAuthenticated} />
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
        <ChatWindow toggleMode={toggleMode} darkMode={darkMode} setIsAuthenticated={setIsAuthenticated} />
      </MyContext.Provider>
    </div>
  )
}

export default App
