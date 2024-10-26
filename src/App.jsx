import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Chat from "./pages/Chat/Chat";
import ProfileUpdate from "./pages/ProfileUpdate/ProfileUpdate";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import { useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { AppContext } from "./context/AppContext";

export default function App(){

  const navigate = useNavigate();
  const {loadUserData, userData} = useContext(AppContext);

  useEffect(()=>{
    onAuthStateChanged(auth, async (user)=>{
      if(user){
        navigate('/chat');
        await loadUserData(user.uid);
      }
      else {
        navigate('/');
      }
    })
  }, [])


  return(
    <>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Login/>}></Route>
        <Route path='/chat' element={<Chat/>}></Route>
        <Route path='/profile-update' element={<ProfileUpdate/>}></Route>
      </Routes>
    </>
  )
}