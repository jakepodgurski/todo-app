import React, { useState } from 'react';
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

import useLocalStorage from './hooks/useLocalStorage';
import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import './App.css';

function App() {

  const initialTodos = [
    { id: 1, text: 'Learn React', completed: false, dueDate: '', priority: 'Medium' },
    { id: 2, text: 'Build a to-do app', completed: false, dueDate: '', priority: 'High' },
    { id: 3, text: 'Deploy to Netlify', completed: false, dueDate: '', priority: 'Low' },
  ];

  const [todos, setTodos] = useLocalStorage('todos', initialTodos);

  const [history, setHistory] = useState([todos]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateHistory = (newTodos) => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newTodos]);
    setHistoryIndex(newHistory.length);
    setTodos(newTodos);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTodos(history[historyIndex - 1]);
    }
  };

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
    // New sorting logic for priority
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1, '': 0 };

    if (sortBy === 'priority') {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortBy === 'dueDateAsc') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'dueDateDesc') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return -1;
      if (!b.dueDate) return 1;
      return new Date(b.dueDate) - new Date(a.dueDate);
    }
    return 0;
  });

  const addTodo = (text, dueDate, priority) => {
    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false,
      dueDate: dueDate,
      priority: priority,
    };
    updateHistory([...todos, newTodo]);
  };

  const updateTodoText = (id, newText) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    );
    updateHistory(newTodos);
  };

  const toggleComplete = (id) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    updateHistory(newTodos);
  };

  const updateTodoDueDate = (id, newDueDate) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, dueDate: newDueDate } : todo
    );
    updateHistory(newTodos);
  };

  const updateTodoPriority = (id, newPriority) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, priority: newPriority } : todo
    );
    updateHistory(newTodos);
  };

  const deleteTodo = (id) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    updateHistory(newTodos);
  };
  
  const clearCompleted = () => {
    const newTodos = todos.filter(todo => !todo.completed);
    updateHistory(newTodos);
  };

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = todos.findIndex((item) => item.id === active.id);
      const newIndex = todos.findIndex((item) => item.id === over.id);
      const newTodos = arrayMove(todos, oldIndex, newIndex);
      updateHistory(newTodos);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
              <button
                onClick={() => setSortBy(sortBy === 'priority' ? 'none' : 'priority')}
                className={sortBy === 'priority' ? 'active-filter' : ''}
              >
                Sort by Priority
              </button>
              <button
                onClick={() => setSortBy(sortBy === 'dueDateAsc' ? 'dueDateDesc' : 'dueDateAsc')}
                className={sortBy === 'dueDateAsc' || sortBy === 'dueDateDesc' ? 'active-filter' : ''}
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
              <button 
                onClick={undo} 
                disabled={historyIndex === 0} 
                className="undo-btn"
              >
                Undo
              </button>
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
                updateTodoPriority={updateTodoPriority}
              />
            </SortableContext>
          </div>
        </DndContext>
      </main>
    </div>
  );
}

export default App;