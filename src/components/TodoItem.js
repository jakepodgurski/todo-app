import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function TodoItem({ todo, toggleComplete, deleteTodo, updateTodoText, updateTodoDueDate, updateTodoPriority }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: todo._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [isEditingPriority, setIsEditingPriority] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (isEditing) {
            contentRef.current.focus();
        }
    }, [isEditing]);

    const handleClick = () => {
        if (!isEditing) {
            setIsEditing(true);
        }
    };

    const handleUpdate = () => {
        if (isEditing) {
            const newText = contentRef.current.innerText;
            if (newText.trim() !== '') {
                updateTodoText(todo._id, newText);
            } else {
                deleteTodo(todo._id);
            }
            setIsEditing(false);
        }
    };

    const handlePriorityChange = (e) => {
        const newPriority = e.target.value;
        updateTodoPriority(todo._id, newPriority);
        setIsEditingPriority(false);
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

    // Logic to check if a task is overdue
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
                    onClick={() => toggleComplete(todo._id)}>
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
                {isEditingPriority ? (
                    <select
                        className="todo-priority-edit"
                        value={todo.priority}
                        onChange={handlePriorityChange}
                        onBlur={() => setIsEditingPriority(false)}
                        autoFocus
                    >
                        <option value="">No Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                ) : (
                    todo.priority && (
                        <span
                            className={`todo-priority ${todo.priority.toLowerCase()}`}
                            onClick={() => setIsEditingPriority(true)}
                        >
                            {todo.priority}
                        </span>
                    )
                )}
                {todo.dueDate && (
                    isEditingDate ? (
                        <input
                            type="date"
                            className="todo-due-date-edit"
                            value={todo.dueDate}
                            onChange={(e) => updateTodoDueDate(todo._id, e.target.value)}
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
                onClick={() => deleteTodo(todo._id)}>
                X
            </button>
        </li>
    );
}

export default TodoItem;