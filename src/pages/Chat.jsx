import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  // Load user from localStorage
  useEffect(() => {
    const fetchUser = async () => {
      const stored = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
      if (!stored) {
        navigate("/login");
      } else {
        setCurrentUser(JSON.parse(stored));
      }
    };
    fetchUser();
  }, [navigate]);

  // Initialize socket and emit add-user
  // useEffect(() => {
  //   if (currentUser) {
  //     socket.current = io(host, {
  //       transports: ["websocket"], // ensures stable connection
  //     });

  //     socket.current.on("connect", () => {
  //       socket.current.emit("add-user", currentUser._id);
  //     });
  //   }
  // }, [currentUser]);

  useEffect(() => {
  if (currentUser) {
    socket.current = io(host);
    socket.current.emit("add-user", currentUser._id);
  }
}, [currentUser]);
  // Load contacts if avatar is set
  useEffect(() => {
    const loadContacts = async () => {
      if (currentUser?.isAvatarImageSet) {
        const res = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        setContacts(res.data);
      } else {
        navigate("/setAvatar");
      }
    };

    if (currentUser) loadContacts();
  }, [currentUser, navigate]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container>
      <div className="container">
        <Contacts contacts={contacts} changeChat={handleChatChange} />
        {currentChat === undefined ? (
          <Welcome />
        ) : (
          <ChatContainer currentChat={currentChat} socket={socket} />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;

  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;

    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
