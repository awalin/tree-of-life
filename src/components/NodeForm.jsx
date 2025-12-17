import React, { useState, useEffect } from 'react';
import { generateId } from '../data/sampleFamily';

const NodeForm = ({ 
  selectedNode, 
  onAddChild, 
  onUpdateNode, 
  onDeleteNode,
  onClose 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    birth: '',
    death: '',
    gender: 'male'
  });
  const [mode, setMode] = useState('edit'); // 'edit' or 'addChild'

  useEffect(() => {
    if (selectedNode) {
      setFormData({
        name: selectedNode.name || '',
        birth: selectedNode.birth || '',
        death: selectedNode.death || '',
        gender: selectedNode.gender || 'male'
      });
      setMode('edit');
    }
  }, [selectedNode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (mode === 'addChild') {
      const newChild = {
        id: generateId(),
        ...formData,
        children: []
      };
      onAddChild(selectedNode.id, newChild);
      // Reset form for adding another child
      setFormData({
        name: '',
        birth: '',
        death: '',
        gender: 'male'
      });
    } else {
      onUpdateNode(selectedNode.id, formData);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${selectedNode.name}" and all their descendants?`)) {
      onDeleteNode(selectedNode.id);
    }
  };

  const switchToAddChild = () => {
    setMode('addChild');
    setFormData({
      name: '',
      birth: '',
      death: '',
      gender: 'male'
    });
  };

  const switchToEdit = () => {
    setMode('edit');
    if (selectedNode) {
      setFormData({
        name: selectedNode.name || '',
        birth: selectedNode.birth || '',
        death: selectedNode.death || '',
        gender: selectedNode.gender || 'male'
      });
    }
  };

  if (!selectedNode) {
    return (
      <div className="node-form empty">
        <div className="empty-state">
          <div className="empty-icon">👆</div>
          <h3>No Member Selected</h3>
          <p>Click the edit button (✎) on any family member to view or edit their details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="node-form">
      <div className="form-header">
        <h3>{mode === 'edit' ? 'Edit Member' : 'Add Child'}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="mode-tabs">
        <button 
          className={`tab ${mode === 'edit' ? 'active' : ''}`}
          onClick={switchToEdit}
        >
          Edit
        </button>
        <button 
          className={`tab ${mode === 'addChild' ? 'active' : ''}`}
          onClick={switchToAddChild}
        >
          Add Child
        </button>
      </div>

      {mode === 'edit' && (
        <div className="selected-info">
          <span className={`gender-badge ${selectedNode.gender}`}>
            {selectedNode.gender === 'male' ? '♂' : '♀'}
          </span>
          <span className="selected-name">{selectedNode.name}</span>
        </div>
      )}

      {mode === 'addChild' && (
        <div className="parent-info">
          Adding child to: <strong>{selectedNode.name}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="birth">Birth Year</label>
            <input
              type="text"
              id="birth"
              name="birth"
              value={formData.birth}
              onChange={handleChange}
              placeholder="e.g., 1990"
            />
          </div>

          <div className="form-group">
            <label htmlFor="death">Death Year</label>
            <input
              type="text"
              id="death"
              name="death"
              value={formData.death}
              onChange={handleChange}
              placeholder="Leave empty if living"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Gender</label>
          <div className="gender-selector">
            <label className={`gender-option ${formData.gender === 'male' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleChange}
              />
              <span className="gender-icon">♂</span>
              Male
            </label>
            <label className={`gender-option ${formData.gender === 'female' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleChange}
              />
              <span className="gender-icon">♀</span>
              Female
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn primary">
            {mode === 'edit' ? 'Update Member' : 'Add Child'}
          </button>
          
          {mode === 'edit' && (
            <button 
              type="button" 
              className="btn danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NodeForm;

