import React, { useState, useRef, useEffect } from 'react';

const TodoItem = ({ todo, toggleComplete, deleteTodo, updateTodoText }) => {
    const [isEditing, setIsEditing] = useState(false);

    const contentRef = useRef(null);

    useEffect(() => {
        if (isEditing && contentRef.current) {
            contentRef.current.focus();
        }
    }, [isEditing]);

    const handleUpdate = () => {
        const newText = contentRef.current.innerText.trim();
        if (newText && newText !== todo.text) {
            updateTodoText(todo.id, newText);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleUpdate();
        }
    };

    const handleClick = () => {
        setIsEditing(true);
    };

    return (
        <li className="todo-item">
            <button
                className={todo.completed ? 'checkbox completed' : 'checkbox'}
                onClick={() => toggleComplete(todo.id)}>
                {todo.completed && '✓'}
            </button>

            <div
                ref={contentRef}
                className={
                    isEditing
                        ? 'todo-content-editable edit-mode'
                        : (todo.completed ? 'todo-content-editable completed' : 'todo-content-editable')
                }
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onClick={handleClick}
                onBlur={handleUpdate}
                onKeyDown={handleKeyDown}
            >
                {todo.text}
            </div>

            <div className="button-group">
                <button
                    className='delete-btn'
                    onClick={() => deleteTodo(todo.id)}>
                    X
                </button>
            </div>
        </li>
    );
};

export default TodoItem;