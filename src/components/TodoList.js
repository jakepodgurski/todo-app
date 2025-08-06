import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({todos, toggleComplete, deleteTodo, updateTodoText }) => {
    return (
        <ul className="todo-list">
            {todos.map(todo => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    toggleComplete={toggleComplete}
                    updateTodoText={updateTodoText}
                    deleteTodo={deleteTodo}
                />
            ))}
        </ul>
    );
};

export default TodoList;