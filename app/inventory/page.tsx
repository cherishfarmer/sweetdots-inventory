'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

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
        
        // Initialize quantities
        const initialQuantities: Record<string, number> = {};
        transformed.forEach(cat => {
          cat.items.forEach(item => {
            initialQuantities[item.id] = item.currentQuantity;
          });
        });
        setQuantities(initialQuantities);
        
        // Expand all categories by default
        setExpandedCategories(new Set(transformed.map(c => c.name)));
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

  const updateQuantity = (itemId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change),
    }));
  };

  const setDirectQuantity = (itemId: string, value: string) => {
    const num = parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, num),
    }));
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
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
        setTimeout(() => {
          setShowSuccess(false);
          // Reset form
          setSubmissionType('');
          setNotes('');
          setSuppliesReceived(false);
          setSuppliesNote('');
          fetchInventory();
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
          <div className="animate-spin text-6xl mb-4">🍩</div>
          <p style={{ color: '#9a3412' }} className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  const criticalItems = getCriticalItems();

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
                <p className="text-orange-100 text-sm">Update Inventory</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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

      <div className="max-w-7xl mx-auto px-4 py-6 pb-32">
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

        {/* Inventory by Category */}
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category.name} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-orange-50 transition-colors"
                style={{ backgroundColor: expandedCategories.has(category.name) ? '#f97316' : 'white' }}
              >
                <h3 className={`text-xl font-bold ${expandedCategories.has(category.name) ? 'text-white' : 'text-orange-700'}`}>
                  {category.name} ({category.items.length})
                </h3>
                <span className={`text-2xl ${expandedCategories.has(category.name) ? 'text-white' : 'text-orange-600'}`}>
                  {expandedCategories.has(category.name) ? '▼' : '▶'}
                </span>
              </button>

              {expandedCategories.has(category.name) && (
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
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Submission Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-orange-500 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
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
            rows={2}
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
      </div>
    </div>
  );
}
