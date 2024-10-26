import { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import "./ProfileUpdate.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import upload from "../../lib/upload";
import { AppContext } from "../../context/AppContext";

export default function ProfileUpdate() {

    const navigate = useNavigate();
    const [image, setImage] = useState(false);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [uid, setUID] = useState('');
    const [prevImg, setPrevImg] = useState('');
    const {setUserData} = useContext(AppContext);


    const profileUpdate = async (event)=>{
        event.preventDefault();
        try {
            if(!prevImg && !image){
                toast.error("Upload a picture");
            }
            const docRef = doc(db, 'users', uid);
            if(image){
                const imgUrl = await upload(image);
                setPrevImg(imgUrl);
                // const docSnap = await getDoc(docRef);
                // const docData = docSnap.data();
                // console.log(docData);
                await updateDoc(docRef, {
                    avatar: imgUrl,
                    bio: bio,
                    name: name,
                })
            }
            else {
                await updateDoc(docRef, {
                    bio:bio,
                    name:name,
                })
            }
            const snap = await getDoc(docRef);
            setUserData(snap.data());
            navigate('/chat');
        } catch (error) {
            console.log(error.message);
            toast.error(error.message);
        }
    }


    useEffect(()=>{
        onAuthStateChanged(auth, async (user)=>{
            if(user){
                setUID(user.uid);
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if(docSnap.data().name){
                    setName(docSnap.data().name);
                }
                if(docSnap.data().bio){
                    setBio(docSnap.data().bio);
                }
                if(docSnap.data().avatar){
                    setPrevImg(docSnap.data().avatar);
                }
            }
            else {
                navigate('/');
            }
        })
    }, [])


  return (
    <div className="profile">
        <div className="profile-container">
            <form id="profile-update" onSubmit={profileUpdate}>
                <h3>Profile Details</h3>
                <label htmlFor="avatar">
                    <input onChange={(e)=>{
                        setImage(e.target.files[0])
                    }} type="file" id="avatar" accept="image/png image/jpg image/jpeg" hidden/>
                    <img src={image? URL.createObjectURL(image): assets.addUser} alt="" />
                    upload profile image
                </label>
                <input value={name} onChange={(e)=>setName(e.target.value)} type="text" placeholder="Your Name" name="" id="" required/>
                <textarea value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Write bio" required></textarea>
                <button type="submit">Save</button>
            </form>
            <img className="logo" src={image? URL.createObjectURL(image): prevImg ? prevImg : assets.chad} alt="Logo"/>
        </div>
    </div>
  )
}
