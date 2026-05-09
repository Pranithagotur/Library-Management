import React, { useState, useEffect, useCallback } from 'react';
import { 
  Library, BookOpen, Users, PlusCircle, UserPlus, 
  ArrowRightLeft, CheckCircle, Search, Menu, X,
  BookMarked, TrendingUp, AlertCircle, Info, CheckCircle2,
  Lock, User, LogOut
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

// --- TOAST SYSTEM ---
const TOAST_TIMEOUT = 3000;
let toastCount = 0;

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-enter glass flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg min-w-[300px]
          ${toast.type === 'success' ? 'border-l-green-500' : toast.type === 'error' ? 'border-l-red-500' : 'border-l-blue-500'}`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-slate-100">{toast.title}</h4>
            <p className="text-xs text-slate-400">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// --- AUTH SCREEN ---
const Login = ({ onLogin, addToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      
      if (isLogin) {
        onLogin(data.token, data.username);
        addToast('Welcome Back', 'Successfully logged into the dashboard.', 'success');
      } else {
        addToast('Registration Success', 'You can now log in with your credentials.', 'success');
        setIsLogin(true); // Switch to login after successful registration
        setPassword('');
      }
    } catch (err) {
      addToast(isLogin ? 'Login Error' : 'Registration Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 z-10">
      <div className="glass-card max-w-md w-full p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Library className="w-48 h-48 text-amber-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Library className="w-7 h-7 text-navy-900" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-3xl text-slate-100 leading-tight">Lumina</h2>
              <span className="text-sm text-amber-500 font-medium tracking-widest uppercase">Admin Portal</span>
            </div>
          </div>
          
          <div className="flex gap-4 mb-6 border-b border-slate-700/50 pb-2">
            <button 
              type="button"
              className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${isLogin ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${!isLogin ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  className="glass-input pl-10" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  className="glass-input pl-10" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="glass-button-primary w-full py-3 mt-4"
              disabled={loading}
            >
              {loading ? (isLogin ? 'Authenticating...' : 'Registering...') : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
          {isLogin && <p className="mt-6 text-center text-xs text-slate-500">Default credentials: admin / admin123</p>}
        </div>
      </div>
    </div>
  );
};

// --- SHARED COMPONENTS ---
const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="glass-card p-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
      <Icon className="w-24 h-24 text-amber-500" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-amber-500/10 rounded-xl">
          <Icon className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-slate-400 font-medium tracking-wide text-sm uppercase">{title}</h3>
      </div>
      <div className="flex items-end gap-4">
        <span className="text-4xl font-serif font-bold text-slate-100">{value}</span>
        {trend && (
          <span className={`text-sm mb-1 flex items-center gap-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 && 'rotate-180'}`} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  </div>
);

// --- VIEWS ---
const Dashboard = ({ books, users, assignments }) => {
  const totalBooks = books.reduce((acc, b) => acc + b.total, 0);
  const availableBooks = books.reduce((acc, b) => acc + b.available, 0);
  const activeAssignments = assignments.filter(a => a.status === 'active').length;

  const recentActivity = assignments.slice().sort((a, b) => new Date(b.assignDate) - new Date(a.assignDate)).slice(0, 5);

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">Library Overview</h1>
        <p className="text-slate-400">Welcome back to the administrative dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Books" value={totalBooks} icon={Library} trend={+5} />
        <StatCard title="Available" value={availableBooks} icon={BookMarked} />
        <StatCard title="Active Members" value={users.length} icon={Users} trend={+12} />
        <StatCard title="Checked Out" value={activeAssignments} icon={ArrowRightLeft} />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-500" /> Recent Activity
        </h2>
        <div className="space-y-4">
          {recentActivity.map(activity => {
            const book = books.find(b => b.id === activity.bookId);
            const user = users.find(u => u.id === activity.userId);
            if (!book || !user) return null;
            return (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${activity.status === 'active' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                    {activity.status === 'active' ? <ArrowRightLeft className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">
                      <span className="text-amber-400">{user.name}</span> {activity.status === 'active' ? 'borrowed' : 'returned'} <span className="italic">{book.title}</span>
                    </p>
                    <p className="text-xs text-slate-500">{activity.assignDate}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold ${activity.status === 'active' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                  {activity.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const BooksList = ({ books }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">Book Catalog</h1>
          <p className="text-slate-400">Manage and browse the library inventory.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search books..." 
            className="glass-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="p-4 font-semibold text-slate-300">Title</th>
                <th className="p-4 font-semibold text-slate-300">Author</th>
                <th className="p-4 font-semibold text-slate-300">Category</th>
                <th className="p-4 font-semibold text-slate-300">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredBooks.map(book => (
                <tr key={book.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-medium text-slate-200">{book.title}</td>
                  <td className="p-4 text-slate-400">{book.author}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-700/50 text-xs rounded-full text-slate-300 border border-slate-600/50">
                      {book.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${book.available > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                      <span className="text-slate-300">{book.available} / {book.total}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No books found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AddBook = ({ onAdd, addToast }) => {
  const [formData, setFormData] = useState({ title: '', author: '', category: '', total: 1 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.category) {
      addToast('Validation Error', 'Please fill in all required fields.', 'error');
      return;
    }
    const newBook = {
      ...formData,
      id: Date.now().toString(),
      total: parseInt(formData.total),
      available: parseInt(formData.total)
    };
    
    setLoading(true);
    try {
      await onAdd(newBook);
      addToast('Book Added', `"${newBook.title}" has been added to the catalog.`, 'success');
      setFormData({ title: '', author: '', category: '', total: 1 });
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">Add New Book</h1>
        <p className="text-slate-400">Register a new book into the library system.</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Book Title *</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="e.g. The Hobbit"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Author *</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="e.g. J.R.R. Tolkien"
              value={formData.author}
              onChange={e => setFormData({...formData, author: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Category *</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="e.g. Fantasy"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Total Copies</label>
              <input 
                type="number" 
                min="1"
                className="glass-input" 
                value={formData.total}
                onChange={e => setFormData({...formData, total: e.target.value})}
              />
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={loading} className="glass-button-primary w-full py-3">
              <PlusCircle className="w-5 h-5" /> {loading ? 'Adding...' : 'Add Book to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsersList = ({ users }) => {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">Member Directory</h1>
        <p className="text-slate-400">View and manage registered library members.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="p-4 font-semibold text-slate-300">Name</th>
                <th className="p-4 font-semibold text-slate-300">Email</th>
                <th className="p-4 font-semibold text-slate-300">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-medium text-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-bold uppercase">
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full border ${
                      user.role === 'Faculty' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AddUser = ({ onAdd, addToast }) => {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Student' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addToast('Validation Error', 'Please fill in all required fields.', 'error');
      return;
    }
    const newUser = {
      ...formData,
      id: `u${Date.now()}`
    };
    
    setLoading(true);
    try {
      await onAdd(newUser);
      addToast('Member Added', `${newUser.name} has been registered.`, 'success');
      setFormData({ name: '', email: '', role: 'Student' });
    } catch(err) {
      addToast('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">Register Member</h1>
        <p className="text-slate-400">Add a new user to the library system.</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Full Name *</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address *</label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Role</label>
            <select 
              className="glass-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_1rem_center]"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={loading} className="glass-button-primary w-full py-3">
              <UserPlus className="w-5 h-5" /> {loading ? 'Registering...' : 'Register Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignBook = ({ books, users, onAssign, addToast }) => {
  const [formData, setFormData] = useState({ bookId: '', userId: '', dueDate: '' });
  const [loading, setLoading] = useState(false);

  const availableBooks = books.filter(b => b.available > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookId || !formData.userId || !formData.dueDate) {
      addToast('Validation Error', 'Please complete all fields.', 'error');
      return;
    }
    
    const newAssignment = {
      id: `a${Date.now()}`,
      bookId: formData.bookId,
      userId: formData.userId,
      assignDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      status: 'active'
    };
    
    setLoading(true);
    try {
      await onAssign(newAssignment);
      const bookName = books.find(b=>b.id === formData.bookId)?.title;
      addToast('Book Checked Out', `"${bookName}" has been successfully assigned.`, 'success');
      setFormData({ bookId: '', userId: '', dueDate: '' });
    } catch(err) {
      addToast('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">Check Out Book</h1>
        <p className="text-slate-400">Assign an available book to a member.</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Select Member</label>
            <select 
              className="glass-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_1rem_center] [&>option]:bg-slate-800"
              value={formData.userId}
              onChange={e => setFormData({...formData, userId: e.target.value})}
            >
              <option value="">-- Select Member --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Select Book</label>
            <select 
              className="glass-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_1rem_center] [&>option]:bg-slate-800"
              value={formData.bookId}
              onChange={e => setFormData({...formData, bookId: e.target.value})}
            >
              <option value="">-- Select Available Book --</option>
              {availableBooks.map(b => <option key={b.id} value={b.id}>{b.title} (Avail: {b.available})</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Due Date</label>
            <input 
              type="date" 
              className="glass-input [color-scheme:dark]"
              value={formData.dueDate}
              onChange={e => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>
          <div className="pt-4">
            <button type="submit" disabled={loading} className="glass-button-primary w-full py-3">
              <ArrowRightLeft className="w-5 h-5" /> {loading ? 'Processing...' : 'Process Check Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReturnBook = ({ books, users, assignments, onReturn, addToast }) => {
  const activeAssignments = assignments.filter(a => a.status === 'active');

  const handleReturn = async (assignmentId) => {
    try {
      await onReturn(assignmentId);
      addToast('Book Returned', 'The book has been successfully checked in.', 'success');
    } catch(err) {
      addToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-amber-500 mb-2">Process Returns</h1>
        <p className="text-slate-400">View active checkouts and process book returns.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="p-4 font-semibold text-slate-300">Book</th>
                <th className="p-4 font-semibold text-slate-300">Member</th>
                <th className="p-4 font-semibold text-slate-300">Due Date</th>
                <th className="p-4 font-semibold text-slate-300 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {activeAssignments.map(assignment => {
                const book = books.find(b => b.id === assignment.bookId);
                const user = users.find(u => u.id === assignment.userId);
                if (!book || !user) return null;
                
                const isOverdue = new Date(assignment.dueDate) < new Date();

                return (
                  <tr key={assignment.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-medium text-slate-200">{book.title}</td>
                    <td className="p-4 text-slate-300">{user.name}</td>
                    <td className="p-4">
                      <span className={`text-sm ${isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                        {assignment.dueDate} {isOverdue && '(Overdue)'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleReturn(assignment.id)}
                        className="glass-button-secondary text-sm inline-flex"
                      >
                        <CheckCircle className="w-4 h-4" /> Return
                      </button>
                    </td>
                  </tr>
                );
              })}
              {activeAssignments.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No active checkouts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [adminUsername, setAdminUsername] = useState(localStorage.getItem('username'));
  const [currentView, setCurrentView] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!token);
  
  // Data State
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Toast Helpers
  const addToast = useCallback((title, message, type = 'info') => {
    const id = ++toastCount;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, TOAST_TIMEOUT);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // API Helper
  const authFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      handleLogout();
      throw new Error('Session expired. Please log in again.');
    }
    return response;
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [booksRes, usersRes, assignmentsRes] = await Promise.all([
        authFetch('/books'),
        authFetch('/users'),
        authFetch('/assignments')
      ]);
      const booksData = await booksRes.json();
      const usersData = await usersRes.json();
      const assignmentsData = await assignmentsRes.json();
      
      setBooks(booksData);
      setUsers(usersData);
      setAssignments(assignmentsData);
    } catch (err) {
      addToast('Data Error', 'Failed to load library data.', 'error');
    } finally {
      setIsInitializing(false);
    }
  }, [token, addToast]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);

  const handleLogin = (newToken, username) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
    setToken(newToken);
    setAdminUsername(username);
    setIsInitializing(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setAdminUsername(null);
  };

  // Action Handlers
  const handleAddBook = async (newBook) => {
    const res = await authFetch('/books', { method: 'POST', body: JSON.stringify(newBook) });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add book');
    }
    const data = await res.json();
    setBooks([...books, data]);
  };

  const handleAddUser = async (newUser) => {
    const res = await authFetch('/users', { method: 'POST', body: JSON.stringify(newUser) });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add member');
    }
    const data = await res.json();
    setUsers([...users, data]);
  };
  
  const handleAssignBook = async (newAssignment) => {
    const res = await authFetch('/assignments', { method: 'POST', body: JSON.stringify(newAssignment) });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to assign book');
    }
    const data = await res.json();
    setAssignments([...assignments, data]);
    setBooks(books.map(b => 
      b.id === data.bookId ? { ...b, available: b.available - 1 } : b
    ));
  };

  const handleReturnBook = async (assignmentId) => {
    const res = await authFetch(`/assignments/${assignmentId}/return`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to return book');
    }
    
    const assignment = assignments.find(a => a.id === assignmentId);
    setAssignments(assignments.map(a => 
      a.id === assignmentId ? { ...a, status: 'returned' } : a
    ));
    setBooks(books.map(b => 
      b.id === assignment.bookId ? { ...b, available: b.available + 1 } : b
    ));
  };

  // Background Decor
  const BackgroundDecor = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-navy-900">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen relative text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <BackgroundDecor />
        <Login onLogin={handleLogin} addToast={addToast} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-navy-900">
        <BackgroundDecor />
        <div className="z-10 animate-pulse flex flex-col items-center gap-4">
          <Library className="w-12 h-12 text-amber-500" />
          <p className="text-amber-500 font-medium tracking-widest uppercase text-sm">Loading System...</p>
        </div>
      </div>
    );
  }

  // Navigation Items
  const navItems = [
    { name: 'Dashboard', icon: Library, view: 'Dashboard' },
    { name: 'Catalog', icon: BookOpen, view: 'BooksList' },
    { name: 'Add Book', icon: PlusCircle, view: 'AddBook' },
    { name: 'Members', icon: Users, view: 'UsersList' },
    { name: 'Add Member', icon: UserPlus, view: 'AddUser' },
    { name: 'Check Out', icon: ArrowRightLeft, view: 'AssignBook' },
    { name: 'Returns', icon: CheckCircle, view: 'ReturnBook' },
  ];

  return (
    <div className="flex min-h-screen bg-navy-900 text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200 relative">
      <BackgroundDecor />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass z-30 flex items-center justify-between px-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Library className="w-5 h-5 text-navy-900" />
          </div>
          <span className="font-serif font-bold text-lg text-slate-100">Lumina</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-300 hover:text-white">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 glass border-r border-slate-700/50 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 md:h-24 flex items-center gap-3 px-6 border-b border-slate-700/30">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <Library className="w-6 h-6 text-navy-900" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-100 leading-tight">Lumina</h2>
            <span className="text-xs text-amber-500 font-medium tracking-widest uppercase">Library Sys</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setCurrentView(item.view);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                currentView === item.view 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentView === item.view ? 'text-amber-500' : ''}`} />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/30 space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
              <span className="font-bold text-amber-500 text-sm">{adminUsername?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold text-slate-200 truncate">{adminUsername}</div>
              <div className="text-xs text-slate-500 truncate">Administrator</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10 w-full pt-16 md:pt-0">
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {currentView === 'Dashboard' && <Dashboard books={books} users={users} assignments={assignments} />}
          {currentView === 'BooksList' && <BooksList books={books} />}
          {currentView === 'AddBook' && <AddBook onAdd={handleAddBook} addToast={addToast} />}
          {currentView === 'UsersList' && <UsersList users={users} />}
          {currentView === 'AddUser' && <AddUser onAdd={handleAddUser} addToast={addToast} />}
          {currentView === 'AssignBook' && <AssignBook books={books} users={users} onAssign={handleAssignBook} addToast={addToast} />}
          {currentView === 'ReturnBook' && <ReturnBook books={books} users={users} assignments={assignments} onReturn={handleReturnBook} addToast={addToast} />}
        </div>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
