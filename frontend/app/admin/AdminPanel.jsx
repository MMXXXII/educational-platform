import React, { useState, useEffect, useRef } from "react";
import { userService } from "../api";
import { useAuth } from "../contexts/AuthContext";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminPanel() {
  const { hasRole } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: "", role: "user" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  if (!hasRole(["admin"])) {
    return (
      <div className="p-8 text-center min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <ShieldExclamationIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-white">Доступ запрещен</h2>
        <p className="text-gray-400">
          У вас нет прав для доступа к панели администратора.
        </p>
      </div>
    );
  }

  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(
        data.map((u) => ({ ...u, is_active: u.is_active !== undefined ? u.is_active : true }))
      );
    } catch (e) {
      console.error("Ошибка при получении пользователей:", e);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка уведомлений
  const fetchNotifications = async () => {
    try {
      const data = await userService.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Ошибка при получении уведомлений:", e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  // Управление пользователями
  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({ email: user.email, role: user.role });
  };
  const handleUpdate = async (userId) => {
    try {
      await userService.updateUser(userId, editForm);
      setEditingUser(null);
      fetchUsers();
    } catch (e) {
      alert("Ошибка при обновлении пользователя");
      console.error(e);
    }
  };
  const handleDelete = async (userId) => {
    if (!confirm("Вы уверены?")) return;
    try {
      await userService.deleteUser(userId);
      fetchUsers();
    } catch (e) {
      alert("Ошибка при удалении пользователя");
      console.error(e);
    }
  };
  const handleToggleActive = async (user) => {
    try {
      await userService.updateUser(user.id, { is_active: !user.is_active });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  // Фильтрация
  const filteredUsers = users
    .filter((u) => filterRole === "all" || u.role === filterRole)
    .filter(
      (u) =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Статистика
  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    admins: users.filter((u) => u.role === "admin").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    students: users.filter((u) => u.role === "user").length,
  };

  const chartData = [
    { name: "Активные", value: stats.active },
    { name: "Студенты", value: stats.students },
    { name: "Преподаватели", value: stats.teachers },
    { name: "Администраторы", value: stats.admins },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* SIDEBAR */}
      <aside className="w-72 bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="px-6 py-6 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold">
            Edu
          </div>
          <div>
            <p className="font-semibold text-white">EduAdmin</p>
          </div>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3">
          <SidebarItem active icon={ShieldCheckIcon} label="Главная" />
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500">
          © {new Date().getFullYear()} EduAdmin
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-20 border-b border-slate-800 flex items-center px-4 md:px-8 bg-slate-950/80 backdrop-blur relative">
          <div className="flex-1 flex items-center space-x-3">
            <div className="relative w-full max-w-lg">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Быстрый поиск..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 ml-4" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="relative rounded-full p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <BellIcon className="h-5 w-5 text-slate-200" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
            {isNotifOpen && (
              <div className="absolute right-4 top-16 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl z-50">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-100">Уведомления</span>
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Закрыть
                  </button>
                </div>
                <ul className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                  {notifications.map((n) => (
                    <li key={n.id} className="px-4 py-3 hover:bg-slate-900/70">
                      <p className="text-sm text-slate-100">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                    </li>
                  ))}
                  {notifications.length === 0 && (
                    <li className="px-4 py-3 text-slate-500 text-xs">Нет новых уведомлений</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 px-4 md:px-8 py-6 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 overflow-y-auto">
          {/* Фильтры */}
          <div className="flex gap-2 mb-4">
            {["all", "user", "teacher", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-xl text-sm ${
                  filterRole === role
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {role === "all"
                  ? "Все"
                  : role === "user"
                  ? "Студенты"
                  : role === "teacher"
                  ? "Преподаватели"
                  : "Администраторы"}
              </button>
            ))}
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard title="Активные" value={stats.active} icon={UserGroupIcon} accent="text-emerald-400 bg-emerald-500/10" />
            <StatCard title="Всего" value={stats.total} icon={UserGroupIcon} accent="text-blue-400 bg-blue-500/10" />
            <StatCard title="Администраторы" value={stats.admins} icon={ShieldCheckIcon} accent="text-rose-400 bg-rose-500/10" />
            <StatCard title="Преподаватели" value={stats.teachers} icon={ChartBarIcon} accent="text-indigo-400 bg-indigo-500/10" />
          </div>

          {/* Таблица пользователей */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950/80">
                  <tr>
                    <Th>ID</Th>
                    <Th>Пользователь</Th>
                    <Th>Email</Th>
                    <Th>Роль</Th>
                    <Th>Статус</Th>
                    <Th>Действия</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/80 transition-colors">
                      <Td mono>#{user.id}</Td>
                      <Td>{user.username}</Td>
                      <Td>
                        {editingUser === user.id ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="border border-slate-700 rounded-lg px-3 py-2 bg-slate-900 text-slate-50 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div>{user.email}</div>
                        )}
                      </Td>
                      <Td>
                        {editingUser === user.id ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="border border-slate-700 rounded-lg px-3 py-2 bg-slate-900 text-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="user">Студент</option>
                            <option value="teacher">Преподаватель</option>
                            <option value="admin">Администратор</option>
                          </select>
                        ) : (
                          <span
                            className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                              user.role === "admin"
                                ? "bg-rose-500/10 text-rose-300 border-rose-500/40"
                                : user.role === "teacher"
                                ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/40"
                                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
                            }`}
                          >
                            {user.role === "admin"
                              ? "Администратор"
                              : user.role === "teacher"
                              ? "Преподаватель"
                              : "Студент"}
                          </span>
                        )}
                      </Td>
                      <Td>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`flex items-center px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                            user.is_active
                              ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <EyeIcon className="h-4 w-4 mr-2" />
                              Активен
                            </>
                          ) : (
                            <>
                              <EyeSlashIcon className="h-4 w-4 mr-2" />
                              Заблокирован
                            </>
                          )}
                        </button>
                      </Td>
                      <Td>
                        {editingUser === user.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdate(user.id)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-xs"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Сохранить
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="px-3 py-1.5 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-xs"
                            >
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Редактировать"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Удалить"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-10 text-slate-400">Нет пользователей для отображения</div>
            )}
          </div>

          {/* Аналитика */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-white font-semibold mb-3">Аналитика пользователей</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ------------------ Вспомогательные компоненты ------------------
function SidebarItem({ icon: Icon, label, active = false, badge }) {
  return (
    <button
      type="button"
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
        active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <span className="flex items-center space-x-3">
        {Icon && <Icon className="h-5 w-5" />}
        <span>{label}</span>
      </span>
      {badge !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${active ? "bg-white/10" : "bg-slate-800 text-slate-200"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, icon: Icon, accent }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      </div>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${accent}`}>{Icon && <Icon className="h-5 w-5" />}</div>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{children}</th>;
}

function Td({ children, mono = false }) {
  return <td className={`px-6 py-4 whitespace-nowrap text-sm text-slate-200 ${mono ? "font-mono" : ""}`}>{children}</td>;
}
