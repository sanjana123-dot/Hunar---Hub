import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './AdminTables.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (e) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSuspend = async (user) => {
    const action = user.suspended ? 'reactivate' : 'suspend';
    const confirmMessage = user.suspended
      ? `Reactivate ${user.name}'s account?`
      : `Suspend ${user.name}'s account?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await api.put(`/admin/users/${user.id}/${action}`);
      toast.success(
        user.suspended ? 'User reactivated successfully.' : 'User suspended successfully.'
      );
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update user status');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <div className="admin-section-header">
        <h2>All Users</h2>
        <span className="admin-section-subtitle">
          Total: {users.length}
        </span>
      </div>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`admin-badge role-${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`admin-badge ${u.suspended ? 'status-rejected' : 'status-approved'}`}>
                    {u.suspended ? 'SUSPENDED' : 'ACTIVE'}
                  </span>
                </td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                <td>
                  {u.role === 'ADMIN' ? (
                    <span className="admin-action-disabled">Not allowed</span>
                  ) : (
                    <button
                      className={`admin-action-btn ${u.suspended ? 'reactivate' : 'suspend'}`}
                      onClick={() => handleToggleSuspend(u)}
                    >
                      {u.suspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;

