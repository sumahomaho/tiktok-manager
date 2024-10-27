"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Clock, Gift, UserPlus, Settings, X, Plus, Edit2 } from 'lucide-react';

// アイテムの種類
const ITEMS = ['🥊', '☁️', '⏰️', '⚒️'];

const ContributorManager = ({ isOpen, onClose, contributors, setContributors }) => {
  // ContributorManagerの内容は変更なし
};

const TikTokItemManager = () => {
  // localStorage の使用を useEffect 内に移動
  const [items, setItems] = useState([]);
  const [contributors, setContributors] = useState([
    'ユーザー1',
    'ユーザー2',
    'ユーザー3',
    'ユーザー4',
    'ユーザー5'
  ]);

  const [isContributorManagerOpen, setIsContributorManagerOpen] = useState(false);

  // localStorageの読み込みをクライアントサイドでのみ実行
  useEffect(() => {
    // localStorageからデータを読み込む
    const savedItems = localStorage.getItem('tiktokItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }

    const savedContributors = localStorage.getItem('tiktokContributors');
    if (savedContributors) {
      setContributors(JSON.parse(savedContributors));
    }
  }, []);

  // 保存の処理
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, [items, contributors]);

  const addItem = () => {
    const now = new Date();
    const expiryTime = new Date(now.getTime() + 120 * 60 * 60 * 1000);

    const newItem = {
      id: Date.now(),
      contributor: contributors[0] || '',
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
          const newExpiryTime = new Date(newAcquisitionTime.getTime() + 120 * 60 * 60 * 1000);
          updatedItem.expiryTime = newExpiryTime.toISOString();
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日${date.getHours()}時${date.getMinutes()}分`;
  };

  const getRemainingTime = (expiryTime) => {
    const remaining = new Date(expiryTime).getTime() - Date.now();
    if (remaining <= 0) return '期限切れ';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}日${hours}時間${minutes}分`;
  };

  return (
    <div className="p-4 space-y-4 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">TikTok ライブバトルアイテム管理</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsContributorManagerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <Settings className="w-4 h-4" />
            取得者管理
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
              <th className="px-4 py-2 text-left border-b text-gray-800">アイテム取得者</th>
              <th className="px-4 py-2 text-left border-b text-gray-800">獲得アイテム</th>
              <th className="px-4 py-2 text-left border-b text-gray-800">残り時間</th>
              <th className="px-4 py-2 text-left border-b text-gray-800">使用期限</th>
              <th className="px-4 py-2 text-left border-b text-gray-800">取得日時</th>
              <th className="px-4 py-2 text-left border-b text-gray-800">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b text-gray-800">
                  <select
                    value={item.contributor}
                    onChange={(e) => updateItem(item.id, 'contributor', e.target.value)}
                    className="w-32 p-2 border rounded bg-white text-gray-800"
                  >
                    {contributors.map(contributor => (
                      <option key={contributor} value={contributor}>
                        {contributor}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 border-b text-gray-800">
                  <select
                    value={item.item}
                    onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                    className="w-20 p-2 border rounded bg-white text-gray-800"
                  >
                    {ITEMS.map(itemOption => (
                      <option key={itemOption} value={itemOption}>
                        {itemOption}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 border-b text-gray-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {getRemainingTime(item.expiryTime)}
                  </div>
                </td>
                <td className="px-4 py-2 border-b text-gray-800">{formatDateTime(item.expiryTime)}</td>
                <td className="px-4 py-2 border-b text-gray-800">
                  <input
                    type="datetime-local"
                    value={item.acquisitionTime.slice(0, 16)}
                    onChange={(e) => updateItem(item.id, 'acquisitionTime', e.target.value)}
                    className="p-2 border rounded bg-white text-gray-800"
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

      <ContributorManager 
        isOpen={isContributorManagerOpen}
        onClose={() => setIsContributorManagerOpen(false)}
        contributors={contributors}
        setContributors={setContributors}
      />
    </div>
  );
};

export default TikTokItemManager;