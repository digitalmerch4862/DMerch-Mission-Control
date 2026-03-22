'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wthkftbdepnujpbxnivk.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aGtmdGJkZXBudWpwYnhuaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzgzNzcsImV4cCI6MjA4ODcxNDM3N30.cW1bRz4gqe5DcT47bj4XjXXJ9NSIlMFzGtRAikC7Rm4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const COLUMNS = [
  { key: 'todo', title: 'To Do', color: '#3B82F6' },
  { key: 'in_progress', title: 'Doing', color: '#F59E0B' },
  { key: 'done', title: 'Done', color: '#10B981' },
];

const seedTasks = [
  { title: 'Analyze competitor content strategy', category: 'Work', priority: 'Urgent', track_status: 'At Risk', status: 'todo' },
  { title: 'Write weekly newsletter draft', category: 'Marketing', priority: 'Normal', track_status: 'On Track', status: 'todo' },
  { title: 'Set up API integration', category: 'Development', priority: 'Normal', track_status: 'On Track', status: 'in_progress' },
  { title: 'Record product demo video', category: 'Marketing', priority: 'Urgent', track_status: 'At Risk', status: 'in_progress' },
  { title: 'Update landing page copy', category: 'Work', priority: 'Someday', track_status: 'On Track', status: 'done' },
  { title: 'Research new influencer partnerships', category: 'Marketing', priority: 'Normal', track_status: 'On Track', status: 'done' },
];

const initialForm = { title: '', category: 'Work', priority: 'Normal', track_status: 'On Track', due_date: '' };

const badgeClass = {
  category: { Work: 'cat-work', Marketing: 'cat-marketing', Development: 'cat-development', Personal: 'cat-personal' },
  priority: { Urgent: 'pri-urgent', Normal: 'pri-normal', Someday: 'pri-someday' },
  track_status: { 'On Track': 'trk-on', 'At Risk': 'trk-risk', 'Off Track': 'trk-off' },
};

