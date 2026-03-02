'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Snapshot {
  itemName: string;
  categoryName: string;
  quantity: number;
  parLevel: number;
}

interface Submission {
  id: string;
  submissionType: 'morning' | 'night';
  submittedAt: string;
  submissionDate: string;
  employeeName: string;
  notes: string | null;
  suppliesReceived: boolean;
  suppliesNote: string | null;
  snapshots?: Snapshot[];
}

export default function HistoryPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'morning' | 'night'>('all');
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user) {
      fetchSubmissions();
    }
  }, [user, authLoading, filter]);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/submissions?type=${filter}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
        setCurrentIndex(0);
        
        // Load first submission details
        if (data.submissions.length > 0) {
          loadSubmissionDetail(data.submissions[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissionDetail = async (submissionId: string) => {
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/submissions/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the submission with snapshots
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, snapshots: data.snapshots }
            : sub
        ));
      }
    } catch (error) {
      console.error('Failed to load submission detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      if (!submissions[newIndex].snapshots) {
        loadSubmissionDetail(submissions[newIndex].id);
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < submissions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      if (!submissions[newIndex].snapshots) {
        loadSubmissionDetail(submissions[newIndex].id);
      }
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

  const currentSubmission = submissions[currentIndex];

  // Group snapshots by category
  const snapshotsByCategory: Record<string, Snapshot[]> = {};
  if (currentSubmission?.snapshots) {
    currentSubmission.snapshots.forEach(snapshot => {
      if (!snapshotsByCategory[snapshot.categoryName]) {
        snapshotsByCategory[snapshot.categoryName] = [];
      }
      snapshotsByCategory[snapshot.categoryName].push(snapshot);
    });
  }

  const criticalItems = currentSubmission?.snapshots?.filter(s => s.quantity < s.parLevel) || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">🧋</span>
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
                  Sweet Dots
                </h1>
                <p className="text-orange-100 text-sm">Inventory History</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/inventory')}
                className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50"
              >
                ✏️ Update
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="px-6 py-3 bg-orange-800 text-white rounded-lg font-semibold hover:bg-orange-900"
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
        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`py-4 rounded-xl font-bold text-lg transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-orange-50 text-orange-600'
              }`}
            >
              All Shifts
            </button>
            <button
              onClick={() => setFilter('morning')}
              className={`py-4 rounded-xl font-bold text-lg transition-all ${
                filter === 'morning'
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-orange-50 text-orange-600'
              }`}
            >
              ☀️ Morning
            </button>
            <button
              onClick={() => setFilter('night')}
              className={`py-4 rounded-xl font-bold text-lg transition-all ${
                filter === 'night'
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-orange-50 text-orange-600'
              }`}
            >
              🌙 Night
            </button>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-2xl" style={{ color: '#9a3412' }}>No submissions found</p>
            <p className="text-orange-600 mt-2">Submit your first inventory to see history here</p>
          </div>
        ) : (
          <>
            {/* Navigation */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="px-8 py-4 bg-orange-500 text-white rounded-xl font-bold text-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-600 transition-all active:scale-95"
                >
                  ← Previous
                </button>

                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#9a3412' }}>
                    {currentIndex + 1} of {submissions.length}
                  </p>
                  <p className="text-orange-600">
                    {currentSubmission && format(new Date(currentSubmission.submissionDate), 'MMMM dd, yyyy')}
                  </p>
                </div>

                <button
                  onClick={goToNext}
                  disabled={currentIndex === submissions.length - 1}
                  className="px-8 py-4 bg-orange-500 text-white rounded-xl font-bold text-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-600 transition-all active:scale-95"
                >
                  Next →
                </button>
              </div>
            </div>

            {loadingDetail ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="animate-spin text-6xl mb-4">🧋</div>
                <p style={{ color: '#9a3412' }} className="text-lg">Loading snapshot...</p>
              </div>
            ) : currentSubmission ? (
              <>
                {/* Submission Info */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-6 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-orange-700 uppercase">Shift Type</p>
                      <p className="text-xl font-bold" style={{ color: '#9a3412' }}>
                        {currentSubmission.submissionType === 'morning' ? '☀️ Morning' : '🌙 Night'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-700 uppercase">Submitted By</p>
                      <p className="text-xl font-bold" style={{ color: '#9a3412' }}>
                        {currentSubmission.employeeName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-700 uppercase">Time</p>
                      <p className="text-xl font-bold" style={{ color: '#9a3412' }}>
                        {format(new Date(currentSubmission.submittedAt), 'h:mm a')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-700 uppercase">Supplies</p>
                      <p className="text-xl font-bold" style={{ color: '#9a3412' }}>
                        {currentSubmission.suppliesReceived ? '✓ Yes' : '✗ No'}
                      </p>
                    </div>
                  </div>

                  {currentSubmission.suppliesReceived && currentSubmission.suppliesNote && (
                    <div className="mt-4 p-4 bg-white rounded-lg">
                      <p className="text-sm font-semibold text-orange-700 uppercase">What Was Received</p>
                      <p className="text-lg" style={{ color: '#9a3412' }}>{currentSubmission.suppliesNote}</p>
                    </div>
                  )}

                  {currentSubmission.notes && (
                    <div className="mt-4 p-4 bg-white rounded-lg">
                      <p className="text-sm font-semibold text-orange-700 uppercase">Notes</p>
                      <p className="text-lg" style={{ color: '#9a3412' }}>{currentSubmission.notes}</p>
                    </div>
                  )}
                </div>

                {/* Critical Items */}
                {criticalItems.length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 mb-6 shadow-lg">
                    <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                      🚨 Critical Items at Submission ({criticalItems.length})
                    </h2>
                    <div className="space-y-3">
                      {criticalItems.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-red-700">{item.itemName}</p>
                            <p className="text-sm text-red-600">{item.categoryName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-red-700">{item.quantity}</p>
                            <p className="text-sm text-red-600">Need: {item.parLevel}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inventory Snapshot by Category */}
                <div className="space-y-4">
                  {Object.entries(snapshotsByCategory).map(([categoryName, items]) => (
                    <div key={categoryName} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      <div className="px-6 py-4" style={{ backgroundColor: '#f97316' }}>
                        <h3 className="text-xl font-bold text-white">
                          {categoryName} ({items.length})
                        </h3>
                      </div>

                      <div className="p-6 space-y-3">
                        {items.map((item, idx) => {
                          const isCritical = item.quantity < item.parLevel;
                          return (
                            <div
                              key={idx}
                              className={`p-4 rounded-xl flex justify-between items-center ${
                                isCritical ? 'bg-red-50 border-2 border-red-300' : 'bg-orange-50'
                              }`}
                            >
                              <div className="flex-1">
                                <p className={`font-bold text-lg ${isCritical ? 'text-red-700' : 'text-orange-900'}`}>
                                  {item.itemName}
                                </p>
                                <p className={`text-sm ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>
                                  Par: {item.parLevel}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-3xl font-bold ${isCritical ? 'text-red-700' : 'text-orange-700'}`}>
                                  {item.quantity}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
