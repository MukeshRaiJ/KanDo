"use client";
import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  ClipboardList,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Archive,
} from "lucide-react";
import KanbanBoard from "@/components/kanban";
import NotesSection from "@/components/notes";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  color?: string;
}

interface Column {
  id: string;
  title: string;
  items: Note[];
  icon?: React.ReactNode;
}

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [archivedTasks, setArchivedTasks] = useState<Note[]>([]);

  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "To Do",
      items: [],
      icon: <ClipboardList className="w-5 h-5 text-amber-500" />,
    },
    {
      id: "inProgress",
      title: "In Progress",
      items: [],
      icon: <Clock className="w-5 h-5 text-amber-500" />,
    },
    {
      id: "done",
      title: "Done",
      items: [],
      icon: <CheckCircle className="w-5 h-5 text-amber-500" />,
    },
  ]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "note" && overData?.type === "column") {
      const note = notes.find((n) => n.id === active.id);
      if (note) {
        setNotes(notes.filter((n) => n.id !== active.id));
        setColumns(
          columns.map((col) =>
            col.id === over.id ? { ...col, items: [...col.items, note] } : col
          )
        );
      }
    } else if (activeData?.type === "task" && overData?.type === "column") {
      const sourceColumn = columns.find((col) =>
        col.items.some((item) => item.id === active.id)
      );
      if (sourceColumn && sourceColumn.id !== over.id) {
        const task = sourceColumn.items.find((item) => item.id === active.id);
        if (task) {
          setColumns(
            columns.map((col) => {
              if (col.id === sourceColumn.id) {
                return {
                  ...col,
                  items: col.items.filter((item) => item.id !== active.id),
                };
              }
              if (col.id === over.id) {
                return { ...col, items: [...col.items, task] };
              }
              return col;
            })
          );
        }
      }
    }
    setActiveId(null);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToArchive = columns
      .flatMap((col) => col.items)
      .find((item) => item.id === taskId);

    if (taskToArchive) {
      setArchivedTasks([...archivedTasks, taskToArchive]);
      setColumns(
        columns.map((column) => ({
          ...column,
          items: column.items.filter((item) => item.id !== taskId),
        }))
      );
    }
  };

  const filteredColumns = columns.map((column) => ({
    ...column,
    items: column.items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority =
        !filterPriority || item.priority === filterPriority;
      return matchesSearch && matchesPriority;
    }),
  }));

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-6">
        <div className="max-w-[1600px] mx-auto">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600">
                ✨ KanDo
              </h1>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full hover:shadow-lg transition-all duration-300"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-amber-500" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 border-amber-200 dark:border-amber-800 focus:ring-amber-500"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4 text-amber-500" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterPriority(null)}>
                    All Priorities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("high")}>
                    High Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("medium")}>
                    Medium Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("low")}>
                    Low Priority
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  // Show archived tasks modal or panel
                }}
              >
                <Archive className="h-4 w-4 text-amber-500" />
                Archive ({archivedTasks.length})
              </Button>
            </div>
          </motion.header>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <KanbanBoard
                  columns={filteredColumns}
                  onDeleteTask={handleDeleteTask}
                />
              </motion.div>
              <NotesSection
                notes={notes}
                onAddNote={(note) => {
                  const newNote = {
                    ...note,
                    id: `note-${Date.now()}`,
                    createdAt: new Date(),
                  };
                  setNotes([...notes, newNote]);
                }}
                onDeleteNote={(id) =>
                  setNotes(notes.filter((n) => n.id !== id))
                }
              />
            </div>

            <DragOverlay>
              {activeId && (
                <motion.div
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1.1 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-l-amber-500"
                >
                  {notes.find((note) => note.id === activeId)?.title ||
                    columns
                      .flatMap((col) => col.items)
                      .find((item) => item.id === activeId)?.title}
                </motion.div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
