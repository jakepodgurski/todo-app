import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import './App.css';

function App() {

  // Load todos from localStorage on initial render
  const [todos, setTodos] = useState(() => {
    const storedTodos = localStorage.getItem('todos');
    return storedTodos ? JSON.parse(storedTodos) : [
      { id: 1, text: 'Learn React', completed: false },
      { id: 2, text: 'Build a to-do app', completed: false },
      { id: 3, text: 'Deploy to Netlify', completed: false },
    ];
  });

  // New state to manage the current filter
  const [filter, setFilter] = useState('all');

  // Filter todos based on the current filter state
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }
    if (filter === 'completed') {
      return todo.completed;
    }
    return true; // filter === 'all'
  });

  // Save todos to localStorage whenever the todos state changes
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Add todo to list
  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  const updateTodoText = (id, newText) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  // Toggle the 'completed' status of a todo
  const toggleComplete = (id) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete a todo
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // New function to clear all completed todos
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  // dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // Check if there are any completed todos to clear
  const hasCompletedTodos = todos.some(todo => todo.completed);

  return (
    <div className="App">
      <header className="App-header">
        <h1>To-Do List</h1>
      </header>
      <main>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="todo-container">
            <AddTodo addTodo={addTodo} />
            <div className="filters">
              <button
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'active-filter' : ''}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={filter === 'active' ? 'active-filter' : ''}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={filter === 'completed' ? 'active-filter' : ''}
              >
                Completed
              </button>
              {hasCompletedTodos && (
                <button 
                  onClick={clearCompleted} 
                  className="clear-completed-btn"
                >
                  Clear Completed
                </button>
              )}
            </div>
            <SortableContext
              items={filteredTodos} // Pass the filtered list here
              strategy={verticalListSortingStrategy}
            >
              <TodoList
                todos={filteredTodos} // And here
                toggleComplete={toggleComplete}
                deleteTodo={deleteTodo}
                updateTodoText={updateTodoText}
              />
            </SortableContext>
          </div>
        </DndContext>
      </main>
    </div>
  );
}

export default App;