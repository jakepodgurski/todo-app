import React, { useState } from 'react';

const AddTodo = ({ addTodo }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!inputValue.trim()) return;

        addTodo(inputValue);
        setInputValue('');
    };

    return (
        <form onSubmit={handleSubmit} className="add-todo-form">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add a new to-do..."
            />
            <button type="submit">Add</button>
        </form>
    );
};

export default AddTodo;