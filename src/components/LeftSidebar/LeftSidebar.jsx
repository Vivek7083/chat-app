import { assets } from "../../assets/assets";
import "./LeftSidebar.css";
import { TiThMenu } from "react-icons/ti";

import React, { useContext, useState } from "react";
import { db, logout } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {

  const navigate = useNavigate();
  const {userData, chatData, messagesId, setMessagesId, setChatUser} = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e)=>{
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;
          chatData.map((user)=>{
            if(user.rId === querySnap.docs[0].data().id){
              userExist = true;
            }
          })
          if(!userExist){
            setUser(querySnap.docs[0].data());
          }
        }
        else {
          setUser(null);
        }
      }
      else {
        setShowSearch(false);
      }

    } catch (error) {
      console.log(error);
    }
  }

  const addChat = async (e) => {
    const messagesRef = collection(db, 'messages');
    const chatsRef = collection(db, 'chats');
    
    try {
      // First, check if the chat already exists for the user
      const userChatsRef = doc(chatsRef, userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      
      if (userChatsSnapshot.exists()) {
        const userChatData = userChatsSnapshot.data();
        const existingChat = userChatData.chatsData.find(
          (chat) => chat.rId === user.id
        );
        
        // If chat already exists, exit the function
        if (existingChat) {
          toast.info("Chat with this user already exists.");
          return;
        }
      }
      
      // If chat does not exist, proceed with adding a new chat
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: []
      });
  
      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        })
      });
  
      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        })
      });
  
      // Optionally, you can add a toast message confirming the chat was added
      toast.success("Chat added successfully!");
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };
  

  const setChat = async (item)=>{
    setMessagesId(item.messageId);
    setChatUser(item);
    try {
      const userChatsRef = doc(db, 'chats', userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData  = userChatsSnapshot.data();
      const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messageId === item.messageId);
      userChatsData.chatsData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef, {
        chatsData:userChatsData.chatsData,
      });
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      
    }
  }

  const handleLogout = (e)=>{
    logout();
  }

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.chad} className="logo" alt="Logo" height={70} />
          <div className="menu">
            <TiThMenu color="#fffff0" className="menu-icon" />
            <div className="submenu">
                <p onClick={(e)=>{
                  navigate('/profile-update');
                }}>Edit Profile</p>
                <hr />
                <p onClick={handleLogout}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search} alt="Search Icon" height={30} />
          <input
            type="text"
            name="searchbar"
            placeholder="Search Here"
            id="searchbar"
            onChange={inputHandler}
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user?
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="" />
            <p>{user.name}</p>
          </div>
          :
          chatData && chatData.length ?
          chatData.map((item, index)=>{
            return(
              <div onClick={()=>setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "": "border"}`}>
                <img src={item.userData.avatar} alt="Profile 1" width={300} />
                <div className="message-content">
                  <p>{item.userData.name}</p>
                  <span>{item.lastMessage}</span>
                </div>
              </div>
            )
          })
          : null
        }
      </div>
    </div>
  );
};

export default LeftSidebar;
