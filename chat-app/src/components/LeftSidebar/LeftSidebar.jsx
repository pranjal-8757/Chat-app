import React, { useContext, useState } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  orderBy,
  startAt,
  endAt,
  getDoc
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const LeftSidebar = () => {
  const navigate = useNavigate()
  const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId } = useContext(AppContext)

  const [user, setUser] = useState(null)
  const [showSearch, setShowSearch] = useState(false)

  const inputHandler = async (e) => {
    const input = e.target.value.toLowerCase()

    if (!input) {
      setShowSearch(false)
      setUser(null)
      return
    }

    try {
      setShowSearch(true)

      const userRef = collection(db, 'users')
      const q = query(
        userRef,
        orderBy('username'),
        startAt(input),
        endAt(input + '\uf8ff')
      )

      const querySnap = await getDocs(q)

      if (querySnap.empty) {
        setUser(null)
        return
      }

      const foundUser = querySnap.docs
        .map(doc => doc.data())
        .find(u => u.id !== userData.id)

      if (!foundUser) {
        setUser(null)
        return
      }

      let userExist = false
      if (chatData) {
        chatData.forEach(chat => {
          if (chat.rId === foundUser.id) userExist = true
        })
      }

      setUser(userExist ? null : foundUser)

    } catch (error) {
      toast.error(error.message)
    }
  }

  const addChat = async () => {
    try {
      const messagesRef = collection(db, 'messages')
      const chatsRef = collection(db, 'chats')

      const newMessageRef = doc(messagesRef)

      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: []
      })

      await updateDoc(doc(chatsRef, user.id), {
  chatsData: arrayUnion({
    messageId: newMessageRef.id,
    lastMessage: '',
    rId: userData.id,
    updatedAt: Date.now(),
    messageSeen: true
  })
})

await updateDoc(doc(chatsRef, userData.id), {
  chatsData: arrayUnion({
    messageId: newMessageRef.id,
    lastMessage: '',
    rId: user.id,
    updatedAt: Date.now(),
    messageSeen: true
  })
})


      setUser(null)
      setShowSearch(false)

    } catch (error) {
      toast.error(error.message)
    }
  }

  const setChat =async (item) => {
    try{
       setMessagesId(item.messageId); 
        setChatUser(item);
        const userChatsRef = doc(db, 'chats', userData.id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        const userChatsData = userChatsSnapshot.data();
        console.log(userChatsData);
        const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messageId===item.messageId);
        userChatsData.chatsData[chatIndex].messageSeen = true;
        await updateDoc(userChatsRef,{
          chatsData:userChatsData.chatsData
        })
      }catch{
        toast.error(error.message)
      }
 
}

  return (
    <div className='ls'>
      <div className='ls-top'>
        <div className='ls-nav'>
          <img src={assets.logo} className='logo' alt='' />
          <div className='menu'>
            <img src={assets.menu_icon} alt='' />
            <div className='sub-menu'>
              <p onClick={() => navigate('/profile')}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>

        <div className='ls-search'>
          <img src={assets.search_icon} alt='' />
          <input onChange={inputHandler} type='text' placeholder='Search here...' />
        </div>
      </div>

      <div className='ls-list'>
        {showSearch && user 
        ? 
          <div onClick={addChat} className='friends add-user'>
            <img src={user.avatar} alt='' />
            <p>{user.name}</p>
          </div>
         : chatData.map((item, index) => (
            <div onClick={()=>setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "":"border"}` }>
              <img src={assets.avatar_icon} alt='' />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default LeftSidebar
