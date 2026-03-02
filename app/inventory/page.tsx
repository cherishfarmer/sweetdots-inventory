'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  currentQuantity: number;
  parLevel: number;
  categoryName: string;
}

interface Category {
  name: string;
  items: Item[];
}

export default function InventoryPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submissionType, setSubmissionType] = useState<'morning' | 'night' | ''>('');
  const [employeeName, setEmployeeName] = useState('');
  const [notes, setNotes] = useState('');
  const [suppliesReceived, setSuppliesReceived] = useState(false);
  const [suppliesNote, setSuppliesNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user) {
      setEmployeeName(user.name);
      fetchInventory();
    }
  }, [user, authLoading]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Transform data
        const transformed: Category[] = data.categories.map((cat: any) => ({
          name: cat.name,
          items: (cat.items || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            currentQuantity: item.currentQuantity,
            parLevel: item.parLevel,
            categoryName: cat.name,
          })),
        })).filter((cat: Category) => cat.items.length > 0);

        setCategories(transformed);

        // Check if we have saved quantities in localStorage
        const savedQuantities = localStorage.getItem('inventoryQuantities');

        if (savedQuantities) {
          // Use saved quantities (from last session)
          try {
            const parsed = JSON.parse(savedQuantities);
            setQuantities(parsed);
          } catch (e) {
            // If parsing fails, use database values
            const initialQuantities: Record<string, number> = {};
            transformed.forEach(cat => {
              cat.items.forEach(item => {
                initialQuantities[item.id] = item.currentQuantity;
              });
            });
            setQuantities(initialQuantities);
          }
        } else {
          // First time - use database values
          const initialQuantities: Record<string, number> = {};
          transformed.forEach(cat => {
            cat.items.forEach(item => {
              initialQuantities[item.id] = item.currentQuantity;
            });
          });
          setQuantities(initialQuantities);
        }
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCriticalItems = () => {
    const critical: Item[] = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (quantities[item.id] < item.parLevel) {
          critical.push({ ...item, currentQuantity: quantities[item.id] });
        }
      });
    });
    return critical;
  };

  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return categories;

    return categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(cat => cat.items.length > 0);
  };

  const updateQuantity = (itemId: string, change: number) => {
    setQuantities(prev => {
      const updated = {
        ...prev,
        [itemId]: Math.max(0, (prev[itemId] || 0) + change),
      };
      // Save to localStorage
      localStorage.setItem('inventoryQuantities', JSON.stringify(updated));
      return updated;
    });
  };

  const setDirectQuantity = (itemId: string, value: string) => {
    const num = parseInt(value) || 0;
    setQuantities(prev => {
      const updated = {
        ...prev,
        [itemId]: Math.max(0, num),
      };
      // Save to localStorage
      localStorage.setItem('inventoryQuantities', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!submissionType) {
      alert('Please select Morning or Night shift');
      return;
    }

    if (!employeeName.trim()) {
      alert('Please enter your name');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const items = Object.entries(quantities).map(([id, quantity]) => ({
        id,
        quantity,
      }));

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionType,
          employeeName,
          notes: notes.trim() || null,
          suppliesReceived,
          suppliesNote: suppliesReceived && suppliesNote.trim() ? suppliesNote.trim() : null,
          items,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);

        // Clear saved quantities after successful submission
        localStorage.removeItem('inventoryQuantities');

        setTimeout(() => {
          setShowSuccess(false);
          setSubmissionType('');
          setNotes('');
          setSuppliesReceived(false);
          setSuppliesNote('');
          fetchInventory();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 3000);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit inventory');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit inventory');
    } finally {
      setSubmitting(false);
    }
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

  const criticalItems = getCriticalItems();
  const filteredCategories = getFilteredCategories();

  return (
      <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
        {/* Header */}
        <div className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4">
                  <img
                      src="/sweetdotsfavicon-removebg-preview.png"
                      alt="Sweet Dots Logo"
                      className="w-30 h-30 object-cover"
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
                    onClick={() => router.push('/history')}
                    className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50"
                >
                  📊 History
                </button>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => router.push('/admin')}
                        className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50"
                    >
                      ⚙️ Admin
                    </button>
                )}
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
          {/* Success Message */}
          {showSuccess && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-lg fade-in">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">✅</span>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">Inventory Submitted Successfully!</h3>
                    <p className="text-green-700">Email report has been sent to management.</p>
                  </div>
                </div>
              </div>
          )}

          {/* Submission Type Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#9a3412' }}>Select Shift Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                  onClick={() => setSubmissionType('morning')}
                  className={`py-6 rounded-xl font-bold text-xl transition-all ${
                      submissionType === 'morning'
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                          : 'bg-orange-50 text-orange-600 border-2 border-orange-200'
                  }`}
              >
                ☀️ Morning
              </button>
              <button
                  onClick={() => setSubmissionType('night')}
                  className={`py-6 rounded-xl font-bold text-xl transition-all ${
                      submissionType === 'night'
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                          : 'bg-orange-50 text-orange-600 border-2 border-orange-200'
                  }`}
              >
                🌙 Night
              </button>
            </div>
          </div>

          {/* Critical Items */}
          {criticalItems.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 mb-6 shadow-lg pulse">
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                  🚨 Critically Low Items ({criticalItems.length})
                </h2>
                <div className="space-y-3">
                  {criticalItems.map(item => (
                      <div key={item.id} className="bg-white rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-red-700">{item.name}</p>
                          <p className="text-sm text-red-600">{item.categoryName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-700">{item.currentQuantity}</p>
                          <p className="text-sm text-red-600">Need: {item.parLevel}</p>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" size={20} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items..."
                    className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-orange-200 bg-orange-50 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-600"
                    >
                      <X size={20} />
                    </button>
                )}
              </div>
              <button
                  onClick={() => {
                    localStorage.removeItem('inventoryQuantities');
                    fetchInventory();
                  }}
                  className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold whitespace-nowrap"
              >
                🔄 Reset Values
              </button>
            </div>
            {searchQuery && (
                <p className="mt-2 text-sm text-orange-600">
                  Found {filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)} items
                </p>
            )}
          </div>

          {/* Inventory by Category */}
          <div className="space-y-6">
            {filteredCategories.map(category => (
                <div key={category.name} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: '#f97316' }}>
                    <h3 className="text-xl font-bold text-white">
                      {category.name} ({category.items.length} items)
                    </h3>
                  </div>

                  <div className="p-6 space-y-4">
                    {category.items.map(item => {
                      const isCritical = quantities[item.id] < item.parLevel;
                      return (
                          <div
                              key={item.id}
                              className={`p-4 rounded-xl border-2 ${
                                  isCritical ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-200'
                              }`}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex-1">
                                <h4 className={`font-bold text-lg ${isCritical ? 'text-red-700' : 'text-orange-900'}`}>
                                  {item.name}
                                </h4>
                                <p className={`text-sm ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>
                                  Par Level: {item.parLevel}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-16 h-16 rounded-xl bg-orange-500 text-white text-3xl font-bold hover:bg-orange-600 active:scale-95 shadow-lg"
                              >
                                −
                              </button>

                              <input
                                  type="number"
                                  value={quantities[item.id] || 0}
                                  onChange={(e) => setDirectQuantity(item.id, e.target.value)}
                                  className="flex-1 text-center text-3xl font-bold py-4 rounded-xl border-2 border-orange-300 bg-white"
                                  style={{ color: '#9a3412' }}
                              />

                              <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-16 h-16 rounded-xl bg-orange-500 text-white text-3xl font-bold hover:bg-orange-600 active:scale-95 shadow-lg"
                              >
                                +
                              </button>
                            </div>
                          </div>
                      );
                    })}
                  </div>
                </div>
            ))}
          </div>

          {/* Submission Section - NOW AT BOTTOM */}
          <div className="mt-8 bg-white border-2 border-orange-500 rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#9a3412' }}>Submit Inventory</h2>

            {/* Supplies Checkbox */}
            <div className="mb-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={suppliesReceived}
                    onChange={(e) => setSuppliesReceived(e.target.checked)}
                    className="w-6 h-6 rounded"
                />
                <span className="text-lg font-semibold" style={{ color: '#9a3412' }}>
                ☑️ Supplies received today
              </span>
              </label>
              {suppliesReceived && (
                  <input
                      type="text"
                      value={suppliesNote}
                      onChange={(e) => setSuppliesNote(e.target.value)}
                      placeholder="What was received?"
                      className="mt-3 w-full px-4 py-3 rounded-lg border-2 border-orange-200 bg-orange-50"
                  />
              )}
            </div>

            {/* Employee Name */}
            <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 bg-orange-50 mb-4 text-lg"
                required
            />

            {/* Notes */}
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes (optional)"
                className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 bg-orange-50 mb-4 text-lg"
                rows={3}
            />

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={submitting || !submissionType}
                className="w-full py-6 rounded-xl text-white font-bold text-2xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-98"
                style={{
                  background: submitting || !submissionType
                      ? '#9a3412'
                      : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                }}
            >
              {submitting ? '📤 Submitting...' : '✅ Submit Inventory'}
            </button>
          </div>

          {/* Bottom padding for breathing room */}
          <div className="h-8"></div>
        </div>
      </div>
  );
}
