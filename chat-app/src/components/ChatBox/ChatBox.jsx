import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'

const ChatBox = () => {

  const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext)
  const [input, setInput] = useState("")

const sendMessage = async () => {
  try {
    if (!input || !messagesId) return

    const text = input
    setInput("") 

    await updateDoc(doc(db, 'messages', messagesId), {
      messages: arrayUnion({
        sId: userData.id,
        text: text,
        createdAt: new Date()
      })
    })

    const userIDs = [chatUser.rId, userData.id]

    userIDs.forEach(async (id) => {
      const userChatsRef = doc(db, 'chats', id)
      const userChatsSnapshot = await getDoc(userChatsRef)

      if (userChatsSnapshot.exists()) {
        const userChatData = userChatsSnapshot.data()

        const chatIndex = userChatData.chatsData.findIndex(
          (c) => c.messageId === messagesId
        )

        //if (chatIndex === -1) return

        userChatData.chatsData[chatIndex].lastMessage = text.slice(0, 30)
        userChatData.chatsData[chatIndex].updatedAt = Date.now()

        if (userChatData.chatsData[chatIndex].rId === userData.id) {
          userChatData.chatsData[chatIndex].messageSeen = false
        }

        await updateDoc(userChatsRef, {
          chatsData: userChatData.chatsData
        })
      }
    })

  } catch (error) {
    toast.error(error.message)
  }
}



  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes(); 
    if(hour > 12 ){
      return hour-12 + ":" + minute + " PM";
    }
    else{
      return hour + ":" + minute + " AM";
    }
  }
  useEffect(() => {
    if (!messagesId) return

    const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
      if (res.exists()) {
        setMessages([...res.data().messages].reverse())
      }
    })

    return () => unSub()
  }, [messagesId])

  return chatUser ? (
    <div className='chat-box'>

      <div className='chat-user'>
        <img src={chatUser.userData.avatar} alt='' />
        <p>{chatUser.userData.name} {Date.now()-chatUser.userData.lastSeen <= 70000 ? 
        <img className='dot' src={assets.green_dot} alt='' /> : null}
        </p>
        <img src={assets.help_icon} className='help' alt='' />
      </div>

      <div className='chat-msg'>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}
          >
            <p className='msg'>{msg.text}</p>
            <div>
              <img
                src={msg.sId === userData.id
                  ? userData.avatar
                  : chatUser.userData.avatar}
                alt=''
              />
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>  
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder='Send a message'
        />
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>

    </div>
  ) : (
    <div className='chat-welcome'>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatBox
