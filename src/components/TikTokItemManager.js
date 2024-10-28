import React, { useState, useEffect } from 'react';
import { Trash2, Clock, Gift, UserPlus, Users, X, Edit2, Check } from 'lucide-react';

const ITEMS = ['🥊', '☁️', '⏰️', '⚒️'];

const ContributorModal = ({ isOpen, onClose, contributors, setContributors }) => {
  const [newContributor, setNewContributor] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newContributor.trim() && !contributors.includes(newContributor.trim())) {
      setContributors([...contributors, newContributor.trim()]);
      setNewContributor('');
    }
  };

  const handleDelete = (contributor) => {
    setContributors(contributors.filter(c => c !== contributor));
  };

  const startEditing = (contributor) => {
    setEditingId(contributor);
    setEditingName(contributor);
  };

  const handleEdit = () => {
    if (editingName.trim() && !contributors.includes(editingName.trim())) {
      setContributors(contributors.map(c => 
        c === editingId ? editingName.trim() : c
      ));
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">ユーザー管理</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newContributor}
            onChange={(e) => setNewContributor(e.target.value)}
            placeholder="新規ユーザー名"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <UserPlus className="w-4 h-4" />
            追加
          </button>
        </div>

        <ul className="space-y-2">
          {contributors.map(contributor => (
            <li key={contributor} className="flex items-center gap-2 p-2 border rounded">
              {editingId === contributor ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 p-1 border rounded"
                    autoFocus
                  />
                  <button
                    onClick={handleEdit}
                    className="p-1 text-green-500 hover:bg-green-50 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{contributor}</span>
                  <button
                    onClick={() => startEditing(contributor)}
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contributor)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const TikTokItemManager = () => {
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('tiktokItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  const [contributors, setContributors] = useState(() => {
    const savedContributors = localStorage.getItem('tiktokContributors');
    return savedContributors ? JSON.parse(savedContributors) : [
      'ユーザー1',
      'ユーザー2',
      'ユーザー3',
      'ユーザー4',
      'ユーザー5'
    ];
  });

  const [isContributorModalOpen, setIsContributorModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tiktokItems', JSON.stringify(items));
    localStorage.setItem('tiktokContributors', JSON.stringify(contributors));

    const interval = setInterval(() => {
      setItems(currentItems => 
        currentItems.filter(item => {
          const expiryTime = new Date(item.expiryTime).getTime();
          return expiryTime > Date.now();
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [items, contributors]);

  const getJapanDateTime = () => {
    const now = new Date();
    const japanTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 60 * 60000));
    return japanTime;
  };

  const addItem = () => {
    const now = getJapanDateTime();
    const expiryTime = new Date(now.getTime() + 120 * 60 * 60 * 1000);

    const newItem = {
      id: Date.now(),
      contributor: contributors[0],
      item: ITEMS[0],
      acquisitionTime: now.toISOString(),
      expiryTime: expiryTime.toISOString(),
    };

    setItems([...items, newItem]);
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'acquisitionTime') {
          const newAcquisitionTime = new Date(value);
          const adjustedTime = new Date(newAcquisitionTime.getTime() + (9 * 60 * 60000));
          const newExpiryTime = new Date(adjustedTime.getTime() + 120 * 60 * 60 * 1000);
          updatedItem.acquisitionTime = adjustedTime.toISOString();
          updatedItem.expiryTime = newExpiryTime.toISOString();
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const japanTime = new Date(date.getTime());
    
    const pad = (num) => String(num).padStart(2, '0');
    
    const year = japanTime.getFullYear();
    const month = pad(japanTime.getMonth() + 1);
    const day = pad(japanTime.getDate());
    const hours = pad(japanTime.getHours());
    const minutes = pad(japanTime.getMinutes());
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  const getRemainingTime = (expiryTime) => {
    const remaining = new Date(expiryTime).getTime() - Date.now();
    if (remaining <= 0) return '期限切れ';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}日${hours}時間${minutes}分`;
  };

  // 入力フィールド用の時間フォーマット関数を追加
  const formatInputDateTime = (dateString) => {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() - (9 * 60 * 60000));
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">TikTok ライブバトルアイテム管理</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsContributorModalOpen(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <Users className="w-4 h-4" />
            ユーザー管理
          </button>
          <button 
            onClick={addItem} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Gift className="w-4 h-4" />
            新規アイテム追加
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left border-b">ユーザー</th>
              <th className="px-4 py-2 text-left border-b">アイテム</th>
              <th className="px-4 py-2 text-left border-b">残り時間</th>
              <th className="px-4 py-2 text-left border-b">使用期限</th>
              <th className="px-4 py-2 text-left border-b">取得日時</th>
              <th className="px-4 py-2 text-left border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  <select
                    value={item.contributor}
                    onChange={(e) => updateItem(item.id, 'contributor', e.target.value)}
                    className="w-32 p-2 border rounded"
                  >
                    {contributors.map(contributor => (
                      <option key={contributor} value={contributor}>
                        {contributor}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 border-b">
                  <select
                    value={item.item}
                    onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                    className="w-20 p-2 border rounded"
                  >
                    {ITEMS.map(itemOption => (
                      <option key={itemOption} value={itemOption}>
                        {itemOption}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {getRemainingTime(item.expiryTime)}
                  </div>
                </td>
                <td className="px-4 py-2 border-b">{formatDateTime(item.expiryTime)}</td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="datetime-local"
                    value={formatInputDateTime(item.acquisitionTime)}
                    onChange={(e) => updateItem(item.id, 'acquisitionTime', e.target.value)}
                    className="p-2 border rounded"
                    step="60"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContributorModal
        isOpen={isContributorModalOpen}
        onClose={() => setIsContributorModalOpen(false)}
        contributors={contributors}
        setContributors={setContributors}
      />
    </div>
  );
};

export default TikTokItemManager;