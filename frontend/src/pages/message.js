import React, { useState } from 'react';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import SocketHandler from './SocketHandler';

const Message = () => {
  const [messages, setMessages] = useState([]);

  const handleNewMessage = (message) => {
    setMessages((prevMessages) => [message, ...prevMessages]);
  };

  return (
    <div>
      <h1>Messaging System</h1>
      <MessageForm />
      <SocketHandler onMessageReceived={handleNewMessage} />
      <MessageList messages={messages} />
    </div>
  );
};

export default Message;
