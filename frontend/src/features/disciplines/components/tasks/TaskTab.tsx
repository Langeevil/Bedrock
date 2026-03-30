import React, { useState } from "react";
import { TaskList } from "./TaskList.tsx";
import { TaskDetail } from "./TaskDetail.tsx";
import { TaskForm } from "./TaskForm.tsx";
import type { DisciplineTask } from "../../types/taskTypes.ts";
import { Plus, ChevronLeft } from "lucide-react";

interface TaskTabProps {
  discipline: {
    id: number;
    name: string;
  };
  userRole: "professor" | "student";
}

export const TaskTab: React.FC<TaskTabProps> = ({
  discipline,
  userRole,
}) => {
  const [selectedTask, setSelectedTask] = useState<DisciplineTask | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskCreated = () => {
    setShowForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Lista de Tarefas */}
      <div className={`${selectedTask ? "hidden md:block" : "flex-1"} md:flex-1 flex flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Tarefas</h2>
          {userRole === "professor" && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-sm btn-primary rounded-none"
            >
              <Plus size={18} />
              Nova
            </button>
          )}
        </div>

        <div key={refreshTrigger} className="flex-1 overflow-y-auto">
          <TaskList
            disciplineId={discipline.id}
            userRole={userRole}
            onSelectTask={setSelectedTask}
          />
        </div>
      </div>

      {/* Detalhe da Tarefa */}
      {selectedTask && (
        <div className="flex-1 flex flex-col">
          <button
            onClick={() => setSelectedTask(null)}
            className="btn btn-ghost btn-sm mb-4 w-fit md:hidden rounded-none"
          >
            <ChevronLeft size={18} />
            Voltar
          </button>

          <div className="flex-1 overflow-y-auto">
            <TaskDetail
              task={selectedTask}
              disciplineId={discipline.id}
              userRole={userRole}
            />
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <TaskForm
          disciplineId={discipline.id}
          onTaskCreated={handleTaskCreated}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};
