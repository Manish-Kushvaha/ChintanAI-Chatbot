import React, { useContext, useEffect } from 'react';
import './Sidebar.css';
import { MyContext } from './MyContext.jsx';
import { v1 as uuid1 } from 'uuid';
import blacklogo from "./assets/blacklogo.png";
const API_BASE = import.meta.env.VITE_API_BASE_URL;


export default function Sidebar({ isOpen, toggleSidebar }) {
  const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats } = useContext(MyContext);

  const getAllThreads = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/thread`, {
        method: "GET",
        credentials: "include", //send session cookies
      });

      if (!response.ok) {
        console.log("Failed to fetch threads:", response.status);
        return;
      }

      const res = await response.json();
      if (!Array.isArray(res)) {
        console.log("Unexpected response format:", res);
        return;
      }

      const filteredData = res.map(thread => ({
        threadId: thread.threadId,
        title: thread.title,
      }));

      setAllThreads(filteredData);
    } catch (err) {
      console.log("Error fetching threads:", err);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, []);

  const creatNewChat = () => {
    setNewChat(true);
    setPrevChats([]);
    setPrompt("");
    setReply(null);
    setCurrThreadId();
  };

  //  fetch messages
  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);

    try {
      const response = await fetch(`${API_BASE}/api/thread/${newThreadId}`, {
        method: "GET",
        credentials: "include", // session cookie
      });

      if (!response.ok) {
        console.log("Failed to fetch thread:", response.status);
        return;
      }

      const res = await response.json();
      console.log("Fetched thread:", res);

      setPrevChats(res);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.log("Error fetching thread:", err);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(`${API_BASE}/api/thread/${threadId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        console.log("Failed to delete thread:", response.status);
        return;
      }

      const res = await response.json();
      console.log("Thread deleted:", res);

      // update threads
      setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

      if (threadId === currThreadId) {
        creatNewChat();
      }
    } catch (err) {
      console.log("Error deleting thread:", err);
    }
  };

  return (
    <>
      <div className="div">
        <div className="bar1">
          <i className="fa-solid fa-bars" onClick={toggleSidebar}></i>
        </div>
        <section className={`sidebar ${isOpen ? "open" : ""}`}>
          {/* New chat button */}
          <div className="btn1">
            <div className="button">
              <img
                className="logo btn"
                src={blacklogo}
                alt="gpt logo"
                onClick={creatNewChat}
              />
              <span>
                <i
                  className="fa-solid fa-pen-to-square btn"
                  onClick={creatNewChat}
                ></i>
              </span>
            </div>
            <div className="bar2">
              <i className="fa-solid fa-xmark" onClick={toggleSidebar}></i>
            </div>
          </div>

          {/* history */}
          <ul className="history scrollable">
            {allThreads?.length > 0 ? (
              allThreads.map((thread, idx) => (
                <li
                  key={idx}
                  onClick={() => changeThread(thread.threadId)}
                  className={thread.threadId === currThreadId ? "highlighted" : ""}
                >
                  {thread.title}
                  <i
                    className="fa-solid fa-trash"
                    onClick={(e) => {
                      e.stopPropagation(); // Stop event bubbling
                      deleteThread(thread.threadId);
                    }}
                  ></i>
                </li>
              ))
            ) : (
              <p className="empty-msg">No chat history yet</p>
            )}
          </ul>

          {/* sign */}
          <div className="sign">
            <p>Shree Ganeshay &hearts;</p>
          </div>
        </section>
      </div>
    </>
  );
}
