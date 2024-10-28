import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import './Admin.css';
import Sidebar from '../components/Admin/Sidebar';
import PromptList from '../components/Admin/PromptList';
import { get, put, del } from '../api';

const Admin = () => {
  // State management for groups, selected group, prompts, selected prompt, and sidebar collapse
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Toast ref
  const toast = useRef(null);

  // Fetch groups when component mounts
  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch prompts when selected group changes
  useEffect(() => {
    fetchPrompts();
  }, []);

  // Set default prompt or first prompt if no default is set
  useEffect(() => {
    if (prompts.length > 0 && (!selectedPrompt || !prompts.some(p => p.id === selectedPrompt.id))) {
      setSelectedPrompt(prompts.find(p => p.is_default === 1) || prompts[0]);
    }
  }, [prompts]);

  // Fetch prompts based on selected group
  useEffect(() => {
    if (selectedGroup) {
      if (selectedGroup.group_id) {
        fetchPrompts(selectedGroup.group_id);
      }
    }
  }, [selectedGroup]);

  // Fetch groups from the server
  const fetchGroups = async () => {
    try {
      const response = await get('/groups/');
      setGroups(response.data);
      if (response.data.length > 0 && !selectedGroup) {
        setSelectedGroup(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Fetch prompts for a specific group
  const fetchPrompts = async (groupId) => {
    if (!groupId) {
      return; // Exit function if groupId is undefined
    }
    try {
      const response = await get(`/groups/${groupId}/prompts/`);
      // Handle response data
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  // Delete a prompt
  const deletePrompt = async (promptId) => {
    try {
      await del(`/prompts/${promptId}/`);
      const updatedPrompts = prompts.filter(prompt => prompt.id !== promptId);
      const sortedPrompts = updatedPrompts.sort((a, b) => b.is_default - a.is_default);
      setPrompts(sortedPrompts);
      setSelectedPrompt(sortedPrompts.length > 0 ? sortedPrompts[0] : null);
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Prompt deleted successfully', life: 3000 });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error deleting prompt', life: 3000 });
    }
  };

  // Function to update a prompt
  const updatePrompt = async () => {
    if (!selectedPrompt.name.trim() || !selectedPrompt.text.trim()) {
      toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Prompt name and description cannot be empty', life: 3000 });
      return;
    }
    try {
      await put(`/prompts/${selectedPrompt.id}/`, selectedPrompt);
      const updatedPrompts = prompts.map((prompt) =>
        prompt.id === selectedPrompt.id ? selectedPrompt : prompt
      );
      setPrompts(updatedPrompts);
      setSelectedPrompt(selectedPrompt);
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Prompt updated successfully', life: 3000 });
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error updating prompt', life: 3000 });
    }
  };

  return (
    <div className="admin-container">
      <Toast ref={toast} />
      <Sidebar
        isPanelCollapsed={isPanelCollapsed}
        setIsPanelCollapsed={setIsPanelCollapsed}
        groups={groups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        setGroups={setGroups}
      />
      <div className="main-content">
        <h1>Prompts</h1>
        {selectedGroup && (
          <PromptList
            selectedGroup={selectedGroup}
            prompts={prompts}
            setPrompts={setPrompts}
            selectedPrompt={selectedPrompt}
            setSelectedPrompt={setSelectedPrompt}
          />
        )}
        {selectedPrompt && (
          <div className="input-container">
            <div className="input-group">
              <label htmlFor="prompt-id">Prompt ID</label>
              <InputText
                id="prompt-id"
                value={selectedPrompt ? selectedPrompt.id : ''}
                readOnly
              />
            </div>
            <div className="input-group">
              <label htmlFor="prompt-name">Prompt Name</label>
              <InputText
                id="prompt-name"
                value={selectedPrompt ? selectedPrompt.name : ''}
                onChange={(e) => {
                  const updatedPrompt = { ...selectedPrompt, name: e.target.value };
                  setSelectedPrompt(updatedPrompt);
                }}
              />
              <small id="prompt-help">
                Edit your prompt name here.
              </small>
            </div>
            <div className="input-group">
              <label htmlFor="prompt-text">Prompt Description</label>
              <textarea
                id="prompt-text"
                value={selectedPrompt ? selectedPrompt.text : ''}
                onChange={(e) => {
                  const updatedPrompt = { ...selectedPrompt, text: e.target.value };
                  setSelectedPrompt(updatedPrompt);
                }}
              />
              <small id="prompt-help">
                Edit your prompt description here.
              </small>
            </div>
          </div>
        )}
        {selectedPrompt && (
          <div className="button-group">
            <Button
              label="Confirm"
              icon="pi pi-check"
              className="confirm-modify-prompt"
              onClick={updatePrompt}
            />
            <Button
              label="Delete"
              icon="pi pi-trash"
              className="p-button-danger delete-prompt"
              onClick={() => deletePrompt(selectedPrompt.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
