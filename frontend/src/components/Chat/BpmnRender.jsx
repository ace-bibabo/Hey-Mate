import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import './css/BpmnRender.css';

// BpmnRender component to render BPMN diagrams
const BpmnRender = forwardRef(({ bpmnXML }, ref) => {
  const canvasRef = useRef(null); // Reference to the canvas element
  const viewerRef = useRef(null); // Reference to the BPMN viewer instance

  // Expose the exportToImage function to parent components
  useImperativeHandle(ref, () => ({
    exportToImage
  }));

  useEffect(() => {
    // Initialize the BPMN viewer with the canvas element
    viewerRef.current = new BpmnViewer({
      container: canvasRef.current,
    });

    // Function to render the BPMN diagram
    const renderDiagram = async () => {
      try {
        await viewerRef.current.importXML(bpmnXML);
        const canvas = viewerRef.current.get('canvas');
        if (canvas && canvas.viewbox) {
          const { inner } = canvas.viewbox();
          // Set canvas location
          const center = {
            x: inner.x + inner.width / 2,
            y: inner.y + inner.height / 2
          };
          canvas.zoom('fit-viewport', center); // Fit the diagram to the viewport
        } else {
          console.error('Canvas or view box not initialized');
        }
      } catch (e) {
        console.error('Failed to render BPMN diagram:', e);
      }
    };

    renderDiagram(); // Call the render function

    // Handle window resize event to adjust the BPMN diagram
    const handleResize = () => {
      if (viewerRef.current) {
        const canvas = viewerRef.current.get('canvas');
        if (canvas && canvas.viewbox) {
          const { inner } = canvas.viewbox();
          // Recalculate the canvas location
          const center = {
            x: inner.x + inner.width / 2,
            y: inner.y + inner.height / 2
          };
          canvas.zoom('fit-viewport', center); // Fit the diagram to the viewport
        }
      }
    };

    window.addEventListener('resize', handleResize); // Add resize event listener

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize); // Remove resize event listener
      if (viewerRef.current) {
        viewerRef.current.destroy(); // Destroy the viewer instance
      }
    };
  }, [bpmnXML]); // Re-run the effect if bpmnXML changes

  // Function to export the BPMN diagram as an SVG image
  const exportToImage = async () => {
    if (viewerRef.current) {
      try {
        const { svg } = await viewerRef.current.saveSVG();
        const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'diagram.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to export diagram:', err);
      }
    } else {
      console.error('Viewer not initialized');
    }
  };

  return (
    <div>
      <div className="bpmn-canvas" ref={canvasRef}/>
      {/* Canvas element for BPMN viewer */}
    </div>
  );
});

export default BpmnRender;
