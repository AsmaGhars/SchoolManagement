const MessageList = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/messages/received",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(response.data);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div>
      <h2>Received Messages</h2>
      <ul>
        {messages.map((message) => (
          <li key={message._id}>
            <strong>From:</strong>{" "}
            {message.sender.name ? message.sender.name : "Unknown"}
            <br />
            <strong>Content:</strong> {message.content}
            <br />
            <strong>Timestamp:</strong>{" "}
            {new Date(message.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};
