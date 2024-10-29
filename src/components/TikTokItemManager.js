import React, { useState, useEffect } from 'react';
import { Trash2, Clock, Gift, UserPlus, Users, X, Edit2, Check } from 'lucide-react';

const ITEMS = ['🥊', '☁️', '⏰️', '⚒️'];

// 日本時間のオフセット（分）
const JST_OFFSET_MINUTES = 9 * 60;

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

  const [isItemAddModalOpen, setIsItemAddModalOpen] = useState(false);

  const [contributors, setContributors] = useState(() => {
    try {
      const savedContributors = localStorage.getItem('tiktokContributors');
      return savedContributors ? JSON.parse(savedContributors) : [
        'ユーザー1',
        'ユーザー2',
        'ユーザー3',
        'ユーザー4',
        'ユーザー5'
      ];
    } catch (error) {
      console.error('Error loading contributors:', error);
      return ['ユーザー1', 'ユーザー2', 'ユーザー3', 'ユーザー4', 'ユーザー5'];
    }
  });

  const [isContributorModalOpen, setIsContributorModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('tiktokItems', JSON.stringify(items));
      localStorage.setItem('tiktokContributors', JSON.stringify(contributors));

      const interval = setInterval(() => {
        setItems(currentItems => 
          currentItems.filter(item => {
            try {
              const expiryTime = new Date(item.expiryTime).getTime();
              return expiryTime > Date.now();
            } catch (error) {
              console.error('Error checking expiry:', error);
              return false;
            }
          })
        );
      }, 60000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, [items, contributors]);

  const getJapanDateTime = () => {
    try {
      const now = new Date();
      const userOffset = now.getTimezoneOffset();
      const totalOffset = userOffset + JST_OFFSET_MINUTES;
      return new Date(now.getTime() + totalOffset * 60000);
    } catch (error) {
      console.error('Error getting Japan time:', error);
      return new Date();
    }
  };

  const addItem = (newItemData) => {
    try {
      const inputDate = new Date(newItemData.acquisitionTime);
      const userOffset = inputDate.getTimezoneOffset();
      const totalOffset = userOffset + JST_OFFSET_MINUTES;
      const adjustedTime = new Date(inputDate.getTime() + totalOffset * 60000);
      const expiryTime = new Date(adjustedTime.getTime() + 120 * 60 * 60 * 1000);
  
      const newItem = {
        id: Date.now(),
        contributor: newItemData.contributor,
        item: newItemData.item,
        acquisitionTime: adjustedTime.toISOString(),
        expiryTime: expiryTime.toISOString(),
      };
  
      setItems(prevItems => [...prevItems, newItem]);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const deleteItem = (id) => {
    try {
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const updateItem = (id, field, value) => {
    try {
      setItems(prevItems => prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          if (field === 'acquisitionTime') {
            const inputDate = new Date(value);
            const userOffset = inputDate.getTimezoneOffset();
            const totalOffset = userOffset + JST_OFFSET_MINUTES;
            const adjustedTime = new Date(inputDate.getTime() + totalOffset * 60000);
            const newExpiryTime = new Date(adjustedTime.getTime() + 120 * 60 * 60 * 1000);
            
            updatedItem.acquisitionTime = adjustedTime.toISOString();
            updatedItem.expiryTime = newExpiryTime.toISOString();
          }
          
          return updatedItem;
        }
        return item;
      }));
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
  
      const pad = (num) => String(num).padStart(2, '0');
      
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      
      return {
        date: `${month}/${day}`,  // 年を削除
        time: `${hours}:${minutes}`
      };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  const formatInputDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      
      const userOffset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - userOffset * 60000);
      return adjustedDate.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Error formatting input date:', error);
      return '';
    }
  };

  const getRemainingTime = (expiryTime) => {
    try {
      const remaining = new Date(expiryTime).getTime() - Date.now();
      if (remaining <= 0) return '期限切れ';
      
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${days}日${hours}時間${minutes}分`;
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return '計算エラー';
    }
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
      onClick={() => setIsItemAddModalOpen(true)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      <Gift className="w-4 h-4" />
      アイテム追加
    </button>
    {items.length > 0 && (
    <button 
    onClick={() => {
      if (window.confirm('全てのアイテムを削除しますか？')) {
        setItems([]);
      }
    }}
    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
  >
    <Trash2 className="w-4 h-4" />
    全削除
  </button>  
    )}
  </div>
</div>

      <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
      <thead className="bg-gray-50">
  <tr>
    <th className="px-4 py-2 text-left border-b whitespace-nowrap">ユーザー</th>
    <th className="px-4 py-2 text-left border-b whitespace-nowrap">アイテム</th>
    <th className="px-4 py-2 text-left border-b whitespace-nowrap">残り時間</th>
    <th className="px-4 py-2 text-center border-b whitespace-nowrap">使用期限</th>
    <th className="px-4 py-2 text-center border-b whitespace-nowrap">取得日時</th>
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
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Clock className="w-4 h-4 shrink-0" />
          {getRemainingTime(item.expiryTime)}
        </div>
      </td>
      <td className="px-4 py-2 border-b">
  <div className="flex flex-col items-center text-center min-w-[120px]">
    <div className="whitespace-nowrap">{formatDateTime(item.acquisitionTime).date}</div>
    <div className="whitespace-nowrap">{formatDateTime(item.acquisitionTime).time}</div>
  </div>
</td>
      <td className="px-4 py-2 border-b">
        <input
          type="datetime-local"
          value={formatInputDateTime(item.acquisitionTime)}
          onChange={(e) => updateItem(item.id, 'acquisitionTime', e.target.value)}
          className="p-2 border rounded text-center w-full"
          step="60"
        />
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
      <ItemAddModal
  isOpen={isItemAddModalOpen}
  onClose={() => setIsItemAddModalOpen(false)}
  contributors={contributors}
  addItem={addItem}
/>
    </div>
  );
};

export default TikTokItemManager;