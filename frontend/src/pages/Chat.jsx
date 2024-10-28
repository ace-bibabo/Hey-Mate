import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./Chat.css";
import "../components/Chat/css/Sidebar.css";
import ThemeSwitcher from "../components/ThemeSwitcher";
import ChatMessage from "../components/Chat/ChatMessage";
import InputBox from "../components/Chat/InputBox";
import { post } from "../api";

// Chat component to handle the chat interface
const Chat = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(
    window.innerWidth >= 600
  ); // State to manage sidebar visibility
  const [showBubble] = useState(true); // State to manage chat bubble visibility
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem("chatMessages") || "[]"); // Retrieve messages from local storage
  });
  const [isLoading, setIsLoading] = useState(false); // State to manage loading status
  const messagesEndRef = useRef(null); // Reference to the end of the messages container
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Function to convert raw data to tree data structure
  const convertToTreeData = (obj, parentKey = "", level = 1) => {
    const result = [];

    Object.keys(obj).forEach((key, index) => {
      const uniqueKey = parentKey ? `${parentKey}.${index}` : `${index}`;
      const label = `${key}`;
      // The child items array
      let children = [];
      if (Array.isArray(obj[key])) {
        children = obj[key].map((item, i) => ({
          key: `${uniqueKey}.${i}`,
          label: item,
          children: null,
        }));
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        children = convertToTreeData(obj[key], uniqueKey, level + 1);
      }
      // Create a node
      const node = {
        key: uniqueKey,
        label: label,
        children: children.length ? children : null,
      };
      result.push(node);
    });

    return result;
  };

  // Function to add a new message to the chat
  const addMessage = useCallback((message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  // Debounce function to limit the rate of execution
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Handle sending messages
  const handleSend = useCallback(
    debounce(async (messagesToSend, uploadedFiles) => {
      messagesToSend.forEach((message) => addMessage(message));

      // Text message
      const textMessages = messagesToSend
        .filter((message) => ["text", "fileWithText"].includes(message.type))
        .map((message) => message.content)
        .join(" ");

      // Create a formData object to store file
      const formData = new FormData();
      formData.append("question", textMessages);
      uploadedFiles.forEach((file) => {
        formData.append(`image`, file);
      });

      // Set the loading status
      setIsLoading(true);

      // Try to sent message
      try {
        const response = await post("/chat/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const { answer, type } = response.data.answer;

        // Detect content type
        if (type === "capabilityMap") {
          const jsonString = answer.match(/```JSON\s+({[\s\S]*?})\s+```/)[1];
          const capabilityMap = JSON.parse(jsonString);
          const treeData = convertToTreeData(capabilityMap);
          addMessage({
            content: treeData,
            isUser: false,
            type: "capabilityMap",
          });
        } else if (type === "image") {
          const [preContent, bpmnMatch, tailContent] = answer.split("```");
          addMessage({
            preContent: preContent.trim(),
            tailContent: tailContent?.trim(),
            bpmn: bpmnMatch?.split("\n").slice(1, -1).join("\n").trim(),
            isUser: false,
            type: "bpmnWithPreText",
          });
        } else {
          addMessage({ content: answer, isUser: false });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [addMessage, convertToTreeData]
  );

  // Handle screen size change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages)); // Save messages to local storage
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Scroll to the end of messages

    // The View height used to obtain the actual screen height of the mobile device
    const updateVh = () => {
      document.documentElement.style.setProperty(
        "--doc-height",
        `${window.innerHeight}px`
      );
    };
    updateVh();
    window.addEventListener("resize", updateVh);

    // Handle sidebar visible
    const handleResize = () => {
      if (window.innerWidth < 600 && isSidebarVisible) {
        setIsSidebarVisible(false);
      } else if (window.innerWidth >= 600 && !isSidebarVisible) {
        setIsSidebarVisible(true);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", updateVh);
      window.removeEventListener("resize", handleResize);
    };
  }, [messages, isSidebarVisible]);

  // Function to reset the conversation
  const resetConversation = useCallback(() => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  }, []);

  // Function to navigate to the admin page
  const goToAdmin = useCallback(() => {
    navigate("/admin");
  }, [navigate]);

  return (
    <div className="chat-container">
      <div className={`main-content ${isSidebarVisible ? "with-sidebar" : ""}`}>
        <div
          className={`main-content-header ${
            !isSidebarVisible ? "collapsed" : ""
          }`}
        ></div>
        <div className="main-tool-bar">
          <div className={`main-tool-bar-misc`}>
            <Button
              icon="pi pi-pen-to-square"
              className="new-chat-btn"
              onClick={resetConversation}
            />{" "}
            {/* Reset chat button */}
            <ThemeSwitcher /> {/* Theme switcher button */}
            <Button
              icon="pi pi-cog"
              onClick={goToAdmin}
              className="p-button-icon-only navigation-to-admin"
            />{" "}
            {/* Navigate to admin */}
          </div>
        </div>
        <div className="messages">
          {messages.length === 0 ? (
            <div className="greeting-container">
              <i className={`pi pi-comments greeting-icon`} />
              <h2>Welcome to the EA Assist</h2>
              <p>Start by typing your message in the input box below.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg}
                isUser={msg.isUser}
                showBubble={showBubble}
              /> // Render each message
            ))
          )}
          {isLoading && (
            <ChatMessage
              key="loading"
              message="Loading..."
              isUser={false}
              isLoading={true}
              showBubble={showBubble}
            /> // Render loading message
          )}
          <div ref={messagesEndRef} />
          {/* Reference to scroll to end */}
        </div>
        <div className="input-box-container">
          <InputBox onSend={handleSend} />{" "}
          {/* Input box for sending messages */}
        </div>
      </div>
    </div>
  );
};

export default Chat;
