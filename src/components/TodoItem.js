import React from 'react';

const TodoItem = ({todo, toggleComplete, deleteTodo}) => {
    return (
        <li className="todo-item">
            <span
                style = {{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                onClick={() => toggleComplete(todo.id)}
            >
                {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>
                Delete
            </button>
        </li>
    );
};

export default TodoItem;