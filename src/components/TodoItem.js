import React, { useState, useRef, useEffect }  from 'react';

const TodoItem = ({todo, toggleComplete, deleteTodo, updateTodoText}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const textareaRef = useRef(null);
    const spanRef = useRef(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";

            const end = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(end, end);
        }
    }, [isEditing]);

    const handleUpdate = () => {
        if (editText.trim() && editText !== todo.text) {
            updateTodoText(todo.id, editText.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleUpdate();
        }
    };

    return (
        <li className="todo-item">
            <div className="button-group">
                <button 
                    className={todo.completed ? 'checkbox completed' : 'checkbox'}
                    onClick={() => toggleComplete(todo.id)}>
                    {todo.completed && '✓'}
                </button>
            </div>
            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleUpdate}
                    onKeyDown={handleKeyDown}
                    className="edit-input"
                    autoFocus
                />
            ) : (
                <span
                    ref={spanRef}
                    className={todo.completed ? 'todo-text completed' : 'todo-text'}
                    onClick={() => setIsEditing(true)}
                >
                    {todo.text}
                </span>
            )}
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