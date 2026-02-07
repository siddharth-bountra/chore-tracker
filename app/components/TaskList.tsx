"use client";

import { useState } from "react";
import type { TaskItem } from "../types";
import { toggleTask } from "../lib/api";

const CHECKBOX_SIZE = 28;

interface TaskListProps {
  date: string;
  initialTasks: TaskItem[];
  readOnly?: boolean;
}

export function TaskList({ date, initialTasks, readOnly = false }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

  function handleToggle(task: TaskItem) {
    if (readOnly) return;
    const newCompleted = !task.completed;
    setTasks((prev) =>
      prev.map((t) =>
        t.taskId === task.taskId
          ? {
              ...t,
              completed: newCompleted,
              timestamp: newCompleted ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
    toggleTask(date, task.taskId, newCompleted).catch(() => {
      // Keep optimistic state; only user click should change the checkbox
    });
  }

  if (tasks.length === 0) {
    return (
      <p style={{ fontSize: "1.25rem", color: "#666", marginTop: "1rem" }}>
        No tasks for this day.
      </p>
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <>
      <p style={countStyle}>
        {completedCount}/{tasks.length} tasks completed
      </p>
      <ul style={listStyle}>
      {tasks.map((task) => (
        <li key={task.taskId} style={itemStyle}>
          {readOnly ? (
            <span
              style={readOnlyIndicatorStyle(task.completed)}
              aria-hidden
            >
              {task.completed ? "✓" : ""}
            </span>
          ) : (
            <button
              type="button"
              role="checkbox"
              aria-checked={task.completed}
              onClick={() => handleToggle(task)}
              style={checkboxStyle(task.completed)}
            >
              {task.completed ? "✓" : ""}
            </button>
          )}
          <span
            style={{
              ...labelStyle,
              ...(task.completed ? { textDecoration: "line-through", color: "#666" } : {}),
            }}
          >
            {task.text}
          </span>
        </li>
      ))}
    </ul>
    </>
  );
}

const countStyle: React.CSSProperties = {
  textAlign: "right",
  fontSize: "1rem",
  color: "#555",
  margin: "0 0 16px",
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
};

const itemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 20,
};

function checkboxStyle(checked: boolean): React.CSSProperties {
  return {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    minWidth: CHECKBOX_SIZE,
    minHeight: CHECKBOX_SIZE,
    borderRadius: 6,
    border: "2px solid #333",
    background: checked ? "#1a1a1a" : "#fff",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  };
}

function readOnlyIndicatorStyle(checked: boolean): React.CSSProperties {
  return {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    minWidth: CHECKBOX_SIZE,
    minHeight: CHECKBOX_SIZE,
    borderRadius: 6,
    border: "2px solid #ccc",
    background: checked ? "#e0e0e0" : "#fff",
    color: "#666",
    fontSize: 18,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    cursor: "default",
  };
}

const labelStyle: React.CSSProperties = {
  fontSize: "1.35rem",
  lineHeight: 1.4,
  flex: 1,
};
