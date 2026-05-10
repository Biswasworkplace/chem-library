import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function FileList({ files, onDeleted, onUpload }) {
  const [deleting, setDeleting] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const fmt = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const fmtDate = (str) => {
    if (!str) return ''
    return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const getIcon = (type, name) => {
    if (type === 'application/pdf' || name?.endsWith('.pdf')) return '📄'
    if (type?.startsWith('image/')) return '🖼️'
    if (type?.includes('word') || name?.endsWith('.docx')) return '📝'
    if (type?.includes('presentation') || name?.endsWith('.pptx')) return '📊'
    if (name?.endsWith('.xlsx') || name?.endsWith('.csv')) return '📊'
    return '📎'
  }

  const deleteFile = async (file) => {
    setDeleting(file.id)
    await supabase.storage.from('files').remove([file.storage_path])
    await supabase.from('files').delete().eq('id', file.id)
    setDeleting(null)
    setConfirmDel(null)
    onDeleted()
  }

  if (files.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
        <p style={{ fontSize: 15, fontWeight: 500, color: '#374151', margin: '0 0 6px' }}>
          This folder is empty
        </p>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px' }}>
          Upload PDFs, notes, or any study material
        </p>
        <button onClick={onUpload} style={{
          padding: '9px 20px', background: '#4A90D9', color: '#fff', border: 'none',
          borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit'
        }}>
          + Upload files
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{files.length} file{files.length !== 1 ? 's' : ''}</span>
        <button onClick={onUpload} style={{
          padding: '7px 16px', background: '#4A90D9', color: '#fff', border: 'none',
          borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit'
        }}>
          + Upload
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {files.map(file => (
          <div key={file.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', background: '#fff', borderRadius: 10,
            border: '1px solid #e5e7eb', transition: 'border-color .15s'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#4A90D9'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          >
            <span style={{ fontSize: 24, flexShrink: 0 }}>{getIcon(file.type, file.name)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#1f2937', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
                {fmt(file.size)}{file.size ? ' · ' : ''}{fmtDate(file.created_at)}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <a href={file.public_url} target="_blank" rel="noreferrer"
                style={{
                  padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                  background: '#f0f7ff', color: '#4A90D9', textDecoration: 'none',
                  border: '1px solid #bfdbfe', transition: 'all .15s'
                }}>
                Open
              </a>
              <a href={file.public_url} download={file.name}
                style={{
                  padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                  background: '#f9fafb', color: '#374151', textDecoration: 'none',
                  border: '1px solid #e5e7eb', transition: 'all .15s'
                }}>
                ↓
              </a>
              <button onClick={() => setConfirmDel(file)}
                style={{
                  padding: '6px 10px', borderRadius: 7, fontSize: 12,
                  background: 'transparent', color: '#9ca3af',
                  border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all .15s'
                }}
                onMouseEnter={e => { e.target.style.background = '#fef2f2'; e.target.style.color = '#dc2626'; e.target.style.borderColor = '#fecaca' }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#9ca3af'; e.target.style.borderColor = '#e5e7eb' }}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm overlay */}
      {confirmDel && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px 28px', width: 360, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', margin: '0 0 8px' }}>Delete file?</h3>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>
              "<strong>{confirmDel.name}</strong>" will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDel(null)} style={{
                padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: 8,
                background: 'transparent', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit'
              }}>Cancel</button>
              <button onClick={() => deleteFile(confirmDel)} disabled={deleting === confirmDel.id} style={{
                padding: '8px 18px', border: 'none', borderRadius: 8,
                background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', opacity: deleting === confirmDel.id ? 0.6 : 1
              }}>
                {deleting === confirmDel.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
