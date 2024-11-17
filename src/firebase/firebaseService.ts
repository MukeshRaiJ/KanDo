import { db } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export interface Task {
  id: string;
  title: string;
  content: string;
  columnId: string;
  userId: string;
  createdAt: string;
  priority?: "low" | "medium" | "high";
  status?: "blocked" | "in-review" | "completed";
  tags?: string[];
  dueDate?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  tags?: string[];
  isPinned?: boolean;
}

export class FirebaseService {
  static subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      callback(tasks);
    });
  }

  static subscribeToNotes(userId: string, callback: (notes: Note[]) => void) {
    const q = query(collection(db, "notes"), where("userId", "==", userId));

    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];
      callback(notes);
    });
  }

  static async addTask(task: Omit<Task, "id">) {
    const taskRef = await addDoc(collection(db, "tasks"), {
      ...task,
      createdAt: serverTimestamp(),
    });
    return taskRef.id;
  }

  static async updateTask(taskId: string, updates: Partial<Task>) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updates);
  }

  static async deleteTask(taskId: string) {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
  }

  static async addNote(note: Omit<Note, "id">) {
    const noteRef = await addDoc(collection(db, "notes"), {
      ...note,
      createdAt: serverTimestamp(),
    });
    return noteRef.id;
  }

  static async updateNote(noteId: string, updates: Partial<Note>) {
    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, updates);
  }

  static async deleteNote(noteId: string) {
    const noteRef = doc(db, "notes", noteId);
    await deleteDoc(noteRef);
  }
}
