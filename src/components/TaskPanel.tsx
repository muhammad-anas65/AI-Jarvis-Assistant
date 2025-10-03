import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Bell,
  StickyNote,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
}

interface Reminder {
  id: string;
  title: string;
  remind_at: string;
  is_completed: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function TaskPanel() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'reminders' | 'notes'>('tasks');

  useEffect(() => {
    if (user) {
      loadTasks();
      loadReminders();
      loadNotes();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setTasks(data);
  };

  const loadReminders = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('remind_at', { ascending: true });

    if (data) setReminders(data);
  };

  const loadNotes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setNotes(data);
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', task.id);

    loadTasks();
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
    loadTasks();
  };

  const deleteReminder = async (reminderId: string) => {
    await supabase.from('reminders').delete().eq('id', reminderId);
    loadReminders();
  };

  const deleteNote = async (noteId: string) => {
    await supabase.from('notes').delete().eq('id', noteId);
    loadNotes();
  };

  const priorityColors = {
    low: 'text-blue-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-slate-800/50 backdrop-blur-sm rounded-lg p-1">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'tasks'
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 inline mr-1" />
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'reminders'
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4 inline mr-1" />
          Reminders
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'notes'
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <StickyNote className="w-4 h-4 inline mr-1" />
          Notes
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Ask Jarvis to create tasks for you</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 hover:border-slate-600 transition group"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className="mt-0.5 text-slate-400 hover:text-blue-400 transition flex-shrink-0"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-sm font-medium ${
                        task.status === 'completed'
                          ? 'text-slate-500 line-through'
                          : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="space-y-2">
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No reminders set</p>
              <p className="text-xs mt-1">Ask Jarvis to set reminders for you</p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 hover:border-slate-600 transition group"
              >
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white">{reminder.title}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(reminder.remind_at).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-2">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs mt-1">Ask Jarvis to create notes for you</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 hover:border-slate-600 transition group"
              >
                <div className="flex items-start gap-3">
                  <StickyNote className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white">{note.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{note.content}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
