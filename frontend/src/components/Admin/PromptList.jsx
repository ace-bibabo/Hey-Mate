// src/components/PromptList/PromptList.jsx
import React, { useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { OverlayPanel } from 'primereact/overlaypanel';
import { put, post, get } from '../../api';
import './css/PromptList.css';

const PromptList = ({ selectedGroup, prompts, setPrompts, selectedPrompt, setSelectedPrompt }) => {
  const overlayPanelRefs = useRef({});  // Stores refs for each OverlayPanel

  // Function to handle prompt selection
  const onPromptSelect = (e) => {
    if (e.value && (!selectedPrompt || e.value.id !== selectedPrompt.id)) {
      setSelectedPrompt(e.value);
    }
  };

  // Function to add a new prompt
  const addNewPrompt = async () => {
    const newPrompt = { text: `New Prompt Text`, group: selectedGroup.group_id };
    try {
      const response = await post('/prompts/', newPrompt);
      setPrompts([...prompts, response.data]);
      setSelectedPrompt(response.data);
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  // Function to fetch prompts for the selected group
  const fetchGroupPrompts = async () => {
    try {
      const response = await get(`/groups/${selectedGroup.group_id}/prompts/`);
      const sortedPrompts = response.data.sort((a, b) => b.is_default - a.is_default);
      setPrompts(sortedPrompts);
      setSelectedPrompt(sortedPrompts.find(p => p.is_default === 1) || sortedPrompts[0]);
    } catch (error) {
      console.error('Error fetching group prompts:', error);
    }
  };

  // Fetch prompts when selectedGroup changes
  useEffect(() => {
    if (selectedGroup) {
      fetchGroupPrompts();
    }
  }, [selectedGroup]);

  // Function to set a prompt as default
  const setDefaultPrompt = async (promptId) => {
    try {
      // Fetch all prompts
      const response = await get('/prompts/');
      const allPrompts = response.data;

      // Reset is_default for all prompts
      const resetPrompts = allPrompts.map((prompt) => ({ ...prompt, is_default: 0 }));

      // Set selected prompt as default
      const updatedPrompts = resetPrompts.map((prompt) =>
        prompt.id === promptId ? { ...prompt, is_default: 1 } : prompt
      );

      // Update all prompts in the backend
      await Promise.all(updatedPrompts.map((prompt) => put(`/prompts/${prompt.id}/`, prompt)));

      // Filter prompts for the current group
      const currentGroupPrompts = updatedPrompts.filter((prompt) => prompt.group === selectedGroup.group_id);

      // Update state with filtered prompts
      const sortedPrompts = currentGroupPrompts.sort((a, b) => b.is_default - a.is_default);
      setPrompts(sortedPrompts);
      const defaultPrompt = sortedPrompts.find((prompt) => prompt.is_default === 1);
      setSelectedPrompt(defaultPrompt);

      // Hide OverlayPanel
      if (overlayPanelRefs.current[promptId]) {
        overlayPanelRefs.current[promptId].current.hide();
      }
    } catch (error) {
      console.error('Error setting default prompt:', error);
    }
  };

  return (
    <div className="prompt-list">
      <div className="prompt-list-header">
        <Button
          icon="pi pi-plus"
          label="Add New Prompt"
          className="add-new-prompt"
          onClick={addNewPrompt}
        />
      </div>
      <ListBox
        value={selectedPrompt}
        options={prompts}
        onChange={onPromptSelect}
        optionLabel="name"
        className="list-box prompts-list"
        itemTemplate={(option) => {
          if (!overlayPanelRefs.current[option.id]) {
            overlayPanelRefs.current[option.id] = React.createRef();
          }
          return (
            <div className={`prompt-list-item ${option.is_default ? 'default' : ''}`}>
              <span className="prompt-item-left">{option.name}</span>
              {option.is_default ? (
                <i className="pi pi-star prompt-item-right-default" style={{ marginLeft: 'auto' }}></i>
              ) : (
                <Button
                  icon="pi pi-ellipsis-h"
                  className="p-button-rounded p-button-text prompt-item-right"
                  onClick={(e) => {
                    overlayPanelRefs.current[option.id].current.toggle(e);
                  }}
                  style={{ marginLeft: 'auto' }}
                />
              )}
              <OverlayPanel
                ref={overlayPanelRefs.current[option.id]}
                dismissable
              >
                <div className="button-group">
                  <Button
                    label="Set Default"
                    className="p-button-secondary set-default-prompt"
                    onClick={() => setDefaultPrompt(option.id)}
                  />
                </div>
              </OverlayPanel>
            </div>
          );
        }}
      />
    </div>
  );
};

export default PromptList;
