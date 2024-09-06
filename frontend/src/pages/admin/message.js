import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "../../app/globals.css";
import Navbar from "@/components/Admin/Navbar";
import Layout from "@/components/Admin/Layout";
import Modal from "@/components/Admin/Modal";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchMessages();
    } else {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const socket = io("http://localhost:5000");

      socket.on("newMessage", (message) => {
        setMessages((prevMessages) => [message, ...prevMessages]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(
        "http://localhost:5000/api/messages/received",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      console.log(token);
      

      await axios.post(
        "http://localhost:5000/api/messages/send",
        { receiverId, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setContent("");
      setReceiverId("");
      setIsModalVisible(true);
    } catch (error) {
      console.error("Failed to send message:", error);
      setErrorMessage("Failed to send message.");
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setErrorMessage("");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Navbar />
      <div className="grid grid-cols-1 gap-6">
  {messages.length > 0 ? (
    messages.map((message) => (
      <div
        key={message._id}
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-6"
      >
        <p>
          <strong>Sender:</strong> {message.sender}
        </p>
        <p>
          <strong>Receiver:</strong> {message.receiver}
        </p>
        <p>
          <strong>Content:</strong> {message.content}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(message.timestamp).toLocaleString()}
        </p>
      </div>
    ))
  ) : (
    <p>No messages available.</p>
  )}
</div>

    </Layout>
  );
};

export default Messages;
