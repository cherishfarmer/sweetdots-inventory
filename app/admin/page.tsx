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

export default function AdminPage() {
  const { user, loading: authLoading, logout, isAdmin } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  
  // Form states
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [itemForm, setItemForm] = useState({
    name: '',
    categoryId: '',
    parLevel: 0,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
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
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fff7ed' }}>
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🍩</div>
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">🍩</span>
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
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
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('items')}
              className={`py-4 rounded-xl font-bold text-lg transition-all ${
                activeTab === 'items'
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-orange-50 text-orange-600'
              }`}
            >
              📦 Manage Items
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 rounded-xl font-bold text-lg transition-all ${
                activeTab === 'categories'
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-orange-50 text-orange-600'
              }`}
            >
              🏷️ Manage Categories
            </button>
          </div>
        </div>

        {/* Items Tab */}
        {activeTab === 'items' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold" style={{ color: '#9a3412' }}>
                Items ({allItems.length})
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
              {allItems.map(item => (
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
              ))}
            </div>
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold" style={{ color: '#9a3412' }}>
                Categories ({categories.length})
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
              {categories.map(category => (
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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
