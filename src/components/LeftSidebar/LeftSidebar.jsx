import { assets } from "../../assets/assets";
import "./LeftSidebar.css";
import { TiThMenu } from "react-icons/ti";

import React, { useContext, useEffect, useState } from "react";
import { db, logout } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;
          chatData.map((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addChat = async (e) => {
    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");

    try {
      const userChatsRef = doc(chatsRef, userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatData = userChatsSnapshot.data();
        const existingChat = userChatData.chatsData.find(
          (chat) => chat.rId === user.id
        );

        if (existingChat) {
          toast.info("Chat with this user already exists.");
          return;
        }
      }

      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      const uSnap = await getDoc(doc(db, 'users', user.id));
      const uData = uSnap.data();
      setChat({
        messagesId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen:true,
        userData: uData,
      })

      setShowSearch(false);
      setChatVisible(true);

      toast.success("Chat added successfully!");
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }

  };

  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId);
      setChatUser(item);
      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshot.data();
      const chatIndex = userChatsData.chatsData.findIndex(
        (c) => c.messageId === item.messageId
      );
      userChatsData.chatsData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef, {
        chatsData: userChatsData.chatsData,
      });
      setChatVisible(true);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(()=>{
    const updateChatUserData = async ()=>{
      if(chatUser){
        const userRef = doc(db, "users", chatUser.userData.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setChatUser(prev=>({...prev, userData:userData}));
      }
    }

    updateChatUserData();

  }, [chatData])

  return (
    <div className={`ls ${chatVisible ? "hidden" : ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.chad} className="logo" alt="Logo" height={70} />
          <div className="menu">
            <TiThMenu
              color="#fffff0"
              className="menu-icon"
              onClick={() => {
                setShowMenu((prev) => !prev);
                console.log(showMenu);
              }}
            />
            <div className={`submenu ${showMenu ? "show" : "hide"}`}>
              <p onClick={() => navigate("/profile-update")}>Edit Profile</p>
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
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="" />
            <p>{user.name}</p>
          </div>
        ) : chatData && chatData.length ? (
          chatData.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              key={index}
              className={`friends ${
                item.messageSeen || item.messageId === messagesId
                  ? ""
                  : "border"
              }`}
            >
              <img src={item.userData.avatar} alt="Profile 1" width={300} />
              <div className="message-content">
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
};

export default LeftSidebar;
