'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Item {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  parLevel: number;
  currentQuantity: number;
}

interface Category {
  id: string;
  name: string;
  items: Item[] | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
  createdAt: string;
}

export default function AdminPage() {
  const { user, loading: authLoading, logout, isAdmin } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'employees'>('items');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [itemForm, setItemForm] = useState({
    name: '',
    categoryId: '',
    parLevel: 0,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'employee' | 'admin',
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    } else if (user && isAdmin) {
      fetchData();
    }
  }, [user, authLoading, isAdmin]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch categories
      const categoriesResponse = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (categoriesResponse.ok) {
        const data = await categoriesResponse.json();
        setCategories(data.categories);
      }

      // Fetch users
      const usersResponse = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (usersResponse.ok) {
        const data = await usersResponse.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!itemForm.name || !itemForm.categoryId) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemForm),
      });

      if (response.ok) {
        setShowItemForm(false);
        setItemForm({ name: '', categoryId: '', parLevel: 0 });
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create item');
      }
    } catch (error) {
      alert('Failed to create item');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemForm),
      });

      if (response.ok) {
        setEditingItem(null);
        setItemForm({ name: '', categoryId: '', parLevel: 0 });
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update item');
      }
    } catch (error) {
      alert('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete item');
      }
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      alert('Please enter a category name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        setShowCategoryForm(false);
        setCategoryForm({ name: '' });
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create category');
      }
    } catch (error) {
      alert('Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        setEditingCategory(null);
        setCategoryForm({ name: '' });
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update category');
      }
    } catch (error) {
      alert('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? It must have no items.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const startEditItem = (item: Item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      categoryId: item.categoryId,
      parLevel: item.parLevel,
    });
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
    });
  };

  // User management functions
  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        setShowUserForm(false);
        setUserForm({ name: '', email: '', password: '', role: 'employee' });
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      alert('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        setEditingUser(null);
        setUserForm({ name: '', email: '', password: '', role: 'employee' });
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update user');
      }
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const startEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setUserForm({
      name: userToEdit.name,
      email: userToEdit.email,
      password: '', // Don't prefill password
      role: userToEdit.role,
    });
  };

  if (authLoading || loading) {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fff7ed' }}>
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">🧋</div>
            <p style={{ color: '#9a3412' }} className="text-lg">Loading...</p>
          </div>
        </div>
    );
  }

  const allItems: Item[] = categories.flatMap(cat =>
      (cat.items || []).map(item => ({
        ...item,
        categoryId: cat.id,
        categoryName: cat.name,
      }))
  );

  // Filter items based on search query
  const filteredItems = searchQuery.trim()
      ? allItems.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : allItems;

  // Filter categories based on search query
  const filteredCategories = searchQuery.trim()
      ? categories.filter(cat =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : categories;

  // Filter users based on search query
  const filteredUsers = searchQuery.trim()
      ? users.filter(u =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : users;

  return (
      <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
        {/* Header */}
        <div className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500 w-27 h-27 rounded-full flex items-center justify-center mx-auto">
                  <img
                      src="/sweetdotsfavicon-removebg-preview.png"
                      alt="Sweet Dots Logo"
                      className="w-24 h-24 object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Sweet Dots
                  </h1>
                  <p className="text-orange-100 text-sm">Admin Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                    onClick={() => router.push('/inventory')}
                    className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50"
                >
                  ✏️ Update
                </button>
                <button
                    onClick={() => router.push('/history')}
                    className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50"
                >
                  📊 History
                </button>
                <button
                    onClick={logout}
                    className="px-6 py-3 bg-orange-800 text-white rounded-lg font-semibold hover:bg-orange-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-3">
              <button
                  onClick={() => {
                    setActiveTab('items');
                    setSearchQuery(''); // Clear search when switching
                  }}
                  className={`py-4 rounded-xl font-bold text-lg transition-all ${
                      activeTab === 'items'
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg'
                          : 'bg-orange-50 text-orange-600'
                  }`}
              >
                📦 Manage Items
              </button>
              <button
                  onClick={() => {
                    setActiveTab('categories');
                    setSearchQuery(''); // Clear search when switching
                  }}
                  className={`py-4 rounded-xl font-bold text-lg transition-all ${
                      activeTab === 'categories'
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg'
                          : 'bg-orange-50 text-orange-600'
                  }`}
              >
                🏷️ Manage Categories
              </button>
              <button
                  onClick={() => {
                    setActiveTab('employees');
                    setSearchQuery(''); // Clear search when switching
                  }}
                  className={`py-4 rounded-xl font-bold text-lg transition-all ${
                      activeTab === 'employees'
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg'
                          : 'bg-orange-50 text-orange-600'
                  }`}
              >
                👥 Manage Employees
              </button>
            </div>
          </div>

          {/* Items Tab */}
          {activeTab === 'items' && (
              <>
                {/* Search Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search items by name or category..."
                        className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-orange-200 bg-orange-50 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-600"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                    )}
                  </div>
                  {searchQuery && (
                      <p className="mt-2 text-sm text-orange-600">
                        Found {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                      </p>
                  )}
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold" style={{ color: '#9a3412' }}>
                    Items ({filteredItems.length})
                  </h2>
                  <button
                      onClick={() => {
                        setShowItemForm(true);
                        setEditingItem(null);
                        setItemForm({ name: '', categoryId: '', parLevel: 0 });
                      }}
                      className="px-8 py-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Item Form */}
                {(showItemForm || editingItem) && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                      <h3 className="text-2xl font-bold mb-4" style={{ color: '#9a3412' }}>
                        {editingItem ? 'Edit Item' : 'Create New Item'}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#9a3412' }}>
                            Item Name
                          </label>
                          <input
                              type="text"
                              value={itemForm.name}
                              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 bg-orange-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#9a3412' }}>
                            Category
                          </label>
                          <select
                              value={itemForm.categoryId}
                              onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 bg-orange-50"
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#9a3412' }}>
                            Par Level
                          </label>
                          <input
                              type="number"
                              value={itemForm.parLevel}
                              onChange={(e) => setItemForm({ ...itemForm, parLevel: parseInt(e.target.value) || 0 })}
                              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 bg-orange-50"
                              min="0"
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                              onClick={editingItem ? handleUpdateItem : handleCreateItem}
                              className="flex-1 py-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                          >
                            {editingItem ? 'Update' : 'Create'}
                          </button>
                          <button
                              onClick={() => {
                                setShowItemForm(false);
                                setEditingItem(null);
                                setItemForm({ name: '', categoryId: '', parLevel: 0 });
                              }}
                              className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {filteredItems.length === 0 ? (
                      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <p className="text-xl text-orange-600">
                          {searchQuery ? `No items found matching "${searchQuery}"` : 'No items yet'}
                        </p>
                      </div>
                  ) : (
                      filteredItems.map(item => (
                          <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold" style={{ color: '#9a3412' }}>{item.name}</h4>
                              <p className="text-orange-600">
                                {item.categoryName} • Par Level: {item.parLevel} • Current: {item.currentQuantity}
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                  onClick={() => startEditItem(item)}
                                  className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
                              >
                                Edit
                              </button>
                              <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                      ))
                  )}
                </div>
              </>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
              <>
                {/* Search Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-orange-200 bg-orange-50 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-600"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                    )}
                  </div>
                  {searchQuery && (
                      <p className="mt-2 text-sm text-orange-600">
                        Found {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
                      </p>
                  )}
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold" style={{ color: '#9a3412' }}>
                    Categories ({filteredCategories.length})
                  </h2>
                  <button
                      onClick={() => {
                        setShowCategoryForm(true);
                        setEditingCategory(null);
                        setCategoryForm({ name: '' });
                      }}
                      className="px-8 py-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    + Add Category
                  </button>
                </div>

                {/* Category Form */}
                {(showCategoryForm || editingCategory) && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                      <h3 className="text-2xl font-bold mb-4" style={{ color: '#9a3412' }}>
                        {editingCategory ? 'Edit Category' : 'Create New Category'}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#9a3412' }}>
                            Category Name
                          </label>
                          <input
                              type="text"
                              value={categoryForm.name}
                              onChange={(e) => setCategoryForm({ name: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 bg-orange-50"
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                              className="flex-1 py-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                          >
                            {editingCategory ? 'Update' : 'Create'}
                          </button>
                          <button
                              onClick={() => {
                                setShowCategoryForm(false);
                                setEditingCategory(null);
                                setCategoryForm({ name: '' });
                              }}
                              className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                )}

                {/* Categories List */}
                <div className="space-y-3">
                  {filteredCategories.length === 0 ? (
                      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <p className="text-xl text-orange-600">
                          {searchQuery ? `No categories found matching "${searchQuery}"` : 'No categories yet'}
                        </p>
                      </div>
                  ) : (
                      filteredCategories.map(category => (
                          <div key={category.id} className="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold" style={{ color: '#9a3412' }}>{category.name}</h4>
                              <p className="text-orange-600">
                                {(category.items || []).length} items
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                  onClick={() => startEditCategory(category)}
                                  className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
                              >
                                Edit
                              </button>
                              <button
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
                                  disabled={(category.items || []).length > 0}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                      )))}
                </div>
              </>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
              <>
                {/* Search Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search employees by name or email..."
                        className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-orange-200 bg-orange-50 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-600"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                    )}
                  </div>
                  {searchQuery && (
                      <p className="mt-2 text-sm text-orange-600">
                        Found {filteredUsers.length} employee{filteredUsers.length !== 1 ? 's' : ''}
                      </p>
                  )}
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold" style={{ color: '#9a3412' }}>
                    Employees ({filteredUsers.length})
                  </h2>
                  <button
                      onClick={() => {
                        setShowUserForm(true);
                        setEditingUser(null);
                        setUserForm({ name: '', email: '', password: '', role: 'employee' });
                      }}
                      className="px-8 py-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    + Add Employee
                  </button>
                </div>

                {/* User Form */}
                {(showUserForm || editingUser) && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                      <h3 className="text-2xl font-bold mb-4" style={{ color: '#9a3412' }}>
                        {editingUser ? 'Edit Employee' : 'Create New Employee'}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#9a3412' }}>
                            Full Name
                          </label>
                          <input
                              type="text"
                              value={userForm.name}
                              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 bg-orange-50"
                              placeholder="e.g., Sarah Johnson"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#9a3412' }}>
                            Email Address
                          </label>
                          <input
                              type="email"
                              value={userForm.email}
                              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 bg-orange-50"
                              placeholder="e.g., sarah@sweetdots.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#9a3412' }}>
                            Password {editingUser && '(leave blank to keep current)'}
                          </label>
                          <input
                              type="password"
                              value={userForm.password}
                              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 bg-orange-50"
                              placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: '#9a3412' }}>
                            Role
                          </label>
                          <select
                              value={userForm.role}
                              onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'employee' | 'admin' })}
                              className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 bg-orange-50"
                          >
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                          </select>
                          <p className="text-sm text-orange-600 mt-1">
                            {userForm.role === 'admin' ? '⚠️ Admins have full access to manage everything' : '✓ Employees can update inventory and view history'}
                          </p>
                        </div>

                        <div className="flex space-x-3">
                          <button
                              onClick={editingUser ? handleUpdateUser : handleCreateUser}
                              className="flex-1 py-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                          >
                            {editingUser ? 'Update Employee' : 'Create Employee'}
                          </button>
                          <button
                              onClick={() => {
                                setShowUserForm(false);
                                setEditingUser(null);
                                setUserForm({ name: '', email: '', password: '', role: 'employee' });
                              }}
                              className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                )}

                {/* Employees List */}
                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <p className="text-xl text-orange-600">
                          {searchQuery ? `No employees found matching "${searchQuery}"` : 'No employees yet'}
                        </p>
                      </div>
                  ) : (
                      filteredUsers.map(employee => (
                          <div key={employee.id} className="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-bold" style={{ color: '#9a3412' }}>{employee.name}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    employee.role === 'admin'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                }`}>
                          {employee.role === 'admin' ? '👑 Admin' : '👤 Employee'}
                        </span>
                              </div>
                              <p className="text-orange-600">
                                {employee.email}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Joined: {new Date(employee.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                  onClick={() => startEditUser(employee)}
                                  className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
                              >
                                Edit
                              </button>
                              <button
                                  onClick={() => handleDeleteUser(employee.id)}
                                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
                                  disabled={employee.id === user?.id}
                              >
                                {employee.id === user?.id ? "Can't delete yourself" : 'Delete'}
                              </button>
                            </div>
                          </div>
                      ))
                  )}
                </div>
              </>
          )}
        </div>
      </div>
  );
}
