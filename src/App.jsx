import React, { useState } from 'react';
import FamilyTree from './components/FamilyTree';
import NodeForm from './components/NodeForm';
import { sampleFamilyData, generateId } from './data/sampleFamily';

const App = () => {
  const [familyData, setFamilyData] = useState(sampleFamilyData);
  const [selectedNode, setSelectedNode] = useState(null);

  // Find and update a node in the tree
  const updateNodeInTree = (tree, nodeId, updates) => {
    if (tree.id === nodeId) {
      return { ...tree, ...updates };
    }
    
    if (tree.children) {
      return {
        ...tree,
        children: tree.children.map(child => updateNodeInTree(child, nodeId, updates))
      };
    }
    
    return tree;
  };

  // Find and delete a node from the tree
  const deleteNodeFromTree = (tree, nodeId) => {
    if (tree.id === nodeId) {
      return null; // This shouldn't happen for root, but handle it
    }
    
    if (tree.children) {
      const filteredChildren = tree.children
        .map(child => deleteNodeFromTree(child, nodeId))
        .filter(child => child !== null);
      
      return {
        ...tree,
        children: filteredChildren
      };
    }
    
    return tree;
  };

  // Find a node by ID and add a child to it
  const addChildToNode = (tree, parentId, newChild) => {
    if (tree.id === parentId) {
      return {
        ...tree,
        children: [...(tree.children || []), newChild]
      };
    }
    
    if (tree.children) {
      return {
        ...tree,
        children: tree.children.map(child => addChildToNode(child, parentId, newChild))
      };
    }
    
    return tree;
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  const handleUpdateNode = (nodeId, updates) => {
    const updatedTree = updateNodeInTree(familyData, nodeId, updates);
    setFamilyData(updatedTree);
    // Update selected node if it's the one being edited
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, ...updates });
    }
  };

  const handleAddChild = (parentId, newChild) => {
    const updatedTree = addChildToNode(familyData, parentId, newChild);
    setFamilyData(updatedTree);
  };

  const handleDeleteNode = (nodeId) => {
    // Don't allow deleting the root node
    if (familyData.id === nodeId) {
      alert('Cannot delete the root member of the family tree.');
      return;
    }
    
    const updatedTree = deleteNodeFromTree(familyData, nodeId);
    setFamilyData(updatedTree);
    setSelectedNode(null);
  };

  const handleDataChange = (updatedData) => {
    setFamilyData(updatedData);
  };

  const handleCloseForm = () => {
    setSelectedNode(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Family Tree</h1>
        <p>Interactive family tree visualization</p>
      </header>
      
      <main className="app-main">
        <div className="tree-section">
          <FamilyTree
            data={familyData}
            onNodeSelect={handleNodeSelect}
            selectedNode={selectedNode}
            onDataChange={handleDataChange}
          />
        </div>
        
        <div className="form-section">
          <NodeForm
            selectedNode={selectedNode}
            onAddChild={handleAddChild}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onClose={handleCloseForm}
          />
        </div>
      </main>
    </div>
  );
};

export default App;

