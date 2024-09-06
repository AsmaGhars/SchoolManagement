import React, { useState } from 'react';
import axios from 'axios';

const MessageForm = () => {
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      await axios.post('http://localhost:5000/api/messages/send', { receiverId, content }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReceiverId('');
      setContent('');
      alert('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="receiverId">Receiver ID:</label>
        <input
          type="text"
          id="receiverId"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="content">Message:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <button type="submit">Send</button>
    </form>
  );
};

export default MessageForm;
