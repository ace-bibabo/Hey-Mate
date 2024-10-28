import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Toast } from 'primereact/toast';

// ToastNotification component to show toast notifications
const ToastNotification = forwardRef((props, ref) => {
  const toast = useRef(null); // Reference to the Toast component

  // Use useImperativeHandle to expose the show function to parent components
  useImperativeHandle(ref, () => ({
    show: (severity, summary, detail) => {
      // Show toast notification with given severity, summary, and detail
      toast.current.show({ severity, summary, detail, life: 3000 });
    }
  }));

  return <Toast ref={toast}></Toast>; // Render the Toast component
});

export default ToastNotification;