function motivationalText(donePct) {
  if (donePct <= 30) return "Just getting started — let's go! 🚀";
  if (donePct <= 60) return 'Good progress — keep pushing! 💪';
  if (donePct <= 90) return 'Almost there — finish strong! 🔥';
  return 'Outstanding — you crushed it! 🏆';
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [addFormColumn, setAddFormColumn] = useState('');
  const [form, setForm] = useState(initialForm);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editTask, setEditTask] = useState(null);

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const categoryMatch = categoryFilter === 'All' || task.category === categoryFilter;
    const priorityMatch = priorityFilter === 'All' || task.priority === priorityFilter;
    return categoryMatch && priorityMatch;
  }), [tasks, categoryFilter, priorityFilter]);

  const stats = useMemo(() => {
    const total = filteredTasks.length || 1;
    const todo = filteredTasks.filter((t) => t.status === 'todo').length;
    const inProgress = filteredTasks.filter((t) => t.status === 'in_progress').length;
    const done = filteredTasks.filter((t) => t.status === 'done').length;
    const donePct = Math.round((done / total) * 100);
    return { todo, inProgress, done, total: filteredTasks.length, donePct };
  }, [filteredTasks]);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    setLoading(true);
    const { data: existing } = await supabase.from('todos').select('title');
    const existingTitles = new Set((existing || []).map((item) => item.title));
    const missing = seedTasks
      .filter((task) => !existingTitles.has(task.title))
      .map((task) => ({ ...task, completed: task.status === 'done' }));

    if (missing.length) {
      await supabase.from('todos').insert(missing);
    }
    await fetchTasks();
  }

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('todos')
      .select('id,title,category,priority,due_date,completed,status,track_status,created_at')
      .order('created_at', { ascending: true });

    if (!error) setTasks(data || []);
    setLoading(false);
  }

  async function updateTask(taskId, updates) {
    const optimistic = tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task));
    setTasks(optimistic);
    const { error } = await supabase.from('todos').update(updates).eq('id', taskId);
    if (error) fetchTasks();
  }

  async function createTask(status) {
    if (!form.title.trim()) return;
    const payload = { ...form, status, completed: status === 'done' };
    const { data, error } = await supabase
      .from('todos')
      .insert([payload])
      .select('id,title,category,priority,due_date,completed,status,track_status,created_at')
      .single();

    if (!error && data) setTasks((prev) => [...prev, data]);
    setAddFormColumn('');
    setForm(initialForm);
  }

  async function deleteTask(taskId) {
    const old = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const { error } = await supabase.from('todos').delete().eq('id', taskId);
    if (error) setTasks(old);
  }

  async function saveEdit() {
    if (!editTask) return;
    await updateTask(editTask.id, {
      title: editTask.title,
      category: editTask.category,
      priority: editTask.priority,
      track_status: editTask.track_status,
      due_date: editTask.due_date || null,
      completed: editTask.status === 'done',
      status: editTask.status,
    });
    setEditTask(null);
  }

  const chartData = {
    labels: ['To Do', 'Doing', 'Done'],
    datasets: [{
      data: [stats.todo, stats.inProgress, stats.done],
      backgroundColor: ['#3B82F6', '#F59E0B', '#10B981'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  return (
    <main className="tasks-page" onClick={() => setMenuOpen(null)}>
      <div className="tasks-tab">Tasks</div>

      <section className="overview-bar">
        <div className="donut-wrap"><Doughnut data={chartData} options={{ cutout: '72%', plugins: { legend: { display: false } } }} /></div>
        <div className="stats-wrap">
          <StatCard label="To Do" count={stats.todo} pct={stats.total ? Math.round((stats.todo / stats.total) * 100) : 0} color="todo" />
          <StatCard label="Doing" count={stats.inProgress} pct={stats.total ? Math.round((stats.inProgress / stats.total) * 100) : 0} color="doing" />
          <StatCard label="Done" count={stats.done} pct={stats.total ? Math.round((stats.done / stats.total) * 100) : 0} color="done" />
        </div>
        <div className="motivation-pill">{motivationalText(stats.donePct)}</div>
      </section>

      <section className="filter-bar">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option>All</option><option>Work</option><option>Marketing</option><option>Development</option><option>Personal</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option>All</option><option>Urgent</option><option>Normal</option><option>Someday</option>
        </select>
      </section>

      <section className="kanban-grid">
        {COLUMNS.map((column) => {
          const list = filteredTasks.filter((task) => task.status === column.key);
          return (
            <div
              key={column.key}
              className={`column ${dragOver === column.key ? 'column-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(column.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={async () => {
                if (!draggingId) return;
                setDragOver(null);
                const movedTask = tasks.find((task) => task.id === draggingId);
                if (!movedTask || movedTask.status === column.key) return;
                setDraggingId(null);
                await updateTask(movedTask.id, { status: column.key, completed: column.key === 'done' });
              }}
            >
              <header className="column-header">
                <h3>{column.title}</h3>
                <span>{list.length}</span>
              </header>

              <div className="card-stack">
                {list.map((task) => (
                  <article
                    key={task.id}
                    className={`task-card ${draggingId === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => setDraggingId(task.id)}
                    onDragEnd={() => { setDraggingId(null); setDragOver(null); }}
                  >
                    <div className="task-title-row">
                      <span className="check-circle" />
                      <strong>{task.title}</strong>
                      <div className="menu-wrap" onClick={(e) => e.stopPropagation()}>
                        <button className="menu-btn" onClick={() => setMenuOpen(menuOpen === task.id ? null : task.id)}>⋯</button>
                        {menuOpen === task.id && (
                          <div className="menu">
                            <button onClick={() => { setEditTask({ ...task, due_date: task.due_date || '' }); setMenuOpen(null); }}>Edit</button>
                            <button onClick={() => deleteTask(task.id)}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="badge-row">
                      <span className={`pill ${badgeClass.category[task.category]}`}>{task.category}</span>
                      <span className={`pill ${badgeClass.priority[task.priority]}`}>{task.priority}</span>
                      <span className={`pill ${badgeClass.track_status[task.track_status]}`}>{task.track_status}</span>
                    </div>
                    <small className="due">Due: {task.due_date || 'No date'}</small>
                  </article>
                ))}
              </div>

              <div className="add-zone">
                {addFormColumn === column.key ? (
                  <div className="inline-form">
                    <input placeholder="Task title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                      <option>Work</option><option>Marketing</option><option>Development</option><option>Personal</option>
                    </select>
                    <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                      <option>Urgent</option><option>Normal</option><option>Someday</option>
                    </select>
                    <select value={form.track_status} onChange={(e) => setForm((f) => ({ ...f, track_status: e.target.value }))}>
                      <option>On Track</option><option>At Risk</option><option>Off Track</option>
                    </select>
                    <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
                    <div className="form-actions">
                      <button onClick={() => createTask(column.key)}>Save</button>
                      <button onClick={() => { setAddFormColumn(''); setForm(initialForm); }} className="ghost">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="add-task" onClick={() => setAddFormColumn(column.key)}>+ Add Task</button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {editTask && (
        <div className="modal-backdrop" onClick={() => setEditTask(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Task</h3>
            <input value={editTask.title} onChange={(e) => setEditTask((t) => ({ ...t, title: e.target.value }))} />
            <select value={editTask.category} onChange={(e) => setEditTask((t) => ({ ...t, category: e.target.value }))}><option>Work</option><option>Marketing</option><option>Development</option><option>Personal</option></select>
            <select value={editTask.priority} onChange={(e) => setEditTask((t) => ({ ...t, priority: e.target.value }))}><option>Urgent</option><option>Normal</option><option>Someday</option></select>
            <select value={editTask.track_status} onChange={(e) => setEditTask((t) => ({ ...t, track_status: e.target.value }))}><option>On Track</option><option>At Risk</option><option>Off Track</option></select>
            <select value={editTask.status} onChange={(e) => setEditTask((t) => ({ ...t, status: e.target.value }))}><option value="todo">To Do</option><option value="in_progress">Doing</option><option value="done">Done</option></select>
            <input type="date" value={editTask.due_date || ''} onChange={(e) => setEditTask((t) => ({ ...t, due_date: e.target.value }))} />
            <div className="form-actions">
              <button onClick={saveEdit}>Save</button>
              <button className="ghost" onClick={() => setEditTask(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="loading">Loading tasks…</div>}
    </main>
  );
}

function StatCard({ label, count, pct, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <p>{label}</p>
      <strong>{count}</strong>
      <small>{pct}%</small>
    </div>
  );
}
