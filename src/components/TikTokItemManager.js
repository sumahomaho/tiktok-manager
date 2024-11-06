import React, { useState, useEffect } from 'react';
import { Trash2, Gift, UserPlus, Users, X, Edit2, Check } from 'lucide-react';
import { ref, onValue, set, push, update } from 'firebase/database';
import { db } from '../firebase/config';

const ITEMS = ['🥊', '☁️', '⏰️', '⚒️'];
const JST_OFFSET_MINUTES = 9 * 60;

// ContributorModalコンポーネント
const ContributorModal = ({ isOpen, onClose, contributors, setContributors }) => {
  const [newContributor, setNewContributor] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newContributor.trim() && !contributors.includes(newContributor.trim())) {
      const contributorRef = ref(db, 'contributors');
      const updatedContributors = [...contributors, newContributor.trim()];
      set(contributorRef, updatedContributors);
      setNewContributor('');
    }
  };

  const handleDelete = (contributor) => {
    try {
      const contributorRef = ref(db, 'contributors');
      const updatedContributors = contributors.filter(c => c !== contributor);
      set(contributorRef, updatedContributors);
    } catch (error) {
      console.error('Error deleting contributor:', error);
    }
  };

  // ... 残りのコード（変更なし）

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

const ItemAddModal = ({ isOpen, onClose, contributors, addItem }) => {
  const [newItem, setNewItem] = useState(() => {
    // 現在時刻を取得し、日本時間に変換
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // 日本時間のISO文字列を作成
    const jstTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;

    // contributorsが空の場合のデフォルト値を設定
    return {
      contributor: contributors && contributors.length > 0 ? contributors[0] : 'ユーザー1',
      item: ITEMS[0],
      acquisitionTime: jstTimeString
    };
  });

  // useEffectを追加してcontributorsの変更を監視
  useEffect(() => {
    if (contributors && contributors.length > 0 && !contributors.includes(newItem.contributor)) {
      setNewItem(prev => ({
        ...prev,
        contributor: contributors[0]
      }));
    }
  }, [contributors]);

  if (!isOpen) return null;

  // handleAddの修正
  const handleAdd = () => {
    // 値の存在確認を追加
    if (!newItem.contributor || !newItem.item || !newItem.acquisitionTime) {
      alert('必要な情報が不足しています');
      return;
    }
    addItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">アイテム追加</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">ユーザー</label>
            <select
              value={newItem.contributor}
              onChange={(e) => setNewItem({...newItem, contributor: e.target.value})}
              className="w-full p-2 border rounded"
            >
              {contributors.map(contributor => (
                <option key={contributor} value={contributor}>
                  {contributor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">アイテム</label>
            <select
              value={newItem.item}
              onChange={(e) => setNewItem({...newItem, item: e.target.value})}
              className="w-full p-2 border rounded"
            >
              {ITEMS.map(itemOption => (
                <option key={itemOption} value={itemOption}>
                  {itemOption}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">取得日時</label>
            <input
              type="datetime-local"
              value={newItem.acquisitionTime}
              onChange={(e) => setNewItem({...newItem, acquisitionTime: e.target.value})}
              className="w-full p-2 border rounded"
              step="60"
            />
          </div>

          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Gift className="w-4 h-4" />
            追加
          </button>
        </div>
      </div>
    </div>
  );
};
// メインのTikTokItemManagerコンポーネント
const TikTokItemManager = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isItemAddModalOpen, setIsItemAddModalOpen] = useState(false);
  const [isContributorModalOpen, setIsContributorModalOpen] = useState(false);
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    try {
      // アイテムのリアルタイム同期
      const itemsRef = ref(db, 'items');
      const unsubscribeItems = onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const itemsArray = Object.entries(data).map(([key, value]) => ({
            ...value,
            id: key
          }));
          setItems(itemsArray);
        } else {
          setItems([]);
        }
      });
  
      // ユーザーのリアルタイム同期
      const contributorsRef = ref(db, 'contributors');
      const unsubscribeContributors = onValue(contributorsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setContributors(Object.values(data));
        } else {
          setContributors(['ユーザー1', 'ユーザー2', 'ユーザー3', 'ユーザー4', 'ユーザー5']);
        }
      });
  
      return () => {
        unsubscribeItems();
        unsubscribeContributors();
      };
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, []); // 依存配列を空に

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

  const addItem = async (newItemData) => {
    try {
      // データの存在確認を追加
      if (!newItemData.contributor || !newItemData.item || !newItemData.acquisitionTime) {
        throw new Error('必要な情報が不足しています');
      }
  
      const itemsRef = ref(db, 'items');
      const result = await push(itemsRef, {
        contributor: newItemData.contributor,
        item: newItemData.item,
        acquisitionTime: newItemData.acquisitionTime,
        expiryTime: new Date(new Date(newItemData.acquisitionTime).getTime() + 120 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date().toISOString()
      });
      console.log('Item added successfully:', result);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('アイテムの追加に失敗しました: ' + error.message);
    }
  };

  const updateItem = (id, field, value) => {
    try {
      const itemRef = ref(db, `items/${id}`);
      const updates = {};
      
      if (field === 'acquisitionTime') {
        const inputDate = new Date(value);
        const newExpiryTime = new Date(inputDate.getTime() + 120 * 60 * 60 * 1000);
        updates[field] = inputDate.toISOString();
        updates.expiryTime = newExpiryTime.toISOString();
      } else {
        updates[field] = value;
      }
      
      update(itemRef, updates);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error('Invalid date');

      const pad = (num) => String(num).padStart(2, '0');
      
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      
      return {
        date: `${month}/${day}`,
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
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting input date:', error);
      return '';
    }
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
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">TikTokアイテム管理</h1>
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
          <button 
  onClick={() => {
    if (selectedItems.length > 0) {
      if (window.confirm('選択したアイテムを削除しますか？')) {
        try {
          // Firebase上でのアイテム削除
          const updates = {};
          selectedItems.forEach(id => {
            updates[`items/${id}`] = null;
          });
          update(ref(db), updates);
          setSelectedItems([]);
        } catch (error) {
          console.error('Error deleting items:', error);
        }
      }
    }
  }}
  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
>
  <Trash2 className="w-4 h-4" />
  アイテム削除 {selectedItems.length > 0 && `(${selectedItems.length})`}
</button>
        </div>
      </div>

      <div className="overflow-x-scroll lg:overflow-x-auto">
  <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-center border-b whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={items.length > 0 && selectedItems.length === items.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(items.map(item => item.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  className="w-4 h-4"
                />
              </th>
              <th className="px-4 py-2 text-left border-b whitespace-nowrap">ユーザー</th>
              <th className="px-4 py-2 text-left border-b whitespace-nowrap">アイテム</th>
              <th className="px-4 py-2 text-left border-b whitespace-nowrap">残り時間</th>
              <th className="px-4 py-2 text-center border-b whitespace-nowrap">
  <div className="flex flex-col gap-1">
    <div>取得日時</div>
    <div className="text-gray-600">使用期限</div>
  </div>
</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b text-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                <select
  value={item.contributor}
  onChange={(e) => updateItem(item.id, 'contributor', e.target.value)}
  className="w-full p-1 border rounded text-sm truncate"
  style={{ maxWidth: '120px' }}
>
  {contributors.map(contributor => (
    <option key={contributor} value={contributor}>
      {contributor.length > 10 ? `${contributor.slice(0, 10)}...` : contributor}
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
    {getRemainingTime(item.expiryTime)}
  </div>
</td> 
<td className="px-4 py-2 border-b">
  <div className="flex flex-col gap-1">
    <input
      type="datetime-local"
      value={formatInputDateTime(item.acquisitionTime)}
      onChange={(e) => updateItem(item.id, 'acquisitionTime', e.target.value)}
      className="w-full p-1 border rounded text-sm"
      style={{ maxWidth: '150px' }}
      step="60"
    />
    <div className="text-sm text-gray-600 text-center whitespace-nowrap">
      {formatDateTime(item.expiryTime).date} {formatDateTime(item.expiryTime).time}
    </div>
  </div>
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