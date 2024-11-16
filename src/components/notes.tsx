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
  Search,
  Filter,
  StickyNote,
  Calendar,
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

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
}

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const NoteItem = ({ note, onDelete, onTogglePin }: NoteItemProps) => {
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
                  {note.createdAt.toLocaleDateString()}
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
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onTogglePin(note.id)}
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
}

const NotesSection = ({
  notes,
  onAddNote,
  onDeleteNote,
}: NotesSectionProps) => {
  const [newNote, setNewNote] = React.useState({
    title: "",
    content: "",
    tags: [] as string[],
  });
  const [isFormVisible, setIsFormVisible] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterTag, setFilterTag] = React.useState<string | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.title.trim() && newNote.content.trim()) {
      onAddNote(newNote);
      setNewNote({ title: "", content: "", tags: [] });
      setIsFormVisible(false);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag =
      !filterTag || (note.tags && note.tags.includes(filterTag));
    const matchesPinned = !showPinnedOnly || note.isPinned;
    return matchesSearch && matchesTag && matchesPinned;
  });

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])));

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col backdrop-blur-sm bg-gray-50/50 dark:bg-gray-900/50 border-amber-200 dark:border-amber-800">
      <CardHeader className="flex-shrink-0 border-b border-amber-200 dark:border-amber-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600">
              Notes
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-800"
            >
              <Plus className="h-4 w-4 text-amber-500" />
              Add Note
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-amber-200 dark:border-amber-800 focus:ring-amber-500"
              />
            </div>
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
        <AnimatePresence mode="wait">
          {isFormVisible && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 mb-6 bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow-sm"
            >
              <div className="space-y-2">
                <Input
                  placeholder="Note Title"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  className="border-amber-200 dark:border-amber-800 focus:ring-amber-500"
                />
                <Textarea
                  placeholder="Note Content"
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                  className="min-h-[100px] border-amber-200 dark:border-amber-800 focus:ring-amber-500"
                />
                <Input
                  placeholder="Tags (comma separated)"
                  onChange={(e) =>
                    setNewNote({
                      ...newNote,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  className="border-amber-200 dark:border-amber-800 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Save Note
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormVisible(false);
                    setNewNote({ title: "", content: "", tags: [] });
                  }}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 border-amber-200 dark:border-amber-800"
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <AnimatePresence mode="sync">
            {filteredNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onDelete={onDeleteNote}
                onTogglePin={(id) => {
                  // Handle pin toggle logic here
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredNotes.length === 0 && !isFormVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400"
          >
            <StickyNote className="h-12 w-12 mb-4 text-amber-400" />
            <p className="text-center">
              {searchTerm || filterTag || showPinnedOnly
                ? "No notes match your filters"
                : 'No notes yet. Click "Add Note" to create one!'}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesSection;
