import { Component, signal, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task',
  imports: [FormsModule],
  templateUrl: './task.html',
  styleUrl: './task.css'
})
export class TaskComponent {
  // ========== STATE ==========
  tasks = signal([
    { id: 1, text: 'Learn Angular', done: false, category: 'Learning', dueDate: '2026-12-31' },
    { id: 2, text: 'Build a project', done: false, category: 'Work', dueDate: '2026-10-15' },
    { id: 3, text: 'Show it to friends', done: false, category: 'Personal', dueDate: '2026-09-01' }
  ]);

  newTaskText = signal('');
  newCategory = signal('Work');
  newDueDate = signal('');
  searchText = signal('');
  filterCategory = signal('All');
  darkMode = signal(false);
  editingTaskId = signal<number | null>(null);

  // ========== CATEGORIES ==========
  categories = signal(['Work', 'Personal', 'Learning', 'Shopping']);

  // ========== COMPUTED VALUES ==========
  filteredTasks = computed(() => {
    let tasks = this.tasks();
    
    // Search filter
    const search = this.searchText().toLowerCase();
    if (search) {
      tasks = tasks.filter(t => t.text.toLowerCase().includes(search));
    }
    
    // Category filter
    const category = this.filterCategory();
    if (category !== 'All') {
      tasks = tasks.filter(t => t.category === category);
    }
    
    return tasks;
  });

  get pendingCount() {
    return this.tasks().filter(t => !t.done).length;
  }

  get totalCount() {
    return this.tasks().length;
  }

  get completionPercentage() {
    if (this.totalCount === 0) return 0;
    const done = this.tasks().filter(t => t.done).length;
    return Math.round((done / this.totalCount) * 100);
  }

  get today() {
  return new Date().toISOString().split('T')[0];
}

  get overdueTasks() {
    const today = new Date().toISOString().split('T')[0];
    return this.tasks().filter(t => !t.done && t.dueDate && t.dueDate < today).length;
  }

  // ========== CRUD OPERATIONS ==========
  addTask() {
    const text = this.newTaskText().trim();
    if (text) {
      const newId = this.tasks().length > 0 
        ? Math.max(...this.tasks().map(t => t.id)) + 1 
        : 1;
      this.tasks.update(t => [...t, { 
        id: newId, 
        text, 
        done: false, 
        category: this.newCategory(),
        dueDate: this.newDueDate() || ''
      }]);
      this.newTaskText.set('');
      this.newDueDate.set('');
    }
  }

  toggleTask(id: number) {
    this.tasks.update(t => 
      t.map(task => 
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  deleteTask(id: number) {
    this.tasks.update(t => t.filter(task => task.id !== id));
  }

  clearCompleted() {
    this.tasks.update(t => t.filter(task => !task.done));
  }

  clearAll() {
    if (this.tasks().length === 0) return;
    if (confirm('Delete ALL tasks? This cannot be undone!')) {
      this.tasks.set([]);
    }
  }

  // ========== EDIT TASK ==========
  startEditing(id: number) {
    this.editingTaskId.set(id);
  }

  updateTask(id: number, newText: string) {
    this.tasks.update(t => 
      t.map(task => 
        task.id === id ? { ...task, text: newText.trim() || task.text } : task
      )
    );
    this.editingTaskId.set(null);
  }

  // ========== LOCAL STORAGE ==========
  constructor() {
    // Load from localStorage
    const saved = localStorage.getItem('tasks');
    if (saved) {
      this.tasks.set(JSON.parse(saved));
    }
    
    const dark = localStorage.getItem('darkMode');
    if (dark) {
      this.darkMode.set(JSON.parse(dark));
    }
    
    // Save on changes
    effect(() => {
      localStorage.setItem('tasks', JSON.stringify(this.tasks()));
    });
    
    effect(() => {
      localStorage.setItem('darkMode', JSON.stringify(this.darkMode()));
    });
  }

  // ========== DARK MODE ==========
  toggleDarkMode() {
    this.darkMode.update(d => !d);
  }

  // ========== CATEGORY MANAGEMENT ==========
  addCategory(category: string) {
    const trimmed = category.trim();
    if (trimmed && !this.categories().includes(trimmed)) {
      this.categories.update(c => [...c, trimmed]);
      this.newCategory.set(trimmed);
    }
  }
}