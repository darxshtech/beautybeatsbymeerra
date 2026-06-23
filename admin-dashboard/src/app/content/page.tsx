"use client";

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit3, Sparkles, ChevronRight, Star, Quote, Clock, ShieldCheck, Play } from 'lucide-react';
import styles from '@/styles/layout/Dashboard.module.css';
import cardStyles from '@/styles/components/Card.module.css';
import { apiRequest } from '@/services/api';
import Modal from '@/components/Modal';

export default function WebsiteContentManager() {
  const [contents, setContents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [previewBranch, setPreviewBranch] = useState<'SALON' | 'CLINIC'>('SALON');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Specific Modal Type Context
  const [modalTypeContext, setModalTypeContext] = useState<string>('HERO_SLIDE');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    type: 'HERO_SLIDE',
    branch: 'SALON',
    order: 0,
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/website-content');
      if (res.success) {
        setContents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const getBranchContent = (type: string) => contents.filter(c => c.type === type && (c.branch === previewBranch || c.branch === 'BOTH'));

  const heroSlides = getBranchContent('HERO_SLIDE');
  const activeSlide = heroSlides[activeSlideIndex] || null;
  const tourVideos = getBranchContent('TOUR_VIDEO');
  const waitFreeGallery = getBranchContent('WAIT_FREE_GALLERY');
  const beforeTransform = getBranchContent('TRANSFORMATION_BEFORE')[0];
  const afterTransform = getBranchContent('TRANSFORMATION_AFTER')[0];
  const reviews = getBranchContent('CUSTOMER_REVIEW');
  const welcomePopup = getBranchContent('WELCOME_POPUP')[0];

  useEffect(() => {
    if (activeSlideIndex >= (heroSlides.length || 1)) {
      setActiveSlideIndex(0);
    }
  }, [heroSlides.length, activeSlideIndex]);

  const handleOpenModal = (item: any = null, typeOverride: string = 'HERO_SLIDE') => {
    setModalTypeContext(typeOverride);
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        subtitle: item.subtitle || '',
        type: item.type || typeOverride,
        branch: item.branch || previewBranch,
        order: item.order || 0,
        isActive: item.isActive
      });
      setImageFile(null);
    } else {
      setEditingItem(null);
      setFormData({ 
        title: '', 
        subtitle: '', 
        type: typeOverride, 
        branch: previewBranch, 
        order: contents.filter(c => c.type === typeOverride).length, 
        isActive: true 
      });
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('bb_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const url = editingItem 
        ? `${baseUrl}/website-content/${editingItem._id}` 
        : `${baseUrl}/website-content`;
        
      const method = editingItem ? 'PUT' : 'POST';
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('branch', formData.branch);
      formDataToSend.append('order', formData.order.toString());
      formDataToSend.append('isActive', formData.isActive.toString());
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });
      
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchContent();
      } else {
        alert(json.message || 'Operation failed');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      const res = await apiRequest(`/website-content/${id}`, { method: 'DELETE' });
      if (res.success) fetchContent();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const VisualEditOverlay = ({ onClick, title = "Click to Edit", item = null }: any) => (
    <div 
      className="visual-edit-overlay"
      onClick={onClick}
      style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        color: 'white', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer', borderRadius: 'inherit'
      }}
    >
      <Edit3 size={32} style={{ marginBottom: '8px' }} />
      <span style={{ fontSize: '14px', fontWeight: 800 }}>{title}</span>
      {item && (
        <button 
          onClick={(e) => handleDelete(item._id, e)}
          style={{ marginTop: '12px', background: '#FF3B30', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Trash2 size={14} /> Delete
        </button>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <style>{`
        .visual-section { position: relative; border: 2px dashed transparent; transition: all 0.2s; }
        .visual-section:hover { border-color: var(--primary); }
        .visual-section:hover .visual-edit-overlay { opacity: 1 !important; }
        .edit-pulse { animation: pulseBorder 2s infinite; }
        @keyframes pulseBorder { 0% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(255, 59, 48, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); } }
      `}</style>
      
      <header className={styles.sectionHeader} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
           <h2 className={styles.title}>Visual Website Builder</h2>
           <p className={styles.subtitle}>Click any section on the canvas to update images, videos, and texts.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-muted)' }}>EDITING:</span>
          <button
            onClick={() => setPreviewBranch('SALON')}
            style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', border: '1px solid ' + (previewBranch === 'SALON' ? 'var(--primary)' : 'var(--border-light)'), background: previewBranch === 'SALON' ? 'rgba(255, 59, 48, 0.08)' : 'var(--bg-card)', color: previewBranch === 'SALON' ? 'var(--primary)' : 'var(--text-muted)' }}
          >Salon Theme</button>
          <button
            onClick={() => setPreviewBranch('CLINIC')}
            style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', border: '1px solid ' + (previewBranch === 'CLINIC' ? '#007AFF' : 'var(--border-light)'), background: previewBranch === 'CLINIC' ? 'rgba(0, 122, 255, 0.08)' : 'var(--bg-card)', color: previewBranch === 'CLINIC' ? '#007AFF' : 'var(--text-muted)' }}
          >Clinic Theme</button>
        </div>
      </header>

      {/* Simulated Browser Frame */}
      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', position: 'relative' }}>
        {/* Browser top bar */}
        <div style={{ background: '#F2F2F7', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F56' }} /><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFBD2E' }} /><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27C93F' }} /></div>
          <div style={{ background: 'white', flex: 1, borderRadius: '8px', padding: '4px 12px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 700 }}>
            http://localhost:{previewBranch === 'SALON' ? '3004' : '3005'} (Visual Builder Mode)
          </div>
        </div>

        {/* --- BUILDER CANVAS START --- */}
        <div style={{ maxHeight: '800px', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
           
           {/* 1. WELCOME POP-UP MODULE */}
           <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 50 }}>
              <div className="visual-section edit-pulse" style={{ background: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '250px', cursor: 'pointer' }}>
                 <VisualEditOverlay onClick={() => handleOpenModal(welcomePopup, 'WELCOME_POPUP')} title="Edit Welcome Pop-up" item={welcomePopup} />
                 <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>Welcome Pop-up Promo</h4>
                 {welcomePopup ? (
                    <div>
                       {welcomePopup.imageUrl.endsWith('.mp4') ? <video src={welcomePopup.imageUrl} style={{ width: '100%', borderRadius: '8px' }} /> : <img src={welcomePopup.imageUrl} style={{ width: '100%', borderRadius: '8px' }} />}
                       <p style={{ fontWeight: 800, fontSize: '14px', marginTop: '8px' }}>{welcomePopup.title}</p>
                    </div>
                 ) : (
                    <div style={{ background: '#F2F2F7', padding: '20px', textAlign: 'center', borderRadius: '8px' }}>
                       <Plus size={20} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
                       <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>No Active Promo Popup</span>
                    </div>
                 )}
              </div>
           </div>

           {/* 2. HERO SLIDERS */}
           <section className="visual-section" style={{ minHeight: '500px', background: previewBranch === 'SALON' ? '#FFF5F5' : '#F5F9FF', padding: '60px 40px', display: 'flex', alignItems: 'center' }}>
              <VisualEditOverlay onClick={() => handleOpenModal(activeSlide, 'HERO_SLIDE')} title="Edit Hero Slide" item={activeSlide} />
              
              <div style={{ flex: 1 }}>
                 <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: 'white', color: previewBranch === 'SALON' ? 'var(--primary)' : '#007AFF', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                    <Sparkles size={12} /> The Premium Experience
                 </div>
                 <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#1C1C1E', lineHeight: '1.1', margin: 0 }}>
                    {activeSlide?.title || 'Your Title Here'} <br/>
                    <span style={{ color: previewBranch === 'SALON' ? 'var(--primary)' : '#007AFF' }}>{activeSlide?.subtitle || 'Highlight Text'}</span>
                 </h1>
                 <button style={{ background: previewBranch === 'SALON' ? 'var(--primary)' : '#007AFF', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: 800, marginTop: '30px' }}>Book Appointment</button>
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                 {activeSlide ? (
                   <div style={{ width: '300px', height: '300px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                      {activeSlide.imageUrl?.endsWith('.mp4') ? <video src={activeSlide.imageUrl} muted loop autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={activeSlide.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                   </div>
                 ) : (
                   <div style={{ width: '300px', height: '300px', borderRadius: '40px', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px' }}>
                     <ImageIcon size={32} color="var(--text-muted)" />
                     <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>No Slides Available</span>
                   </div>
                 )}
              </div>
              {/* Slide Nav Editor */}
              <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 110 }}>
                 {heroSlides.map((_, i) => (
                   <button key={i} onClick={(e) => { e.stopPropagation(); setActiveSlideIndex(i); }} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === activeSlideIndex ? 'var(--primary)' : '#ccc', border: 'none', cursor: 'pointer' }} />
                 ))}
                 <button onClick={(e) => { e.stopPropagation(); handleOpenModal(null, 'HERO_SLIDE'); }} style={{ background: 'white', border: 'none', borderRadius: '20px', padding: '2px 10px', fontSize: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <Plus size={10} /> Add Slide
                 </button>
              </div>
           </section>

           {/* 3. WAIT-FREE EXPERIENCE GALLERY */}
           <section className="visual-section" style={{ padding: '60px 40px', background: 'white' }}>
             <VisualEditOverlay onClick={() => handleOpenModal(null, 'WAIT_FREE_GALLERY')} title="Add Gallery Image" />
             <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,0,0,0.05)', color: 'var(--primary)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem' }}><ShieldCheck size={12} /> Wait-Free Experience</div>
                <h2 style={{ fontSize: '32px', fontWeight: 900 }}>Your Time is Precious</h2>
             </div>
             
             <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px' }}>
                {waitFreeGallery.length > 0 ? waitFreeGallery.map((img) => (
                  <div key={img._id} className="visual-section" style={{ minWidth: '200px', height: '250px', borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
                     <VisualEditOverlay onClick={(e: any) => { e.stopPropagation(); handleOpenModal(img, 'WAIT_FREE_GALLERY'); }} title="Edit Image" item={img} />
                     <img src={img.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white' }}>
                        <p style={{ fontWeight: 800, fontSize: '14px', margin: 0 }}>{img.title || 'Untitled'}</p>
                     </div>
                  </div>
                )) : (
                  [1,2,3,4].map(i => (
                    <div key={i} style={{ minWidth: '200px', height: '250px', borderRadius: '20px', background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <ImageIcon size={24} color="#ccc" />
                    </div>
                  ))
                )}
             </div>
           </section>

           {/* 4. OUR STORIES IN MOTION (TOUR VIDEOS) */}
           <section className="visual-section" style={{ padding: '60px 40px', background: '#F9FAFB' }}>
             <VisualEditOverlay onClick={() => handleOpenModal(null, 'TOUR_VIDEO')} title="Add Tour Video" />
             <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '32px', fontWeight: 900 }}>Our Stories in Motion</h3>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
               {tourVideos.length > 0 ? tourVideos.map(video => (
                 <div key={video._id} className="visual-section" style={{ background: 'black', borderRadius: '20px', overflow: 'hidden', position: 'relative', aspectRatio: '16/9' }}>
                    <VisualEditOverlay onClick={(e: any) => { e.stopPropagation(); handleOpenModal(video, 'TOUR_VIDEO'); }} title="Edit Video" item={video} />
                    <video src={video.imageUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play color="white" fill="white" size={32} /></div>
                    <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', fontWeight: 800 }}>{video.title || 'Tour Video'}</div>
                 </div>
               )) : (
                 <div style={{ gridColumn: 'span 3', background: 'white', padding: '40px', textAlign: 'center', borderRadius: '20px', border: '2px dashed #E5E5EA' }}>
                   <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>No Tour Videos Uploaded. Click Add Tour Video to create one.</p>
                 </div>
               )}
             </div>
           </section>

           {/* 5. TRANSFORMATION SPOTLIGHT */}
           <section style={{ padding: '60px 40px', background: 'white' }}>
             <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '32px', fontWeight: 900 }}>Transformation Spotlight</h3>
             </div>
             <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <div className="visual-section" style={{ width: '300px', height: '400px', borderRadius: '20px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative' }}>
                   <VisualEditOverlay onClick={() => handleOpenModal(beforeTransform, 'TRANSFORMATION_BEFORE')} title="Edit BEFORE Image" item={beforeTransform} />
                   {beforeTransform ? <img src={beforeTransform.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={32} color="#ccc" /></div>}
                   <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'black', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>BEFORE</div>
                </div>
                <div className="visual-section" style={{ width: '300px', height: '400px', borderRadius: '20px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative' }}>
                   <VisualEditOverlay onClick={() => handleOpenModal(afterTransform, 'TRANSFORMATION_AFTER')} title="Edit AFTER Image" item={afterTransform} />
                   {afterTransform ? <img src={afterTransform.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={32} color="#ccc" /></div>}
                   <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>AFTER</div>
                </div>
             </div>
           </section>

           {/* 6. REAL CLIENT REVIEWS */}
           <section className="visual-section" style={{ padding: '60px 40px', background: 'var(--primary)', color: 'white', textAlign: 'center', borderRadius: '60px 60px 0 0' }}>
             <VisualEditOverlay onClick={() => handleOpenModal(null, 'CUSTOMER_REVIEW')} title="Add New Review" />
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem' }}><Star size={12} fill="white" /> Real Client Reviews</div>
             
             {reviews.length > 0 ? (
                <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', marginTop: '30px' }}>
                  {reviews.map(rev => (
                    <div key={rev._id} className="visual-section" style={{ minWidth: '300px', background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
                       <VisualEditOverlay onClick={(e: any) => { e.stopPropagation(); handleOpenModal(rev, 'CUSTOMER_REVIEW'); }} title="Edit Review" item={rev} />
                       <Quote size={24} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                       <p style={{ fontSize: '18px', fontWeight: 800, fontStyle: 'italic', marginBottom: '16px' }}>"{rev.subtitle}"</p>
                       <p style={{ fontWeight: 800 }}>{rev.title}</p>
                    </div>
                  ))}
                </div>
             ) : (
                <div style={{ padding: '40px' }}>
                   <p style={{ fontWeight: 800, opacity: 0.7 }}>No custom reviews added. Using live feedback API by default.</p>
                </div>
             )}
           </section>

        </div>
        {/* --- BUILDER CANVAS END --- */}
      </div>

      {/* Unified Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Edit ${formData.type.replace('_', ' ')}`}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {(modalTypeContext === 'HERO_SLIDE' || modalTypeContext === 'WAIT_FREE_GALLERY' || modalTypeContext === 'TOUR_VIDEO' || modalTypeContext === 'CUSTOMER_REVIEW' || modalTypeContext === 'WELCOME_POPUP') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>{modalTypeContext === 'CUSTOMER_REVIEW' ? 'Customer Name' : 'Main Title'}</label>
              <input 
                className={styles.input}
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder={modalTypeContext === 'CUSTOMER_REVIEW' ? "e.g. John Doe" : "Enter Title"}
              />
            </div>
          )}
          
          {(modalTypeContext === 'HERO_SLIDE' || modalTypeContext === 'CUSTOMER_REVIEW' || modalTypeContext === 'WAIT_FREE_GALLERY') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>{modalTypeContext === 'CUSTOMER_REVIEW' ? 'Review Content' : 'Subtitle/Highlight Text'}</label>
              <textarea 
                className={styles.input}
                value={formData.subtitle}
                onChange={e => setFormData({...formData, subtitle: e.target.value})}
                placeholder="Enter Subtitle or Review Text"
                rows={3}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Upload {modalTypeContext === 'TOUR_VIDEO' || modalTypeContext === 'HERO_SLIDE' ? 'Media (Image/Video)' : 'Image'}
            </label>
            <input 
              type="file" 
              accept="image/*,video/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              style={{ padding: '8px', border: '1px solid var(--border-light)', borderRadius: '8px' }}
              required={!editingItem}
            />
            {editingItem && !imageFile && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Leave empty to keep existing media</p>}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Target Website</label>
              <select
                className={styles.input}
                value={formData.branch}
                onChange={e => setFormData({...formData, branch: e.target.value})}
              >
                <option value="SALON">Salon Website</option>
                <option value="CLINIC">Clinic Website</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, marginTop: '1.5rem' }}>
              <input 
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                style={{ width: '20px', height: '20px' }}
              />
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Is Active</label>
            </div>
          </div>

          <button 
            type="submit"
            style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 700, border: 'none', marginTop: '1rem', cursor: 'pointer' }}
          >
            {editingItem ? 'Save Updates' : 'Upload & Publish'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
