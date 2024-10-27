import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import "./ChatBoxStyle.css";
import React, { useContext, useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/upload";
import { model } from '../../config/gemini';

const ChatBox = () => {
  const { userData, messagesId, messages, setMessages, chatUser } =
    useContext(AppContext);

  const [input, setInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [chatSummary, setChatSummary] = useState(""); // Summary text state

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });
      }
      const userIDs = [chatUser.rId, userData.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "chats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          const chatIndex = userChatData.chatsData.findIndex(
            (c) => c.messageId === messagesId
          );
          userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
          userChatData.chatsData[chatIndex].updatedAt = Date.now();
          if (userChatData.chatsData[chatIndex].rId === userData.id) {
            userChatData.chatsData[chatIndex].messageSeen = false;
          }
          await updateDoc(userChatsRef, {
            chatsData: userChatData.chatsData,
          });
        }
      });
    } catch (error) {
      toast.error("Error sending a message");
      console.log(error.message);
    }
    setInput("");
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });
      }
      const userIDs = [chatUser.rId, userData.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "chats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          const chatIndex = userChatData.chatsData.findIndex(
            (c) => c.messageId === messagesId
          );
          userChatData.chatsData[chatIndex].lastMessage = "Image";
          userChatData.chatsData[chatIndex].updatedAt = Date.now();
          if (userChatData.chatsData[chatIndex].rId === userData.id) {
            userChatData.chatsData[chatIndex].messageSeen = false;
          }
          await updateDoc(userChatsRef, {
            chatsData: userChatData.chatsData,
          });
        }
      });
    } catch (error) {
      console.log(error);
      toast.error(error.message);

    }
  }

  const convertTimeStamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ':' + min + 'PM'
    }
    else {
      return hour + ':' + min + 'AM'
    }
  }

  const convertMillisecondsToHoursMinutes =(ms)=> {
      const date = new Date(ms);
      const hours = date.getHours().toString().padStart(2, '0'); // Get hours and format
      const minutes = date.getMinutes().toString().padStart(2, '0'); // Get minutes and format
  
      return `Last Seen: ${hours}:${minutes}`; // Return formatted date
  }

  const handleSummary = async () => {
    let allMessages = "";
    const messageReversed = [...messages].reverse();

    messageReversed.forEach(message => {
      if (message.sId === userData.id) {
        allMessages += "You: " + message.text + "\n";
      }
      else {
        allMessages += `${chatUser.userData.name}: ${message.text}\n`;
      }

    });
    const result = await model.generateContent(`Summarize the conversation that I(${userData.name})am having with the other person${chatUser.userData.name} -> ${allMessages}`);
    
    
    setChatSummary(result.response.text()); // Set the summary in state
    setIsModalOpen(true); // Open the modal

  }

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  return chatUser ? (
    <div className="chat-box">
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="Profile pic" />
        <p>
          {chatUser.userData.name}{" "}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? <img src={assets.greenDot} className="dot" alt="online status" /> :<span className="last-seen">{convertMillisecondsToHoursMinutes(chatUser.userData.lastSeen)}</span> }

        </p>
        <img src={assets.info} className="help" alt="" width={10} />
      </div>
      <div className="chat-msg">
        {messages.map((msg, index) => {
          return (
            <div
              key={index}
              className={msg.sId === userData.id ? `s-msg` : `r-msg`}
            >
              {msg['image'] ? <img className="msg-img" src={msg.image} alt="image" /> : <p className="msg">{msg.text}</p>}
              <div>
                <img
                  src={
                    msg.sId === userData.id
                      ? userData.avatar
                      : chatUser.userData.avatar
                  }
                  width={20}
                  alt=""
                />
                <p>{convertTimeStamp(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message"
        />
        <input
          onChange={sendImage}
          type="file"
          name="image"
          id="image"
          accept="image/png, image/jpeg, image/jpg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.galleryIcon} width={10} alt="Gallery Icon" />
        </label>
        <div className="summary">
          <label htmlFor="summary">
            <img src={assets.summary} onClick={() => handleSummary()} width={10} alt="Summary Icon" />
          </label>
        </div>
        <img
          onClick={sendMessage}
          src={assets.send}
          width={10}
          className="send-btn"
          alt="Send Button"
        />
      </div>
      {/* Modal for displaying summary */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Chat Summary</h2>
            <p>{chatSummary}</p>
            <button onClick={closeModal} className="modal-close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="chat-welcome">
      <img src={assets.chad} alt="" />
      <h2>Chat Anytime | Anywhere</h2>
    </div>
  );
};

export default ChatBox;