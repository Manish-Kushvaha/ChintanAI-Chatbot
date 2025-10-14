import React, { useContext, useState, useEffect } from 'react';
import './ChatWindow.css';
import Chat from './Chat.jsx';
import { MyContext } from './MyContext.jsx';
import { ScaleLoader } from 'react-spinners';
import axios from 'axios';

export default function ChatWindow({ toggleMode, darkMode, setIsAuthenticated }) {
  const { 
    prompt, setPrompt, 
    reply, setReply, 
    currThreadId, setCurrThreadId, 
    prevChats, setPrevChats, 
    setNewChat, newChat 
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Logout function
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
    } catch (err) {
      console.log("Logout failed", err);
    }
  };

  const getReply = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setNewChat(false);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/chat",
        { message: prompt, threadId: currThreadId }, 
        { withCredentials: true } 
      );

      const res = response.data;
      setReply(res.reply);

      if (res.threadId && res.threadId !== currThreadId) {
        setCurrThreadId(res.threadId);
        setPrevChats([]);
        setNewChat(true);
      }

    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  // Append new chats to prevChats
  useEffect(() => {
    if (!reply) return;

    setPrevChats(prev => [
      ...prev,
      { role: "user", content: prompt },
      { role: "assistant", content: reply }
    ]);

    setPrompt(""); 
  }, [reply]);

  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='chatWindow'>
      <div className="navbar">
        <div className="mode">
          <span>ChintanAI<i className="fa-solid fa-chevron-down"></i></span>
          <button className='mode-toggle' onClick={toggleMode}>
            <p>{darkMode ? "☀️ Light" : "🌙 Dark"}</p>
          </button>
        </div>

        <div className="userIconDiv">
          <span className='userIcon' onClick={handleProfileClick}><i className="fa-solid fa-user"></i></span>
        </div>
      </div>

      {isOpen &&
        <div className="dropDown">
          <div className="dropDownItem"><i className="fa-solid fa-gear"></i>Settings</div>
          <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i>Upgrade plan</div>
          <div className="dropDownItem" onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i>Log out</div>
        </div>
      }

      <Chat />
      <ScaleLoader color={darkMode ? "#fff" : "black"} className='loader' loading={loading} />

      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder='Ask anything'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" ? getReply() : ''}
          />
          <div id='submit' onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
        </div>
        <p className='info'>
          ChintanAI can make mistakes. Check important info. See Cookie Preferences.
        </p>
      </div>
    </div>
  );
}
