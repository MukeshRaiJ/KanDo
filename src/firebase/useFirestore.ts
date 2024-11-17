import { useState, useEffect } from "react";
import { Note } from "@/types/note";
import { auth } from "@/lib/firebase/config";
import { noteServices } from "@/lib/firebase/notes";
import { onSnapshot, query, where, orderBy } from "firebase/firestore";
import { notesCollection } from "@/lib/firebase/notes";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const q = query(
      notesCollection,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Note[];

        setNotes(notesList);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Error fetching notes:", error);
        setError("Failed to fetch notes");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addNote = async (title: string, content: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      await noteServices.createNote(user.uid, title, content);
    } catch (error) {
      setError("Failed to add note");
      throw error;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await noteServices.deleteNote(noteId);
    } catch (error) {
      setError("Failed to delete note");
      throw error;
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      await noteServices.updateNote(noteId, updates);
    } catch (error) {
      setError("Failed to update note");
      throw error;
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    deleteNote,
    updateNote,
  };
}
