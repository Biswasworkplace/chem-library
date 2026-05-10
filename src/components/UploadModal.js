import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function UploadModal({ folderId, folderName, userId, onClose, onUploaded }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({})
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...dropped])
  }

  const handleSelect = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)])
  }

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const upload = async () => {
    if (!files.length) return
    setUploading(true)
    setError('')
    const uploaded = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const path = `${userId}/${folderId}/${Date.now()}_${file.name}`

      setProgress(p => ({ ...p, [i]: 'uploading' }))

      const { error: upErr } = await supabase.storage
        .from('files')
        .upload(path, file)

      if (upErr) {
        setProgress(p => ({ ...p, [i]: 'error' }))
        setError(`Failed to upload ${file.name}: ${upErr.message}`)
        continue
      }

      const { data: urlData } = supabase.storage.from('files').getPublicUrl(path)

      const { error: dbErr } = await supabase.from('files').insert({
        user_id: userId,
        folder_id: folderId,
        name: file.name,
        size: file.size,
        type: file.type,
        storage_path: path,
        public_url: urlData.publicUrl
      })

      if (dbErr) {
        setProgress(p => ({ ...p, [i]: 'error' }))
        setError(`DB error for ${file.name}: ${dbErr.message}`)
      } else {
        setProgress(p => ({ ...p, [i]: 'done' }))
        uploaded.push(file.name)
      }
    }

    setUploading(false)
    if (uploaded.length > 0) onUploaded()
  }

  const fmt = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getIcon = (file) => {
    if (file.type === 'application/pdf') return '📄'
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type.includes('word')) return '📝'
    return '📎'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: 500, maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0, color: '#1a1a2e' }}>Upload files</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '3px 0 0' }}>→ {folderName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Drop zone */}
        <div style={{ padding: '20px 24px', flex: 1, overflow: 'auto' }}>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            style={{
              border: '2px dashed #d1d5db', borderRadius: 12, padding: '28px 20px',
              textAlign: 'center', cursor: 'pointer', marginBottom: 16, transition: 'all .15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4A90D9'; e.currentTarget.style.background = '#f0f7ff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#374151', margin: '0 0 4px' }}>
              Drop files here or click to browse
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>PDF, images, Word docs, and more</p>
            <input ref={inputRef} type="file" multiple onChange={handleSelect} style={{ display: 'none' }} />
          </div>

          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {files.map((file, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: '#f9fafb', borderRadius: 10,
                  border: '1px solid #e5e7eb'
                }}>
                  <span style={{ fontSize: 20 }}>{getIcon(file)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1f2937', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{fmt(file.size)}</p>
                  </div>
                  {progress[i] === 'uploading' && <span style={{ fontSize: 12, color: '#4A90D9' }}>Uploading…</span>}
                  {progress[i] === 'done' && <span style={{ fontSize: 16 }}>✅</span>}
                  {progress[i] === 'error' && <span style={{ fontSize: 16 }}>❌</span>}
                  {!progress[i] && (
                    <button onClick={() => removeFile(i)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9ca3af', fontSize: 16, padding: 2
                    }}>×</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, fontSize: 13, color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', border: '1px solid #d1d5db', borderRadius: 8,
            background: 'transparent', fontSize: 14, cursor: 'pointer', color: '#374151', fontFamily: 'inherit'
          }}>
            Cancel
          </button>
          <button onClick={upload} disabled={!files.length || uploading} style={{
            padding: '9px 24px', border: 'none', borderRadius: 8, background: '#4A90D9',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: (!files.length || uploading) ? 'not-allowed' : 'pointer',
            opacity: (!files.length || uploading) ? 0.6 : 1, fontFamily: 'inherit'
          }}>
            {uploading ? 'Uploading…' : `Upload ${files.length > 0 ? files.length + ' file' + (files.length > 1 ? 's' : '') : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
