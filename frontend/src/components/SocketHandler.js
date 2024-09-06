import React, { useEffect } from 'react';
import io from 'socket.io-client';

const SocketHandler = ({ onMessageReceived }) => {
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('newMessage', (message) => {
      onMessageReceived(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [onMessageReceived]);

  return null;
};

export default SocketHandler;
