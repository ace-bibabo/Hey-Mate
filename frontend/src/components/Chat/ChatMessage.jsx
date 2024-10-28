import React, { useRef } from "react";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Tree } from "primereact/tree";
import { Parser } from "@json2csv/plainjs";
import {
  IconFileTypeSvg,
  IconFileTypeCsv,
  IconFileDescription,
} from "@tabler/icons-react";
import DOMPurify from "dompurify";
import "./css/ChatMessage.css";
import BpmnRender from "./BpmnRender";
import LoadingMessage from "./LoadingMessage";

// Function to flatten tree data structure into a list of rows with key and label
const flattenTreeData = (node, parentKey = "") => {
  const rows = [];
  const currentKey = parentKey ? `${parentKey} > ${node.label}` : node.label;

  rows.push({ key: node.key, label: currentKey });

  if (node.children) {
    node.children.forEach((child) => {
      rows.push(...flattenTreeData(child, currentKey));
    });
  }
  return rows;
};

// ChatMessage component to display different types of messages
const ChatMessage = ({ message, isUser, isLoading, showBubble }) => {
  const bpmnRenderRef = useRef(null); // Reference to BpmnRender component

  // Function to handle CSV download
  const handleDownloadCsv = () => {
    try {
      const flattenedData = flattenTreeData(message.content[0]); // Flatten the tree data
      const fields = ["key", "label"];
      const parser = new Parser({ fields });
      const csv = parser.parse(flattenedData); // Convert JSON to CSV
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error converting JSON to CSV:", error);
    }
  };

  // Function to handle SVG download
  const handleDownloadSvg = () => {
    if (bpmnRenderRef.current) {
      bpmnRenderRef.current.exportToImage(); // Call exportToImage method from BpmnRender component
    }
  };

  // Function to get file extension from filename
  const getExtension = (filename) => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop() : "Unknown";
  };

  // Function to render the message content based on its type
  const renderMessageContent = () => {
    if (isLoading) {
      return (
        <div className="loading-message-outer">
          <LoadingMessage/>
        </div>
      ); // Display loading message if loading
    }
    switch (message.type) {
      // Render Capability Map
      case "capabilityMap":
        return (
          <div className="message-block" style={{ minWidth: "80%" }}>
            <div className="message">
              <Tree value={[message.content][0]} style={{ fontSize: "1rem" }}/>
            </div>
            <div className="message-tool-button-container">
              <Button
                className="p-button-rounded p-button-icon-only message-tool-button"
                onClick={handleDownloadCsv}
              >
                <IconFileTypeCsv
                  className="message-tool-button-icon"
                  size={20}
                />
              </Button>
            </div>
          </div>
        );
      // Render BPMN Diagram
      case "bpmnWithPreText":
        return (
          <div className="message-block" style={{ width: "100%" }}>
            <div className="message" style={{ width: "100%" }}>
              <div
                className="message-bpmn-text-pre-content"
                style={{ marginBottom: "10px" }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    message.preContent.replace(/\n/g, "<br />")
                  ),
                }}
              />
              <BpmnRender ref={bpmnRenderRef} bpmnXML={message.bpmn}/>{" "}
              {/* Render BPMN diagram */}
              <div
                className="message-bpmn-text-tail-content"
                style={{ marginTop: "10px" }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    message.tailContent.replace(/\n/g, "<br />")
                  ),
                }}
              />
            </div>
            <div className="message-tool-button-container">
              <Button
                className="p-button-rounded p-button-icon-only message-tool-button"
                onClick={handleDownloadSvg}
              >
                <IconFileTypeSvg
                  className="message-tool-button-icon"
                  size={20}
                />
              </Button>
            </div>
          </div>
        );
      // Render File and File with text
      case "file":
      case "fileWithText":
        const extension = getExtension(message.file.name); // Get file extension
        return (
          <div className="message" style={{ minWidth: "30%" }}>
            <div className="message-file-block">
              <IconFileDescription
                className="message-file-block-icon"
                size={35}
              />
              <div className="message-file-block-file-info">
                <div className="message-file-block-filename">
                  {message.file.name}
                </div>
                <div className="message-file-block-file-ext">
                  {extension.toUpperCase()}
                </div>
              </div>
            </div>
            {message.content && (
              <div
                className="message-file-block-text-content"
                style={{ marginTop: "10px" }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    message.content.replace(/\n/g, "<br />")
                  ),
                }}
              />
            )}
          </div>
        );
      // Render with default style
      default:
        const sanitizedContent = DOMPurify.sanitize(
          message.content.replace(/\n/g, "<br />")
        );
        return (
          <div
            className="message"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        );
    }
  };

  return (
    <div
      className={`message-container ${isUser ? "user" : "other"} ${
        showBubble ? "bubble" : ""
      }`}
    >
      {!isUser && (
        <div className="message-avatar-container">
          <Avatar
            icon="pi pi-microchip-ai"
            shape="circle"
            className="message-avatar"
          />
        </div>
      )}
      {renderMessageContent()}
    </div>
  );
};

export default ChatMessage;
