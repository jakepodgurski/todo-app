import React, { useState } from 'react';

function AddTodo({ addTodo }) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo(text, dueDate, priority);
    setText('');
    setDueDate('');
    setPriority('');
  };

  return (
    <form className="add-todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new to-do..."
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="add-todo-due-date"
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="">None</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      <button type="submit">+</button>
    </form>
  );
}

export default AddTodo;