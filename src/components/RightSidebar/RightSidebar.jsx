import { assets } from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import './RightSidebar.css'

import React, { useContext, useEffect, useState } from 'react'

const RightSidebar = () => {

    const {chatUser, messages} = useContext(AppContext);
    const [msgImgs, setMsgImgs] = useState([]);

    useEffect(()=>{
        let tempVar = [];
        messages.map((msg)=>{
            if(msg.image){
                tempVar.push(msg.image)
            }
        })
        console.log(tempVar);
        setMsgImgs(tempVar);
    }, [messages])


  return chatUser ? (
    <div className="rs">
        <div className="rs-profile">
            <img src={chatUser.userData.avatar} width={300} alt="Profile Img"/>
            <h3>{Date.now()-chatUser.userData.lastSeen <=70000 ? <img src={assets.greenDot} className="dot" alt="online status" /> : null}{chatUser.userData.name}</h3>
            <p>
                {chatUser.userData.bio}
            </p>
        </div>
        <hr />
        <p className='media-p'>Media</p>
        <div className="rs-media">
            <div className='rs-media img'>
                {
                    msgImgs.map((url, index)=>{
                        return (<img key={index} src={url} alt="url" onClick={(e)=>window.open(url)}/>)
                    })
                }
            </div>
        </div>
        <button onClick={()=> logout()}>
            Logout
        </button>
    </div>
  ) :
  <div className='rs'>
    <button onClick={()=> logout()}>
            Logout
    </button>
  </div>
}

export default RightSidebar