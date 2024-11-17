"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  LogOut,
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
import { useAuth } from "@/firebase/useAuth";
import { FirebaseService, type Task } from "@/firebase/firebaseService";
import { useToast } from "@/components/ui/use-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";

// Interfaces
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
  userId: string;
}

interface Column {
  id: string;
  title: string;
  items: Task[];
  icon: React.ReactNode;
}

export default function KanbanWorkspace() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Handle authentication and mounting
  useEffect(() => {
    setMounted(true);

    // Redirect to auth page if not authenticated
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Subscribe to Firebase data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribeTasks = FirebaseService.subscribeToTasks(
        user.uid,
        (tasks) => {
          const todoTasks = tasks.filter((task) => task.columnId === "todo");
          const inProgressTasks = tasks.filter(
            (task) => task.columnId === "inProgress"
          );
          const doneTasks = tasks.filter((task) => task.columnId === "done");

          setColumns((prevColumns) => [
            { ...prevColumns[0], items: todoTasks },
            { ...prevColumns[1], items: inProgressTasks },
            { ...prevColumns[2], items: doneTasks },
          ]);
          setLoading(false);
        }
      );

      const unsubscribeNotes = FirebaseService.subscribeToNotes(
        user.uid,
        (notes) => {
          setNotes(notes as Note[]);
        }
      );

      return () => {
        unsubscribeTasks();
        unsubscribeNotes();
      };
    } catch (error) {
      console.error("Error subscribing to data:", error);
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [user, toast]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !user) return;

    try {
      const activeData = active.data.current;
      const overData = over.data.current;

      if (activeData?.type === "note" && overData?.type === "column") {
        const note = notes.find((n) => n.id === active.id);
        if (note) {
          await FirebaseService.addTask({
            title: note.title,
            content: note.content,
            tags: note.tags,
            columnId: over.id as string,
            userId: user.uid,
            createdAt: new Date().toISOString(),
          });
          await FirebaseService.deleteNote(note.id);
          toast({
            title: "Success",
            description: "Note converted to task successfully",
          });
        }
      } else if (activeData?.type === "task" && overData?.type === "column") {
        const sourceColumn = columns.find((col) =>
          col.items.some((item) => item.id === active.id)
        );
        if (sourceColumn && sourceColumn.id !== over.id) {
          await FirebaseService.updateTask(active.id as string, {
            columnId: over.id as string,
          });
          toast({
            title: "Success",
            description: "Task moved successfully",
          });
        }
      }
    } catch (error) {
      console.error("Error handling drag end:", error);
      toast({
        title: "Error",
        description: "Failed to move item. Please try again.",
        variant: "destructive",
      });
    }
    setActiveId(null);
  };

  const handleAddNote = async (
    note: Omit<Note, "id" | "createdAt" | "userId">
  ) => {
    if (!user) return;

    try {
      await FirebaseService.addNote({
        ...note,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const taskToArchive = columns
        .flatMap((col) => col.items)
        .find((item) => item.id === taskId);

      if (taskToArchive) {
        setArchivedTasks([...archivedTasks, taskToArchive]);
        await FirebaseService.deleteTask(taskId);
        toast({
          title: "Success",
          description: "Task archived successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to archive task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = async (
    taskId: string,
    updatedFields: Partial<Task>
  ) => {
    if (!user) return;

    try {
      await FirebaseService.updateTask(taskId, updatedFields);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!user) return;

    try {
      await FirebaseService.deleteNote(id);
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateNote = async (id: string, updatedFields: Partial<Note>) => {
    if (!user) return;

    try {
      await FirebaseService.updateNote(id, updatedFields);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      });
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

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Loading your workspace...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

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
                  placeholder="Search tasks and notes..."
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

              <Button
                variant="outline"
                className="gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 text-amber-500" />
                Sign Out
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
                  onEditTask={handleEditTask}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <NotesSection
                  notes={filteredNotes}
                  onAddNote={handleAddNote}
                  onDeleteNote={handleDeleteNote}
                  onUpdateNote={handleUpdateNote}
                />
              </motion.div>
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
