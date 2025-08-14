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
      { id: 1, text: 'Learn React', completed: false, dueDate: '' },
      { id: 2, text: 'Build a to-do app', completed: false, dueDate: '' },
      { id: 3, text: 'Deploy to Netlify', completed: false, dueDate: '' },
    ];
  });

  // State to manage the current filter and sort order
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('none');
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }
    if (filter === 'completed') {
      return todo.completed;
    }
    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return sortBy === 'dueDateAsc' ? 1 : -1;
    if (!b.dueDate) return sortBy === 'dueDateAsc' ? -1 : 1;

    if (sortBy === 'dueDateAsc') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'dueDateDesc') {
      return new Date(b.dueDate) - new Date(a.dueDate);
    }
    return 0;
  });

  // Save todos to localStorage whenever the todos state changes
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text, dueDate) => {
    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false,
      dueDate: dueDate,
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

  const toggleComplete = (id) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
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

  const hasCompletedTodos = todos.some(todo => todo.completed);

  const updateTodoDueDate = (id, newDueDate) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, dueDate: newDueDate } : todo
      )
    );
  };

  // Function to toggle the sorting state
  const toggleSortByDate = () => {
    if (sortBy === 'none') {
      setSortBy('dueDateAsc');
    } else if (sortBy === 'dueDateAsc') {
      setSortBy('dueDateDesc');
    } else {
      setSortBy('none');
    }
  };

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
              <button
                onClick={toggleSortByDate}
                className={sortBy !== 'none' ? 'active-filter sort-by-date-btn' : 'sort-by-date-btn'}
              >
                Sort by Date {sortBy === 'dueDateAsc' ? '▲' : (sortBy === 'dueDateDesc' ? '▼' : '')}
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
              items={sortedTodos}
              strategy={verticalListSortingStrategy}
            >
              <TodoList
                todos={sortedTodos}
                toggleComplete={toggleComplete}
                deleteTodo={deleteTodo}
                updateTodoText={updateTodoText}
                updateTodoDueDate={updateTodoDueDate}
              />
            </SortableContext>
          </div>
        </DndContext>
      </main>
    </div>
  );
}

export default App;