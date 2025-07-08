

// import React, { useState, useEffect, useRef } from "react";
// import styled from "styled-components";
// import ChatInput from "./ChatInput";
// import Logout from "./Logout";
// import { v4 as uuidv4 } from "uuid";
// import axios from "axios";
// import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

// export default function ChatContainer({ currentChat, socket }) {
//   const [messages, setMessages] = useState([]);
//   const [arrivalMessage, setArrivalMessage] = useState(null);
//   const [targetLang, setTargetLang] = useState("en");
//   const [toggleIndex, setToggleIndex] = useState(null);
//   const scrollRef = useRef();

//   useEffect(() => {
//     async function loadMessages() {
//       const data = await JSON.parse(
//         localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
//       );
//       const response = await axios.post(recieveMessageRoute, {
//         from: data._id,
//         to: currentChat._id,
//       });
//       setMessages(response.data);
//     }
//     if (currentChat) loadMessages();
//   }, [currentChat]);

//   const handleSendMsg = async (msg) => {
//     const data = await JSON.parse(
//       localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
//     );

//     // Emit with ACK callback to receive translated text back
//     socket.current.emit(
//       "send-msg",
//       {
//         to: currentChat._id,
//         from: data._id,
//         msg,
//         targetLang,
//       },
//       (serverAck) => {
//         // Append translated message as sent
//         const msgs = [...messages];
//         msgs.push({
//           fromSelf: true,
//           translated: serverAck.translated,
//           original: msg,
//         });
//         setMessages(msgs);
//       }
//     );

//     // Send to backend to store message
//     await axios.post(sendMessageRoute, {
//       from: data._id,
//       to: currentChat._id,
//       message: msg,
//       targetLang,
//     });
//   };

//   useEffect(() => {
//     if (socket.current) {
//       socket.current.on("msg-recieve", (msgObj) => {
//         setArrivalMessage({
//           fromSelf: false,
//           translated: msgObj.msg,
//           original: msgObj.original || msgObj.msg,
//         });
//       });
//     }
//   }, []);

//   useEffect(() => {
//     if (arrivalMessage) {
//       setMessages((prev) => [...prev, arrivalMessage]);
//     }
//   }, [arrivalMessage]);

//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <Container>
//       <div className="chat-header">
//         <div className="user-details">
//           <div className="avatar">
//             <img
//               src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
//               alt=""
//             />
//           </div>
//           <div className="username">
//             <h3>{currentChat.username}</h3>
//           </div>
//         </div>
//         <Logout />
//       </div>

//       <div className="language-selector">
//         <label>Translate to:</label>
//         <select
//           value={targetLang}
//           onChange={(e) => setTargetLang(e.target.value)}
//         >
//           <option value="en">English</option>
//           <option value="hi">Hindi</option>
//           <option value="es">Spanish</option>
//           <option value="fr">French</option>
//           <option value="de">German</option>
//         </select>
//       </div>

//       <div className="chat-messages">
//         {messages.map((message, index) => (
//           <div
//             ref={scrollRef}
//             key={uuidv4()}
//             className={`message ${message.fromSelf ? "sended" : "recieved"}`}
//             onClick={() =>
//               toggleIndex === index
//                 ? setToggleIndex(null)
//                 : setToggleIndex(index)
//             }
//           >
//             <div className="content">
//               <p>
//                 {toggleIndex === index && message.original
//                   ? message.original
//                   : message.translated || message.message}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <ChatInput handleSendMsg={handleSendMsg} />
//     </Container>
//   );
// }

// const Container = styled.div`
//   display: grid;
//   grid-template-rows: auto auto 1fr auto;
//   gap: 0.1rem;
//   overflow: hidden;

//   .chat-header {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     padding: 0 2rem;
//     .user-details {
//       display: flex;
//       align-items: center;
//       gap: 1rem;
//       .avatar img {
//         height: 3rem;
//       }
//       .username h3 {
//         color: white;
//       }
//     }
//   }

