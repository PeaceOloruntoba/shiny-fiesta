import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Search,
  Edit,
  Mail,
  User as UserIcon,
  Phone,
  Hash,
  X,
  Shield,
  TrendingUp,
  UserCheck,
  Clock,
} from "lucide-react";
import { useUsers, type User } from "../stores/users";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ConfirmationModal from "../components/ui/ConfirmationModal";

export default function Users() {
  const { users, stats, loading, fetchUsers, fetchUserStats, updateUser } = useUsers();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    matric_number: string;
    phone: string;
    role: "user" | "admin";
  }>({
    name: "",
    email: "",
    matric_number: "",
    phone: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [fetchUsers, fetchUserStats]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.matric_number && u.matric_number.toLowerCase().includes(search.toLowerCase())),
  );

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      matric_number: user.matric_number || "",
      phone: user.phone || "",
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsConfirmOpen(true);
  };

  const confirmSave = async () => {
    if (selectedUser) {
      await updateUser(selectedUser.id, formData);
    }
    setIsConfirmOpen(false);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">User Management</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {users.length} registered users in the system
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UsersIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</p>
              <h4 className="text-xl font-bold text-gray-900">{stats?.total_users || 0}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Regular Users</p>
              <h4 className="text-xl font-bold text-gray-900">{stats?.user_count || 0}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admins</p>
              <h4 className="text-xl font-bold text-gray-900">{stats?.admin_count || 0}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New (30d)</p>
              <h4 className="text-xl font-bold text-gray-900">{stats?.new_users_30d || 0}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <Input
          placeholder="Search by name, email or matric number..."
          leftIcon={<Search size={16} className="text-gray-400" />}
          value={search}
          className="border-none bg-transparent h-10 text-sm"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table/Grid */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Matric No</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                        {user.profile_image ? (
                          <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          user.name[0]
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {user.matric_number || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-gray-600">{user.phone || "No Phone"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        user.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      onClick={() => handleOpenModal(user)}
                      variant="secondary"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <Edit size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[500px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-[#101828] mb-6">Edit User Info</h3>

            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                leftIcon={<UserIcon size={18} />}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email Address"
                placeholder="john@example.com"
                leftIcon={<Mail size={18} />}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Matric Number"
                  placeholder="2024/0001"
                  leftIcon={<Hash size={18} />}
                  value={formData.matric_number}
                  onChange={(e) => setFormData({ ...formData, matric_number: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  placeholder="08012345678"
                  leftIcon={<Phone size={18} />}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Role</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#4CAF50] text-sm font-medium"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="user">Regular User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} className="flex-1" isLoading={loading}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmSave}
        title="Update User?"
        description="Are you sure you want to update this user's information?"
        confirmText="Yes, Update"
        variant="proceed"
        isLoading={loading}
      />
    </div>
  );
}
