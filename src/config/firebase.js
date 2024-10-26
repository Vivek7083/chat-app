import { initializeApp } from "firebase/app";
import {createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut} from "firebase/auth"
import {collection, doc, getDocs, getFirestore, query, setDoc, where} from "firebase/firestore"
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_CHAT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_CHAT_APP_FIREBASE_DOMAIN,
  projectId: import.meta.env.VITE_CHAT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_CHAT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_CHAT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_CHAT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password)=>{
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        toast.success('Signup Successful')
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: '',
            avatar: '',
            bio: 'Hey There I am using CHAD',
            lastSeen: Date.now()
        })
        await setDoc(doc(db, "chats", user.uid), {
            chatsData: []
        })
    } catch (error) {
        console.log(error);
        toast.error(String(error.code.split('/')[1]).split('-').join(' ').toUpperCase());
    }
}

const login = async (email, password)=>{
    try {
        await signInWithEmailAndPassword(auth ,email, password);
        toast.success("Login Successful")
    }
    catch (error){
        console.log(error)  ;
        toast.error(String(error.code.split('/')[1]).split('-').join(' ').toUpperCase());
    }
}

const resetPass = async (email)=>{
    if(!email){
        toast.error("Enter your email");
        return null;
    }
    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where("email", "==", email));
        const querySnap = await getDocs(q);
        if(!querySnap.empty){
            await sendPasswordResetEmail(auth, email);
            toast.success("Reset Email Sent");
        }
        else {
            toast.error("No such user exists");
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message);
    }
}

const logout = async ()=>{
    try {
        await signOut(auth);
        toast.info("You are logged out");
    }
    catch(error){
        toast.error(error.message.toUpperCase().split('/')[1].split('-').join(' '));
    }
}

export {signup, login, logout, resetPass, auth, db};