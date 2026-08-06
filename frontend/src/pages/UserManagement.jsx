import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUserRole, updateUserStatus, deleteUser } from '../services/socApi';
import { useAuth } from '../context/AuthContext';
import { 
  Users, UserPlus, ShieldAlert, CheckCircle, XCircle, Trash2, 
  RefreshCw, Search, Shield, UserCheck, Key, AlertCircle, X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDateTime } from '../utils/dateUtils';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal State for New User
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role_name: 'Security Analyst'
  });
  const [createSaving, setCreateSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user registry");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateSaving(true);
    try {
      await createUser(newUser);
      toast.success(`User ${newUser.username} created successfully!`);
      setShowCreateModal(false);
      setNewUser({ full_name: '', username: '', email: '', password: '', role_name: 'Security Analyst' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to create user: ${err.response?.data?.detail || err.message}`);
    } finally {
      setCreateSaving(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("Role updated successfully!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to update role: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      toast.success(`User status updated to ${!currentStatus ? 'Active' : 'Inactive'}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to update status: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteUser = async (userId, targetUsername) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot delete your own active administrator account.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete user account '${targetUsername}'?`)) {
      try {
        await deleteUser(userId);
        toast.success(`User ${targetUsername} deleted.`);
        fetchUsers();
      } catch (err) {
        console.error(err);
        toast.error(`Failed to delete user: ${err.response?.data?.detail || err.message}`);
      }
    }
  };

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'Administrator':
        return <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-cyber-danger/20 text-cyber-danger border border-cyber-danger/40">Administrator</span>;
      case 'SOC Manager':
        return <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">SOC Manager</span>;
      default:
        return <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/40">Security Analyst</span>;
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'All' && u.role?.role_name !== roleFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = u.full_name?.toLowerCase().includes(term);
      const matchUser = u.username?.toLowerCase().includes(term);
      const matchEmail = u.email?.toLowerCase().includes(term);
      return matchName || matchUser || matchEmail;
    }
    return true;
  });

  const adminCount = users.filter(u => u.role?.role_name === 'Administrator').length;
  const managerCount = users.filter(u => u.role?.role_name === 'SOC Manager').length;
  const analystCount = users.filter(u => u.role?.role_name === 'Security Analyst').length;

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyber-border/50">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyber-accent/10 border border-cyber-accent/30 rounded-lg text-cyber-accent">
                <Users className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                  User &amp; Access Control Administration
                </h1>
                <p className="text-xs md:text-sm text-cyber-muted">
                  RBAC Role Assignments, Account Provisioning, and Active Security Sessions
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyber-accent text-cyber-bg hover:opacity-90 rounded-lg text-xs font-bold transition-all shadow-md"
            >
              <UserPlus className="h-4 w-4" />
              <span>Provision New User</span>
            </button>

            <button
              onClick={fetchUsers}
              className="p-2 bg-cyber-card border border-cyber-border hover:border-cyber-accent rounded-lg text-cyber-muted hover:text-white transition-all"
              title="Refresh User Registry"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyber-accent' : ''}`} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
            <span className="text-xs text-cyber-muted uppercase font-bold">Total Accounts</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">{users.length}</p>
          </div>
          <div className="bg-cyber-card border border-cyber-danger/40 p-4 rounded-xl">
            <span className="text-xs text-cyber-danger uppercase font-bold">Administrators</span>
            <p className="text-2xl font-bold font-mono text-cyber-danger mt-1">{adminCount}</p>
          </div>
          <div className="bg-cyber-card border border-yellow-500/40 p-4 rounded-xl">
            <span className="text-xs text-yellow-400 uppercase font-bold">SOC Managers</span>
            <p className="text-2xl font-bold font-mono text-yellow-400 mt-1">{managerCount}</p>
          </div>
          <div className="bg-cyber-card border border-cyber-accent/40 p-4 rounded-xl">
            <span className="text-xs text-cyber-accent uppercase font-bold">Security Analysts</span>
            <p className="text-2xl font-bold font-mono text-cyber-accent mt-1">{analystCount}</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-cyber-card border border-cyber-border p-3.5 rounded-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyber-muted" />
            <input 
              type="text"
              placeholder="Search user by Name, Username, or Email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-cyber-bg border border-cyber-border/70 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-cyber-muted focus:outline-none focus:border-cyber-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-cyber-bg border border-cyber-border text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyber-accent"
            >
              <option value="All">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="SOC Manager">SOC Manager</option>
              <option value="Security Analyst">Security Analyst</option>
            </select>
          </div>
        </div>

        {/* User Accounts Table */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-cyber-bg/80 border-b border-cyber-border text-cyber-muted text-xs uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="px-4">Email</th>
                  <th className="px-4">Assigned Role</th>
                  <th className="px-4">Account Status</th>
                  <th className="px-4">Created Date</th>
                  <th className="px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/40">
                {filteredUsers.map(u => {
                  const roleName = u.role?.role_name || 'Security Analyst';

                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-cyber-accent/20 border border-cyber-accent/40 flex items-center justify-center text-xs font-mono text-cyber-accent">
                            {u.full_name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">{u.full_name}</p>
                            <p className="text-[11px] text-cyber-muted font-mono">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 text-xs font-mono text-cyber-muted">
                        {u.email}
                      </td>
                      <td className="px-4">
                        <select
                          value={roleName}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="bg-cyber-bg border border-cyber-border text-white text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyber-accent font-semibold"
                        >
                          <option value="Administrator">Administrator</option>
                          <option value="SOC Manager">SOC Manager</option>
                          <option value="Security Analyst">Security Analyst</option>
                        </select>
                      </td>
                      <td className="px-4">
                        <button
                          onClick={() => handleStatusToggle(u.id, u.is_active)}
                          className={`px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                            u.is_active 
                              ? 'bg-cyber-success/20 text-cyber-success hover:bg-cyber-success/30' 
                              : 'bg-cyber-danger/20 text-cyber-danger hover:bg-cyber-danger/30'
                          }`}
                        >
                          {u.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {u.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-4 text-xs font-mono text-cyber-muted">
                        {formatDateTime(u.created_at)}
                      </td>
                      <td className="px-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          disabled={u.id === currentUser?.id}
                          className="p-1.5 bg-cyber-card border border-cyber-border hover:border-cyber-danger text-cyber-danger hover:bg-cyber-danger/10 rounded-lg text-xs transition-all disabled:opacity-30"
                          title="Delete User Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-cyber-muted">
                      No user accounts match the selected search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------- Provision New User Modal ----------------- */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-cyber-border">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-cyber-accent" />
                  <h3 className="text-lg font-bold text-white">Provision Security Account</h3>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-cyber-muted hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-cyber-muted">Full Name</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                    placeholder="e.g. Alex Mercer"
                    className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-cyber-muted">Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="e.g. alex_soc"
                    className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-cyber-muted">Email Address</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="alex.mercer@company.com"
                    className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-cyber-muted">Temporary Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-accent"
                    minLength={8}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-cyber-muted">Assign Initial Role</label>
                  <select
                    value={newUser.role_name}
                    onChange={e => setNewUser({ ...newUser, role_name: e.target.value })}
                    className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-accent"
                  >
                    <option value="Security Analyst">Security Analyst</option>
                    <option value="SOC Manager">SOC Manager</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-cyber-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-2 text-xs font-semibold text-cyber-muted hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSaving}
                    className="px-4 py-2 bg-cyber-accent text-cyber-bg rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-md"
                  >
                    {createSaving ? 'Creating Account...' : 'Provision User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserManagement;
