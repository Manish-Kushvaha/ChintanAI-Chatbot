import React, { useContext, useState, useEffect, useRef } from 'react';
import './ChatWindow.css';
import Chat from './Chat.jsx';
import { MyContext } from './MyContext.jsx';
import { ScaleLoader } from 'react-spinners';
import axios from 'axios';

export default function ChatWindow({ toggleMode, darkMode, setIsAuthenticated, setUsername }) {
  const {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    prevChats, setPrevChats,
    setNewChat, newChat,
    setAllThreads
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const chatWindowRef = useRef(null);
  const username = localStorage.getItem("username");

  // Logout function
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
      localStorage.removeItem("username");
      localStorage.removeItem(`activeThreadId_${username}`);
      setUsername("");

      // Clear chat state
      setPrevChats([]);
      setCurrThreadId(null);
      setAllThreads([]);
      setNewChat(true);
      setPrompt("");
      setReply(null);
    } catch (err) {
      console.log("Logout failed", err);
    }
  };

  const getReply = async () => {
    const currentPrompt = prompt;
    if (!currentPrompt.trim()) return;

    setPrompt(""); // Clear input immediately
    setLoading(true);
    setNewChat(false);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/chat",
        { message: currentPrompt, threadId: currThreadId },
        { withCredentials: true }
      );

      const res = response.data;
      setReply(res.reply);



      if (res.threadId && res.threadId !== currThreadId) {
        setCurrThreadId(res.threadId);
        // setPrevChats([]); // Wait, if we switch thread, we probably shouldn't append to prevChats of OLD thread?
        // But the backend response implies we are now on this thread.
        // If it's a new thread, prevChats should be just this first exchange?
        // The original code did: setPrevChats([]); setNewChat(true);
        // But then the useEffect would run and append the message?
        // If I append here, I should handle the new thread case.

        // Let's look at original logic:
        // if (res.threadId && res.threadId !== currThreadId) {
        //   setCurrThreadId(res.threadId);
        //   setPrevChats([]); 
        //   setNewChat(true);
        // }
        // AND THEN useEffect would run and append?
        // If setPrevChats([]) runs, then useEffect appends, we get [user, assistant]. Correct.

        // So if new thread:
        // setPrevChats([{ role: "user", content: currentPrompt }, { role: "assistant", content: res.reply }]);
        // setNewChat(true);
      }

      // Actually, let's stick to the logic:
      // If new thread, we want to reset prevChats to just this new conversation?
      // Or does setPrevChats([]) clear it, and then we add?

      // Let's refine the replacement:

      if (res.threadId && res.threadId !== currThreadId) {
        setCurrThreadId(res.threadId);
        setPrevChats([
          { role: "user", content: currentPrompt },
          { role: "assistant", content: res.reply }
        ]);
        setNewChat(true);

        // Update sidebar history
        setAllThreads(prev => [
          ...prev,
          { threadId: res.threadId, title: currentPrompt }
        ]);
      } else {
        setPrevChats(prev => [
          ...prev,
          { role: "user", content: currentPrompt },
          { role: "assistant", content: res.reply }
        ]);
      }

    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };





  // changes
  const handleProfileClick = () => {
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [prevChats, loading]);

  return (
    <div className='chatWindow' ref={chatWindowRef}>
      <div className="navbar">
        <div className="mode">
          <span>ChintanAI<i className="fa-solid fa-chevron-down"></i></span>
          <button className='mode-toggle' onClick={toggleMode}>
            <p>{darkMode ? "☀️ Light" : "🌙 Dark"}</p>
          </button>
        </div>

        <div ref={menuRef}>
          <div className="userIconDiv" ref={menuRef}>
            <span className='userIcon' onClick={handleProfileClick}><i className="fa-solid fa-user"></i></span>
          </div>


          {isOpen &&
            <div className="dropDown">
              <p className="user">{username}</p>
              <div className="dropDownItem"><i className="fa-solid fa-gear"></i>Settings</div>
              <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i>Upgrade plan</div>
              <div className="dropDownItem" onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i>Log out</div>
            </div>
          }
        </div>
      </div>

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
