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
import Login from './Auth/Login';
import Register from './Auth/Register';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetch(`${API_URL}/todos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            setToken(null);
          }
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => setTodos(data))
      .catch(error => {
        console.error("Error fetching todos:", error);
        setTodos([]); 
      });
    } else {
      setIsLoggedIn(false);
      setTodos([]);
    }
  }, [token]);

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setTodos([]);
  };

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
      text: text,
      completed: false,
      dueDate: dueDate,
      priority: priority,
    };
    fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(newTodo),
    })
    .then(res => res.json())
    .then(data => updateHistory([...todos, data]))
    .catch(error => console.error("Error adding todo:", error));
  };

  const updateTodoText = (_id, newText) => {
    const updatedTodo = todos.find(todo => todo._id === _id);
    if (!updatedTodo) return;
    const newTodos = todos.map(todo =>
      todo._id === _id ? { ...updatedTodo, text: newText } : todo
    );
    fetch(`${API_URL}/todos/${_id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ ...updatedTodo, text: newText }),
    })
    .then(() => updateHistory(newTodos))
    .catch(error => console.error("Error updating todo text:", error));
  };

  const toggleComplete = (_id) => {
    const updatedTodo = todos.find(todo => todo._id === _id);
    if (!updatedTodo) return;
    const newTodos = todos.map(todo =>
      todo._id === _id ? { ...updatedTodo, completed: !updatedTodo.completed } : todo
    );
    fetch(`${API_URL}/todos/${_id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ ...updatedTodo, completed: !updatedTodo.completed }),
    })
    .then(() => updateHistory(newTodos))
    .catch(error => console.error("Error toggling completion:", error));
  };

  const updateTodoDueDate = (_id, newDueDate) => {
    const updatedTodo = todos.find(todo => todo._id === _id);
    if (!updatedTodo) return;
    const newTodos = todos.map(todo =>
      todo._id === _id ? { ...updatedTodo, dueDate: newDueDate } : todo
    );
    fetch(`${API_URL}/todos/${_id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ ...updatedTodo, dueDate: newDueDate }),
    })
    .then(() => updateHistory(newTodos))
    .catch(error => console.error("Error updating todo due date:", error));
  };

  const updateTodoPriority = (_id, newPriority) => {
    const updatedTodo = todos.find(todo => todo._id === _id);
    if (!updatedTodo) return;
    const newTodos = todos.map(todo =>
      todo._id === _id ? { ...updatedTodo, priority: newPriority } : todo
    );
    fetch(`${API_URL}/todos/${_id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ ...updatedTodo, priority: newPriority }),
    })
    .then(() => updateHistory(newTodos))
    .catch(error => console.error("Error updating todo priority:", error));
  };

  const deleteTodo = (_id) => {
    fetch(`${API_URL}/todos/${_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}` 
      },
    })
    .then(() => {
      const newTodos = todos.filter(todo => todo._id !== _id);
      updateHistory(newTodos);
    })
    .catch(error => console.error("Error deleting todo:", error));
  };

  const clearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);
    const deletePromises = completedTodos.map(todo =>
        fetch(`${API_URL}/todos/${todo._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}` 
        },
          })
    );

    Promise.all(deletePromises)
        .then(() => {
            const newTodos = todos.filter(todo => !todo.completed);
            updateHistory(newTodos);
        })
        .catch(error => console.error("Error clearing completed todos:", error));
  };

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = todos.findIndex((item) => item._id === active.id);
      const newIndex = todos.findIndex((item) => item._id === over.id);
      const newTodos = arrayMove(todos, oldIndex, newIndex);
      
      const putPromises = newTodos.map(todo =>
        fetch(`${API_URL}/todos/${todo._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(todo),
        })
      );
      
      Promise.all(putPromises)
        .then(() => updateHistory(newTodos))
        .catch(error => console.error("Error reordering todos:", error));
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const hasCompletedTodos = todos.some(todo => todo.completed);

  if (!isLoggedIn) {
      return (
          <div className="App">
              <header className="App-header">
                  <h1>To-Do List</h1>
                  <p className="subtitle">With Authentication!</p>
              </header>
              <main>
                  <div className="auth-container">
                      {showLogin ? (
                          <Login onLogin={handleLogin} onSwitch={() => setShowLogin(false)} />
                      ) : (
                          <Register onRegister={() => setShowLogin(true)} onSwitch={() => setShowLogin(true)} />
                      )}
                  </div>
              </main>
          </div>
      );
  }

  return (
      <div className="App">
          <header className="App-header">
              <h1>To-Do List for {user}</h1>
              <p className="subtitle">With User Authentication</p>
              <button onClick={handleLogout} className="logout-button">Logout</button>
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
                          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active-filter' : ''}>All</button>
                          <button onClick={() => setFilter('active')} className={filter === 'active' ? 'active-filter' : ''}>Active</button>
                          <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active-filter' : ''}>Completed</button>
                          <button onClick={() => setSortBy(sortBy === 'priority' ? 'none' : 'priority')} className={sortBy === 'priority' ? 'active-filter' : ''}>Sort by Priority</button>
                          <button onClick={() => setSortBy(sortBy === 'dueDateAsc' ? 'dueDateDesc' : 'dueDateAsc')} className={sortBy === 'dueDateAsc' || sortBy === 'dueDateDesc' ? 'active-filter' : ''}>Sort by Date {sortBy === 'dueDateAsc' ? '▲' : (sortBy === 'dueDateDesc' ? '▼' : '')}</button>
                          {hasCompletedTodos && (<button onClick={clearCompleted} className="clear-completed-btn">Clear Completed</button>)}
                          <button onClick={undo} disabled={historyIndex === 0} className="undo-btn">Undo</button>
                      </div>
                      <SortableContext items={sortedTodos} strategy={verticalListSortingStrategy}>
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