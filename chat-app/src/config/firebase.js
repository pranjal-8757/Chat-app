// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBziKZgn-Dk0Rare5PPGoRZo9btPTgv4L0",
  authDomain: "chat-app-gs-41557.firebaseapp.com",
  projectId: "chat-app-gs-41557",
  storageBucket: "chat-app-gs-41557.firebasestorage.app",
  messagingSenderId: "477970508878",
  appId: "1:477970508878:web:8a329f1fa320ba74a7e71f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) =>{
    try{    
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db, "users", user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey, there I am using Chat app",
            lastseen:Date.now()

        });
            await setDoc(doc(db,"chats", user.uid), {
                chatsData:[]
            });
    }catch(error){
        console.error(error)
        toast.error(error.code)
    }
}

const login = async (email, password) => {
    try{
        await signInWithEmailAndPassword(auth, email, password);
    }catch(error){
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const resetPass = async (email) => {
    if(!email){
        toast.error("Enter your email");
        return null;
    }
    try {
        const userRef = collection(db,'users');
        const q = query(userRef, where("email","==",email));
        const querySnap = await getDocs(q);
        if(!querySnap.empty){
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email Sent");
        }
        else{
            toast.error("Email doesn't exists");
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message)
    }
}

export {signup,login,logout,auth,db,resetPass};