import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io.connect("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (isJoined) {
      axios.get("http://localhost:5000/api/messages")
        .then(res => setChat(res.data))
        .catch(err => console.log("Fetch error"));
    }
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });
    return () => socket.off("receive_message");
  }, [isJoined]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message !== "") {
      const msgData = { 
        sender: username, 
        content: message, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      };
      socket.emit("send_message", msgData);
      try {
        await axios.post("http://localhost:5000/api/messages", msgData);
      } catch (e) { console.log("DB Error"); }
      setMessage("");
    }
  };

  if (!isJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a]">
        <div className="bg-[#1e293b] p-10 rounded-3xl shadow-2xl w-full max-w-sm border-b-4 border-[#8b5cf6]">
          <h2 className="text-4xl font-black text-center text-white mb-2 tracking-tight">CHAT<span className="text-[#8b5cf6]">BOX</span></h2>
          <p className="text-center text-gray-400 mb-8 text-sm uppercase tracking-widest">Group Room</p>
          <input 
            className="w-full bg-[#334155] border-none p-4 rounded-2xl mb-4 text-white outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-all" 
            placeholder="What's your name?" 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <button 
            className="w-full bg-[#8b5cf6] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#7c3aed] transition-all shadow-lg hover:scale-105 active:scale-95"
            onClick={() => setIsJoined(true)}
          >
            JOIN NOW
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0f172a] flex flex-col overflow-hidden font-sans">
      
      {/* Dynamic Header */}
      <div className="bg-[#1e293b] text-white p-5 px-8 flex items-center justify-between shadow-2xl border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#8b5cf6] to-[#ec4899] rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
            #
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight">Group chat</h1>
            <p className="text-[12px] text-gray-400">Active User: <span className="text-[#8b5cf6] font-bold">{username}</span></p>
          </div>
        </div>
      </div>

      {/* Main Chat Space */}
      <div className="flex-1 overflow-y-auto p-6 md:px-40 lg:px-80 space-y-6 bg-[#0f172a] pb-28 custom-scrollbar">
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.sender === username ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] md:max-w-[75%] p-4 px-5 rounded-3xl shadow-xl relative transition-all hover:scale-[1.02] ${
              m.sender === username 
                ? "bg-[#8b5cf6] text-white rounded-br-none" 
                : "bg-[#1e293b] text-white rounded-bl-none border border-gray-700"
            }`}>
              {/* Name - Big and Bold for others */}
              {m.sender !== username && (
                <p className="text-[13px] font-black text-[#ec4899] mb-1 uppercase tracking-tighter">{m.sender}</p>
              )}
              
              <div className="flex flex-col gap-1">
                <p className="text-[17px] font-medium leading-relaxed break-words">{m.content}</p>
                <p className={`text-[10px] self-end mt-1 font-bold ${m.sender === username ? "text-purple-200" : "text-gray-500"}`}>
                  {m.time || "JUST NOW"}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Stylish Footer */}
      <div className="bg-[#1e293b]/80 backdrop-blur-md p-5 px-6 md:px-40 lg:px-80 fixed bottom-0 left-0 right-0 border-t border-gray-700">
        <form onSubmit={sendMessage} className="flex items-center gap-4">
          <input 
            className="flex-1 p-4 bg-[#334155] text-white rounded-2xl border-none outline-none px-6 text-[16px] focus:ring-2 focus:ring-[#8b5cf6] transition-all shadow-inner"
            placeholder="Send a message to everyone..."
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
          />
          <button type="submit" className="bg-[#8b5cf6] text-white p-4 rounded-2xl hover:bg-[#ec4899] transition-all shadow-lg flex items-center justify-center group">
            <svg className="group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </form>
      </div>

    </div>
  );
}

export default App;