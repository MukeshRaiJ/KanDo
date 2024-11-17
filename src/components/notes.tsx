import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Tag,
  Star,
  Filter,
  StickyNote,
  Calendar,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Updated interface to handle string dates
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // Changed from Date to string
  tags?: string[];
  isPinned?: boolean;
  color?: string;
}

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (id: string, updatedNote: Partial<Note>) => void;
}

const NoteItem = ({ note, onDelete, onTogglePin, onEdit }: NoteItemProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedNote, setEditedNote] = React.useState({
    title: note.title,
    content: note.content,
    tags: note.tags || [],
  });

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: note.id,
      data: {
        type: "note",
        note,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Add safe date formatting function
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const handleSave = () => {
    onEdit(note.id, editedNote);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedNote({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
    });
    setIsEditing(false);
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin(note.id);
  };

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
        className={`mb-3 hover:shadow-xl transition-all duration-300 group border-r-4 
        border-r-amber-500 dark:border-r-amber-400 backdrop-blur-sm 
        ${
          note.isPinned
            ? "bg-amber-50/80 dark:bg-amber-900/20"
            : "bg-white/90 dark:bg-gray-800/90"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editedNote.title}
                    onChange={(e) =>
                      setEditedNote({ ...editedNote, title: e.target.value })
                    }
                    className="border-amber-200 dark:border-amber-800"
                  />
                  <Textarea
                    value={editedNote.content}
                    onChange={(e) =>
                      setEditedNote({ ...editedNote, content: e.target.value })
                    }
                    className="border-amber-200 dark:border-amber-800 min-h-[100px]"
                  />
                  <Input
                    value={editedNote.tags.join(", ")}
                    onChange={(e) =>
                      setEditedNote({
                        ...editedNote,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Tags (comma separated)"
                    className="border-amber-200 dark:border-amber-800"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      size="sm"
                    >
                      <Check className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="border-amber-200 dark:border-amber-800"
                    >
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {note.title}
                    </h3>
                    {note.isPinned && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                      >
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                    {note.content}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(note.createdAt)}
                    </span>
                    {note.tags &&
                      note.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs flex items-center gap-1 border-amber-200 dark:border-amber-800"
                        >
                          <Tag className="h-3 w-3 text-amber-500" />
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="h-4 w-4 text-amber-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit note</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePinClick}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          note.isPinned
                            ? "text-amber-500 fill-amber-500"
                            : "text-gray-400"
                        }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{note.isPinned ? "Unpin note" : "Pin note"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(note.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete note</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, "id" | "createdAt">) => void;
  onDeleteNote: (id: string) => void;
  onUpdateNote: (id: string, updatedNote: Partial<Note>) => void;
}

const NotesSection = ({
  notes,
  onAddNote,
  onDeleteNote,
  onUpdateNote,
}: NotesSectionProps) => {
  const [newNote, setNewNote] = React.useState({
    title: "",
    content: "",
    tags: [] as string[],
  });
  const [filterTag, setFilterTag] = React.useState<string | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredNotes = React.useMemo(() => {
    const sortedNotes = [...notes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    return sortedNotes.filter((note) => {
      const matchesTag =
        !filterTag || (note.tags && note.tags.includes(filterTag));
      const matchesPinned = !showPinnedOnly || note.isPinned;
      return matchesTag && matchesPinned;
    });
  }, [notes, filterTag, showPinnedOnly]);

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])));

  const handleSubmit = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      onAddNote(newNote);
      setNewNote({ title: "", content: "", tags: [] });
      setIsExpanded(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  const handleTogglePin = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      onUpdateNote(id, { isPinned: !note.isPinned });
    }
  };

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col backdrop-blur-sm bg-gray-50/50 dark:bg-gray-900/50 border-amber-200 dark:border-amber-800">
      <CardHeader className="flex-shrink-0 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600">
            Notes
          </h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-amber-200 dark:border-amber-800"
                >
                  <Filter className="h-4 w-4 text-amber-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterTag(null)}>
                  All Tags
                </DropdownMenuItem>
                {allTags.map((tag) => (
                  <DropdownMenuItem key={tag} onClick={() => setFilterTag(tag)}>
                    {tag}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`border-amber-200 dark:border-amber-800 ${
                showPinnedOnly ? "bg-amber-100 dark:bg-amber-900/20" : ""
              }`}
            >
              <Star
                className={`h-4 w-4 ${
                  showPinnedOnly
                    ? "text-amber-500 fill-amber-500"
                    : "text-amber-500"
                }`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4"
          initial={false}
          animate={{ height: isExpanded ? "auto" : "48px" }}
        >
          <div className="p-3">
            {!isExpanded ? (
              <div
                onClick={() => {
                  setIsExpanded(true);
                  setTimeout(() => inputRef.current?.focus(), 100);
                }}
                className="cursor-text text-gray-500 dark:text-gray-400"
              >
                Take a note...
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  ref={inputRef}
                  placeholder="Title"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  onKeyDown={handleKeyPress}
                  className="border-0 p-0 text-lg font-medium focus:ring-0 placeholder:text-gray-400"
                />
                <Textarea
                  placeholder="Take a note..."
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                  onKeyDown={handleKeyPress}
                  className="border-0 p-0 resize-none focus:ring-0 placeholder:text-gray-400 min-h-[100px]"
                />
                <div className="flex items-center justify-between pt-2">
                  <Input
                    placeholder="Add tags (comma separated)"
                    value={newNote.tags?.join(", ")}
                    onChange={(e) =>
                      setNewNote({
                        ...newNote,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    onKeyDown={handleKeyPress}
                    className="border-0 text-sm focus:ring-0 placeholder:text-gray-400"
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!newNote.title.trim() || !newNote.content.trim()}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-2">
          <AnimatePresence mode="sync">
            {filteredNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onDelete={onDeleteNote}
                onTogglePin={handleTogglePin}
                onEdit={onUpdateNote}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredNotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400"
          >
            <StickyNote className="h-12 w-12 mb-4 text-amber-400" />
            <p className="text-center">
              {filterTag || showPinnedOnly
                ? "No notes match your filters"
                : "Take your first note!"}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesSection;
