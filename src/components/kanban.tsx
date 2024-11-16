import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CSS } from "@dnd-kit/utilities";
import {
  Trash2,
  Flag,
  Clock,
  Tag,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Task {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
  tags?: string[];
  status?: "blocked" | "in-review" | "completed";
}

interface Column {
  id: string;
  title: string;
  items: Task[];
  icon?: React.ReactNode;
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "high":
      return "text-red-500 bg-red-100 dark:bg-red-900/20";
    case "medium":
      return "text-amber-500 bg-amber-100 dark:bg-amber-900/20";
    case "low":
      return "text-green-500 bg-green-100 dark:bg-green-900/20";
    default:
      return "text-gray-500 bg-gray-100 dark:bg-gray-800";
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "blocked":
      return "text-red-500 bg-red-100 dark:bg-red-900/20";
    case "in-review":
      return "text-blue-500 bg-blue-100 dark:bg-blue-900/20";
    case "completed":
      return "text-green-500 bg-green-100 dark:bg-green-900/20";
    default:
      return "";
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case "blocked":
      return <AlertCircle className="h-3 w-3" />;
    case "in-review":
      return <Clock className="h-3 w-3" />;
    case "completed":
      return <CheckCircle className="h-3 w-3" />;
    default:
      return null;
  }
};

interface KanbanItemProps {
  task: Task;
  onDelete: (taskId: string) => void;
}

const KanbanItem = ({ task, onDelete }: KanbanItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id,
      data: {
        type: "task",
        task,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card
        className={`mb-3 hover:shadow-xl transition-all duration-300 border-l-4 
        ${
          task.priority === "high"
            ? "border-l-amber-500"
            : task.priority === "medium"
            ? "border-l-amber-400"
            : "border-l-amber-300"
        } group backdrop-blur-sm bg-white/90 dark:bg-gray-800/90`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">
                {task.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {task.content}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2 h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Archive task</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 items-center">
            {task.priority && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className={`text-xs flex items-center gap-1 ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      <Flag className="h-3 w-3" />
                      {task.priority}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Task priority</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {task.dueDate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className={`text-xs flex items-center gap-1 ${
                        isOverdue
                          ? "bg-red-100 text-red-500 dark:bg-red-900/20"
                          : "bg-amber-100 text-amber-500 dark:bg-amber-900/20"
                      }`}
                    >
                      <Calendar className="h-3 w-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isOverdue ? "Overdue" : "Due date"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {task.status && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className={`text-xs flex items-center gap-1 ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {getStatusIcon(task.status)}
                      {task.status.replace("-", " ")}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Task status</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {task.tags.map((tag, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="text-xs flex items-center gap-1 border-amber-200 dark:border-amber-800"
                        >
                          <Tag className="h-3 w-3 text-amber-500" />
                          {tag}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tag</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface KanbanColumnProps {
  column: Column;
  onDeleteTask: (taskId: string) => void;
}

const KanbanColumn = ({ column, onDeleteTask }: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  return (
    <Card className="bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm border border-amber-200 dark:border-amber-800 flex flex-col h-full">
      <CardHeader className="p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {column.icon}
            <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              {column.title}
            </h2>
          </div>
          <Badge
            variant="secondary"
            className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
          >
            {column.items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent
        ref={setNodeRef}
        className="p-4 flex-grow overflow-y-auto transition-colors duration-300 
          hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
      >
        <SortableContext items={column.items.map((item) => item.id)}>
          <AnimatePresence>
            {column.items.map((task) => (
              <KanbanItem key={task.id} task={task} onDelete={onDeleteTask} />
            ))}
          </AnimatePresence>
        </SortableContext>
        {column.items.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-lg p-4"
            >
              <p>Drop tasks here</p>
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface KanbanBoardProps {
  columns: Column[];
  onDeleteTask: (taskId: string) => void;
}

const KanbanBoard = ({ columns, onDeleteTask }: KanbanBoardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
