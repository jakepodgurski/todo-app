import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function TodoItem({ todo, toggleComplete, deleteTodo, updateTodoText, updateTodoDueDate }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingDate, setIsEditingDate] = useState(false); // New state for date editing
    const contentRef = useRef(null);

    const handleClick = () => {
        if (!isEditing) {
            setIsEditing(true);
        }
    };

    const handleUpdate = () => {
        if (isEditing) {
            const newText = contentRef.current.innerText;
            if (newText.trim() !== '') {
                updateTodoText(todo.id, newText);
            } else {
                deleteTodo(todo.id);
            }
            setIsEditing(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleUpdate();
        }
    };

    // Logic to format the due date
    const formattedDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    }).replace(' ', '. ') : '';

    // New logic to handle date changes
    const handleDateChange = (e) => {
        const newDate = e.target.value;
        updateTodoDueDate(todo.id, newDate);
        setIsEditingDate(false); // Switch back to display mode
    };
    
    const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

    return (
        <li className={`todo-item ${isOverdue ? 'overdue' : ''}`} ref={setNodeRef} style={style}>
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
                {todo.dueDate && (
                    isEditingDate ? (
                        <input
                            type="date"
                            className="todo-due-date-edit"
                            value={todo.dueDate}
                            onChange={(e) => updateTodoDueDate(todo.id, e.target.value)}
                            onBlur={() => setIsEditingDate(false)}
                        />
                    ) : (
                        <span
                            className={`todo-due-date ${isOverdue ? 'overdue-text' : ''}`}
                            onClick={() => setIsEditingDate(true)}
                        >
                            Due: {formattedDate}
                        </span>
                    )
                )}
            </div>

            <button
                className='delete-btn'
                onClick={() => deleteTodo(todo.id)}>
                X
            </button>
        </li>
    );
}

export default TodoItem;