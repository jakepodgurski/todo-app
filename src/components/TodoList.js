import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({todos, toggleComplete, deleteTodo, updateTodoText, updateTodoDueDate, updateTodoPriority }) => {
    return (
        <ul className="todo-list">
            {todos.map(todo => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    toggleComplete={toggleComplete}
                    updateTodoText={updateTodoText}
                    deleteTodo={deleteTodo}
                    updateTodoDueDate={updateTodoDueDate}
                    updateTodoPriority={updateTodoPriority}
                />
            ))}
        </ul>
    );
};

export default TodoList;