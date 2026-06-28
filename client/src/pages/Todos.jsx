import { useEffect, useMemo, useState } from "react";
import { useTodos } from "../hooks/useTodos.js";
import { Loader, EmptyState } from "../components/UI.jsx";
import { Modal } from "../components/Modal.jsx";
import { TodoForm } from "../components/TodoForm.jsx";
import { todayKey, formatDate } from "../utils/date.js";

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const FILTERS = ["all", "pending", "completed", "overdue"];

// Is this todo overdue? (has a due date in the past and isn't done)
const isOverdue = (todo) =>
  !todo.completed && todo.dueDate && todo.dueDate.slice(0, 10) < todayKey();

export default function Todos() {
  const { todos, loading, loadTodos, addTodo, editTodo, toggleTodo, removeTodo } = useTodos();

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate"); // "dueDate" | "priority"
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // todo being edited, or null
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Filtering + sorting are derived view state, so they're computed with
  // useMemo from the global list rather than stored separately.
  const visible = useMemo(() => {
    let list = todos.filter((t) => {
      if (filter === "pending") return !t.completed;
      if (filter === "completed") return t.completed;
      if (filter === "overdue") return isOverdue(t);
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "priority") {
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      }
      // dueDate: items with a due date first (soonest), undated last
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
    return list;
  }, [todos, filter, sortBy]);

  const counts = useMemo(
    () => ({
      all: todos.length,
      pending: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
      overdue: todos.filter(isOverdue).length,
    }),
    [todos]
  );

  const handleSubmit = async (data) => {
    if (editing) await editTodo(editing._id, data);
    else await addTodo(data);
    setFormOpen(false);
    setEditing(null);
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (todo) => { setEditing(todo); setFormOpen(true); };

  if (loading) return <Loader />;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Todos</h1>
          <p className="page-subtitle">One-off tasks, sorted by what matters.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add todo</button>
      </div>

      {/* Filters + sort */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-tab${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f[0].toUpperCase() + f.slice(1)} <span className="filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <select className="select" style={{ width: "auto" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="dueDate">Sort by due date</option>
          <option value="priority">Sort by priority</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Nothing here"
          message={filter === "all" ? "Add your first todo to get started." : `No ${filter} todos.`}
          action={filter === "all" ? <button className="btn btn-primary" onClick={openCreate}>Add a todo</button> : null}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((todo) => (
            <div key={todo._id} className={`todo-item${todo.completed ? " completed" : ""}`}>
              <button
                className="todo-check"
                aria-label={todo.completed ? "Mark as pending" : "Mark as complete"}
                onClick={() => toggleTodo(todo)}
              >
                {todo.completed ? "✓" : ""}
              </button>

              <div className="todo-body">
                <div className="todo-title">{todo.title}</div>
                {todo.description && <div className="desc">{todo.description}</div>}
                <div className="todo-meta">
                  <span className={`badge priority-${todo.priority}`}>{todo.priority}</span>
                  {todo.dueDate && (
                    <span className={`badge${isOverdue(todo) ? " priority-high" : ""}`}>
                      {isOverdue(todo) ? "Overdue · " : "Due "}{formatDate(todo.dueDate.slice(0, 10))}
                    </span>
                  )}
                </div>
              </div>

              <div className="todo-actions">
                <button className="btn btn-ghost" onClick={() => openEdit(todo)}>Edit</button>
                <button className="btn btn-danger" onClick={() => setToDelete(todo)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit modal */}
      {formOpen && (
        <div className="modal-backdrop" onClick={() => { setFormOpen(false); setEditing(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>{editing ? "Edit todo" : "New todo"}</h3>
            <TodoForm
              initial={editing || {}}
              onSubmit={handleSubmit}
              onCancel={() => { setFormOpen(false); setEditing(null); }}
              submitLabel={editing ? "Save changes" : "Add todo"}
            />
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <Modal
        open={!!toDelete}
        title="Delete todo?"
        confirmLabel="Delete"
        confirmDanger
        onClose={() => setToDelete(null)}
        onConfirm={async () => { await removeTodo(toDelete._id); setToDelete(null); }}
      >
        <p>Permanently delete "{toDelete?.title}"?</p>
      </Modal>
    </main>
  );
}
