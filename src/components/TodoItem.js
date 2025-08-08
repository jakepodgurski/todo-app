import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TodoItem = ({ todo, toggleComplete, deleteTodo, updateTodoText }) => {
    const [isEditing, setIsEditing] = useState(false);

    const contentRef = useRef(null);

    // Dnd-kit hooks for drag and drop functionality
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: todo.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

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

    const handleBlur = () => {
        handleUpdate();
    };

    return (
        <li className="todo-item" ref={setNodeRef} style={style}>
            <div className="todo-content-group">
                <div
                    className="drag-handle"
                    {...attributes}
                    {...listeners}
                >
                    &#x2261;
                </div>

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
            </div>

            <button
                className='delete-btn'
                onClick={() => deleteTodo(todo.id)}>
                X
            </button>
        </li>
    );
};

export default TodoItem;