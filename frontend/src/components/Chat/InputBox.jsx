import React, { useState, useRef, useEffect } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import './css/InputBox.css';

// InputBox component to handle user input, including text and file uploads
const InputBox = ({ onSend }) => {
  const [message, setMessage] = useState(''); // State to store the text message
  const [uploadedFiles, setUploadedFiles] = useState([]); // State to store uploaded files
  const fileUploadRef = useRef(null); // Reference to the file upload component
  const toast = useRef(null); // Reference to the toast component

  const allowedFileTypes = ['text/plain', 'application/pdf', 'image/jpeg', 'image/png'];

  // Function to handle send button click
  const handleSendClick = () => {
    const trimmedMessage = message.trim(); // Trim whitespace from message
    const messagesToSend = [];

    // If there are uploaded files, create file messages
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        const fileMessage = {
          content: trimmedMessage,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
          isUser: true,
          type: trimmedMessage ? 'fileWithText' : 'file', // Determine message type
        };
        messagesToSend.push(fileMessage);
      });
    } else if (trimmedMessage) {
      // If there is a text message, create text message
      const textMessage = {
        content: trimmedMessage,
        isUser: true,
        type: 'text',
      };
      messagesToSend.push(textMessage);
    }

    // If there are messages to send, call onSend and reset input
    if (messagesToSend.length > 0) {
      onSend?.(messagesToSend, uploadedFiles);
      resetInput();
    }
  };

  // Function to reset input fields
  const resetInput = () => {
    setMessage('');
    setUploadedFiles([]);
    document.getElementById('messageInput').style.height = '35px'; // Reset input height
  };

  // Function to handle file upload
  const handleUpload = (e) => {
    const files = e.files;
    const validFiles = files.filter(file => allowedFileTypes.includes(file.type));
    if (validFiles.length !== files.length) {
      toast.current.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'The file type you selected is not supported.'
      });
    }
    setUploadedFiles(validFiles);
    fileUploadRef.current.clear(); // Clear file upload input
  };

  // Function to handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick(); // Send message on Enter key press
    }
  };

  // Function to handle file deletion
  const handleDeleteFile = (index) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Function to handle paste event for files
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const files = [];
    const invalidFiles = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (allowedFileTypes.includes(file.type)) {
          files.push(file);
        } else {
          invalidFiles.push(file);
        }
      }
    }
    // Show the toast if file not supported
    if (invalidFiles.length > 0) {
      toast.current.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Some files were not uploaded because they are not supported file types.'
      });
    }
    if (files.length > 0) {
      setUploadedFiles(prevFiles => [...prevFiles, ...files]);
    }
  };

  // Add and remove paste event listener
  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  return (
    <div className="input-box-container">
      <Toast ref={toast} className="custom-toast" position="top-center"/>
      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-list-file-name" title={file.name}>
                {file.name}
              </div>
              <Button
                icon="pi pi-times"
                className="p-button-text p-button-danger file-list-remove-item-btn"
                onClick={() => handleDeleteFile(index)}
              />
            </div>
          ))}
        </div>
      )}
      <div className="input-box">
        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          name="files[]"
          accept=".txt,.pdf,.jpg,.jpeg,.png"
          customUpload
          chooseLabel=""
          chooseOptions={{ icon: 'pi pi-paperclip', className: 'p-button-rounded p-button-text upload-btn' }}
          onSelect={handleUpload}
          auto
        />
        <InputTextarea
          id="messageInput"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="message-input"
          placeholder="Type your message..."
          rows={1}
          autoResize
          onKeyDown={handleKeyDown}
        />
        <Button
          icon="pi pi-send"
          className="p-button-rounded p-button-text send-btn"
          onClick={handleSendClick}
          disabled={message.trim() === '' && uploadedFiles.length === 0} // Disable send button if no message or files
        />
      </div>
    </div>
  );
};

export default InputBox;
