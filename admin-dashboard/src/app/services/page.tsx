"use client";

import { useState, useEffect } from 'react';
import { Scissors, Plus, Settings, TrendingUp, Filter, Search, Trash2, Edit3 } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { apiRequest } from '@/services/api';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newMainCategoryName, setNewMainCategoryName] = useState('');
  const [isAddingInlineCategory, setIsAddingInlineCategory] = useState(false);
  const [inlineCategoryName, setInlineCategoryName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    duration: '',
    description: '',
    followUpDays: 0,
    branch: 'SALON',
    isActive: true
  });

  const [search, setSearch] = useState("");

  const fetchServices = async () => {
    try {
      const json = await apiRequest(`/services?search=${search}`);
      if (json.success) setServices(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const json = await apiRequest('/categories');
      if (json.success) setCategories(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await apiRequest(`/services/${id}`, { method: 'DELETE' });
      if (res.success) fetchServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleOpenModal = (service: any = null) => {
    setIsAddingInlineCategory(false);
    setInlineCategoryName('');
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name || '',
        description: service.description || '',
        category: service.category || (categories[0]?.name || ''),
        duration: service.duration || '',
        price: service.price || '',
        branch: service.branch || 'SALON',
        followUpDays: service.followUpDays || 0,
        isActive: service.isActive !== undefined ? service.isActive : true
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        category: categories[0]?.name || '',
        price: '',
        duration: '',
        description: '',
        followUpDays: 0,
        branch: 'SALON',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingService ? `/services/${editingService._id}` : '/services';
      const method = editingService ? 'PUT' : 'POST';
      const submitData = { ...formData, price: Number(formData.price), duration: Number(formData.duration) };
      const res = await apiRequest(endpoint, {
        method,
        body: submitData
      });
      if (res.success) {
        setIsModalOpen(false);
        fetchServices();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await apiRequest('/categories', {
        method: 'POST',
        body: { 
          name: newCategoryName.trim(),
          mainCategory: newMainCategoryName.trim() || 'General'
        }
      });
      if (res.success) {
        setNewCategoryName('');
        setNewMainCategoryName('');
        fetchCategories();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Services in this category will remain unchanged.')) return;
    try {
      const res = await apiRequest(`/categories/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchCategories();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleCreateInlineCategory = async () => {
    if (!inlineCategoryName.trim()) return;
    try {
      const res = await apiRequest('/categories', {
        method: 'POST',
        body: { name: inlineCategoryName.trim() }
      });
      if (res.success) {
        const newCat = res.data;
        await fetchCategories();
        setFormData(prev => ({ ...prev, category: newCat.name }));
        setInlineCategoryName('');
        setIsAddingInlineCategory(false);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add category');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.sectionHeader} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h2 className={styles.title}>Service Repository</h2>
           <p className={styles.subtitle}>Configure your salon & clinic service menu, dynamic pricing, and bundled packages.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button 
             onClick={() => setIsCategoryModalOpen(true)}
             style={{ 
               background: 'transparent', 
               color: 'var(--primary)', 
               padding: '12px 24px', 
               borderRadius: '16px', 
               fontWeight: 800,
               border: '2px solid var(--primary)',
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               gap: '8px'
            }}>
               <Settings size={20} />
               <span>Categories</span>
            </button>
           <button 
             onClick={() => handleOpenModal()}
             style={{ 
               background: 'var(--primary)', 
               color: 'white', 
               padding: '12px 24px', 
               borderRadius: '16px', 
               fontWeight: 800,
               border: 'none',
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               gap: '8px'
            }}>
               <Scissors size={20} />
               <span>Catalog New Service</span>
            </button>
        </div>
      </header>

      <div className={cardStyles.card} style={{ flexDirection: 'row', padding: '12px 20px', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
         <Search size={20} color="var(--text-muted)" />
         <input 
            type="text" 
            placeholder="Search services..."
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '15px', color: 'var(--text-main)', fontWeight: 600 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
         />
      </div>

      <Table 
        columns={[
          { key: 'name', label: 'Item Description', render: (val) => (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  background: 'rgba(255, 59, 48, 0.08)', 
                  color: 'var(--primary)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                   {val.category === 'Package' ? <TrendingUp size={18} /> : <Scissors size={18} />}
                </div>
                <div>
                   <p style={{ fontWeight: 800, fontSize: '15px' }}>{val.name}</p>
                   <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{val.category}</p>
                </div>
             </div>
          )},
          { key: 'duration', label: 'Duration Allocation', render: (val) => (
             <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{val.duration} Mins</span>
          )},
          { key: 'price', label: 'Commercial Value', render: (val) => (
             <span style={{ fontWeight: 900, fontSize: '1.25rem' }}>₹{val.price}</span>
          )},
          { key: 'branch', label: 'Branch', render: (val) => (
             <span style={{ 
               background: val.branch === 'SALON' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(0, 122, 255, 0.1)', 
               color: val.branch === 'SALON' ? 'var(--primary)' : '#007AFF', 
               padding: '4px 12px', 
               borderRadius: '12px', 
               fontSize: '12px', 
               fontWeight: 800 
             }}>
               {val.branch}
             </span>
          )},
          { key: 'isActive', label: 'Market Availability', render: (val) => (
             <span style={{ 
               background: val.isActive ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
               color: val.isActive ? '#34C759' : '#FF9500',
               padding: '4px 12px',
               borderRadius: '12px',
               fontSize: '12px',
               fontWeight: 800,
               textTransform: 'uppercase'
             }}>{val.isActive ? 'In-Market' : 'Suspended'}</span>
          )},
          { key: 'actions', label: 'Configuration', render: (val) => (
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px' }} 
                  title="Modify Pricing"
                  onClick={() => handleOpenModal(val)}
                >
                   <Edit3 size={18} />
                </button>
                <button 
                  className={styles.pageBtn} 
                  style={{ padding: '6px', color: 'var(--primary)' }} 
                  title="Delete Service"
                  onClick={() => handleDelete(val._id)}
                >
                   <Trash2 size={18} />
                </button>
             </div>
          )}
        ]}
        data={services}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? 'Edit Service' : 'Catalog New Service'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Service Name</label>
            <input 
              required
              className={styles.input}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Classic Haircut"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexFlow: 'row' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Price (₹)</label>
              <input 
                type="number"
                required
                className={styles.input}
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Duration (mins)</label>
              <input 
                type="number"
                required
                className={styles.input}
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Category</label>
                <button 
                  type="button" 
                  onClick={() => setIsAddingInlineCategory(!isAddingInlineCategory)}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--primary)', 
                    fontWeight: 700, 
                    fontSize: '0.85rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <Plus size={14} /> Add New
                </button>
              </div>
              
              {isAddingInlineCategory ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text"
                    className={styles.input}
                    placeholder="Category name..."
                    value={inlineCategoryName}
                    onChange={e => setInlineCategoryName(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button"
                    onClick={handleCreateInlineCategory}
                    style={{ 
                      background: 'var(--primary)', 
                      color: 'white', 
                      padding: '0 12px', 
                      borderRadius: '12px', 
                      fontWeight: 700, 
                      border: 'none',
                      cursor: 'pointer' 
                    }}
                  >
                    Save
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddingInlineCategory(false);
                      setInlineCategoryName('');
                    }}
                    style={{ 
                      background: 'var(--bg-main)', 
                      color: 'var(--text-muted)', 
                      padding: '0 12px', 
                      borderRadius: '12px', 
                      fontWeight: 700, 
                      border: '1px solid var(--border-light)',
                      cursor: 'pointer' 
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <select 
                  className={styles.input}
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Branch</label>
              <select
                className={styles.input}
                value={formData.branch}
                onChange={e => setFormData({...formData, branch: e.target.value})}
              >
                <option value="SALON">Salon</option>
                <option value="CLINIC">Clinic</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Description</label>
            <textarea 
              className={styles.input}
              style={{ minHeight: '80px', paddingTop: '8px' }}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={e => setFormData({...formData, isActive: e.target.checked})}
            />
            <label htmlFor="isActive" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Service is Active</label>
          </div>

          <button 
            type="submit"
            style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '12px', 
              fontWeight: 700,
              border: 'none',
              marginTop: '1rem',
              cursor: 'pointer'
            }}
          >
            {editingService ? 'Update Service' : 'Catalog Service'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Manage Categories">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                className={styles.input}
                placeholder="Main Category (e.g. Hair)..."
                value={newMainCategoryName}
                onChange={e => setNewMainCategoryName(e.target.value)}
                style={{ flex: 1 }}
              />
              <input 
                required
                className={styles.input}
                placeholder="Sub Category name (e.g. Haircut)..."
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                style={{ flex: 2 }}
              />
              <button 
                type="submit"
                style={{ 
                  background: 'var(--primary)', 
                  color: 'white', 
                  padding: '0 20px', 
                  borderRadius: '12px', 
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </form>

          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {categories.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No categories found. Add one above!</p>
            ) : (
              categories.map((cat: any) => (
                <div 
                  key={cat._id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 16px', 
                    background: 'var(--bg-card)', 
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Main: {cat.mainCategory || 'General'}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleDeleteCategory(cat._id)}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--primary)', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