//   .language-selector {
//     display: flex;
//     gap: 0.5rem;
//     align-items: center;
//     padding: 0.5rem 2rem;
//     font-size: 0.9rem;
//     color: white;
//     select {
//       padding: 0.3rem;
//       font-size: 1rem;
//       border-radius: 0.4rem;
//       border: none;
//     }
//   }

//   .chat-messages {
//     padding: 1rem 2rem;
//     display: flex;
//     flex-direction: column;
//     gap: 1rem;
//     overflow: auto;

//     &::-webkit-scrollbar {
//       width: 0.2rem;
//       &-thumb {
//         background-color: #ffffff39;
//         border-radius: 1rem;
//       }
//     }

//     .message {
//       display: flex;
//       .content {
//         max-width: 60%;
//         padding: 1rem;
//         font-size: 1.1rem;
//         border-radius: 1rem;
//         color: #d1d1d1;
//         word-break: break-word;
//       }
//     }

//     .sended {
//       justify-content: flex-end;
//       .content {
//         background-color: #4f04ff21;
//       }
//     }

//     .recieved {
//       justify-content: flex-start;
//       .content {
//         background-color: #9900ff20;
//       }
//     }
//   }
// `;


import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [targetLang, setTargetLang] = useState("en");
  const [toggleIndex, setToggleIndex] = useState(null);
  const scrollRef = useRef();

  // Load message history from DB
  useEffect(() => {
    const loadMessages = async () => {
      const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      const response = await fetch("http://localhost:5000/api/messages/getmsg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: user._id,
          to: currentChat._id,
        }),
      });
      const data = await response.json();
      setMessages(data);
    };

    if (currentChat) loadMessages();
  }, [currentChat]);

  // Send message using socket only
  const handleSendMsg = (msg) => {
    const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));

    socket.current.emit(
      "send-msg",
      {
        to: currentChat._id,
        from: user._id,
        msg,
        targetLang,
      },
      (ack) => {
        if (ack && ack.translated) {
          setMessages((prev) => [
            ...prev,
            {
              fromSelf: true,
              original: msg,
              translated: ack.translated,
            },
          ]);
        }
      }
    );
  };

  // Receive real-time messages
  useEffect(() => {
    if (socket.current) {
      const handleReceive = (msg) => {
        setArrivalMessage({
          fromSelf: false,
          original: msg.original || msg,
          translated: msg.translated || msg,
        });
      };

      socket.current.on("msg-recieve", handleReceive);

      return () => {
        socket.current.off("msg-recieve", handleReceive); // cleanup
      };
    }
  }, [socket]);

  // Add received message to state
  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  // Scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt="avatar"
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout />
      </div>

      <div className="language-selector">
        <label>Translate to:</label>
        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            ref={scrollRef}
            key={uuidv4()}
            className={`message ${message.fromSelf ? "sended" : "recieved"}`}
            onClick={() =>
              toggleIndex === index ? setToggleIndex(null) : setToggleIndex(index)
            }
          >
            <div className="content">
              <p>
                {toggleIndex === index && message.original
                  ? message.original
                  : message.translated || message.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 0.1rem;
  overflow: hidden;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar img {
        height: 3rem;
      }
      .username h3 {
        color: white;
      }
    }
  }

  .language-selector {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem 2rem;
    font-size: 0.9rem;
    color: white;
    select {
      padding: 0.3rem;
      font-size: 1rem;
      border-radius: 0.4rem;
      border: none;
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 60%;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        word-break: break-word;
      }

      &.sended {
        justify-content: flex-end;
        .content {
          background-color: #4f04ff21;
          margin-left: auto;
        }
      }

      &.recieved {
        justify-content: flex-start;
        .content {
          background-color: #9900ff20;
          margin-right: auto;
        }
      }
    }
  }
`;






