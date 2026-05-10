import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { FOLDER_TREE } from '../lib/folders'
import UploadModal from './UploadModal'
import FileList from './FileList'

const SUBJECT_COLORS = {
  organic: '#e8f5e9', medicinal: '#e3f2fd', spectroscopy: '#f3e5f5',
  analytic: '#fff8e1', physical: '#fce4ec', biochem: '#e0f7fa'
}

function getSubjectColor(id) {
  const subject = Object.keys(SUBJECT_COLORS).find(k => id === k || id.startsWith(k.slice(0, 3)))
  return subject ? SUBJECT_COLORS[subject] : '#f3f4f6'
}

export default function FileManager({ user }) {
  const [currentId, setCurrentId] = useState('root')
  const [history, setHistory] = useState([])
  const [files, setFiles] = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch] = useState('')

  const currentNode = FOLDER_TREE[currentId]
  const isLeaf = currentNode && !currentNode.children && !currentNode.sections

  const loadFiles = useCallback(async () => {
    if (!isLeaf) return
    setLoadingFiles(true)
    const { data } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .eq('folder_id', currentId)
      .order('created_at', { ascending: false })
    setFiles(data || [])
    setLoadingFiles(false)
  }, [currentId, isLeaf, user.id])

  useEffect(() => { loadFiles() }, [loadFiles])

  const navigate = (id) => {
    setHistory(h => [...h, currentId])
    setCurrentId(id)
    setSearch('')
  }

  const goBack = () => {
    if (!history.length) return
    setCurrentId(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
    setSearch('')
  }

  const jumpTo = (idx) => {
    const trail = [...history, currentId]
    setCurrentId(trail[idx])
    setHistory(trail.slice(0, idx))
    setSearch('')
  }

  const getBreadcrumb = () => {
    const trail = [...history, currentId]
    return trail.map(id => {
      const node = FOLDER_TREE[id]
      if (id === 'root') return { id, label: 'My Library' }
      return { id, label: node?.label || id }
    })
  }

  const getChildren = () => {
    if (!currentNode) return []
    if (currentNode.children) return currentNode.children
    if (currentNode.sections) return currentNode.sections.flatMap(s => s.children)
    return []
  }

  const getSections = () => {
    if (currentNode?.sections) return currentNode.sections
    return null
  }

  const signOut = () => supabase.auth.signOut()

  const renderFolderGrid = (items) => {
    const filtered = search
      ? items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
      : items

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 10
      }}>
        {filtered.map(item => (
          <div key={item.id} onClick={() => navigate(item.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '18px 10px', borderRadius: 12, cursor: 'pointer',
              background: getSubjectColor(item.id),
              border: '1px solid rgba(0,0,0,0.06)', transition: 'all .15s',
              textAlign: 'center'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
          >
            <span style={{ fontSize: 30 }}>{item.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#374151', lineHeight: 1.4 }}>
              {item.name}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 14 }}>
            No folders match "{search}"
          </div>
        )}
      </div>
    )
  }

  const sections = getSections()
  const children = getChildren()

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f8f9fb' }}>

      {/* Sidebar */}
      <div style={{
        width: 220, background: '#1a1a2e', display: 'flex', flexDirection: 'column',
        flexShrink: 0, overflow: 'hidden'
      }}>
        <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🧪</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Chem Library</span>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '6px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </p>
        </div>

        <div style={{ padding: '12px 0', flex: 1, overflow: 'auto' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '0 18px', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Subjects
          </p>
          {FOLDER_TREE.root.children.map(item => (
            <div key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 18px', cursor: 'pointer', fontSize: 13,
                color: history.includes(item.id) || currentId === item.id ? '#fff' : 'rgba(255,255,255,0.6)',
                background: currentId === item.id ? 'rgba(74,144,217,0.25)' : 'transparent',
                borderLeft: currentId === item.id ? '2px solid #4A90D9' : '2px solid transparent',
                transition: 'all .12s'
              }}
              onMouseEnter={e => { if (currentId !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (currentId !== item.id) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={signOut} style={{
            width: '100%', padding: '8px 0', background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
            color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
          background: '#fff', borderBottom: '1px solid #e5e7eb'
        }}>
          <button onClick={goBack} disabled={!history.length}
            style={{
              padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
              background: 'transparent', cursor: history.length ? 'pointer' : 'not-allowed',
              opacity: history.length ? 1 : 0.35, fontSize: 13, color: '#374151', fontFamily: 'inherit'
            }}>
            ← Back
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, overflow: 'hidden', fontSize: 13 }}>
            {getBreadcrumb().map((crumb, i, arr) => (
              <span key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                {i < arr.length - 1 ? (
                  <>
                    <span onClick={() => jumpTo(i)} style={{ cursor: 'pointer', color: '#4A90D9', whiteSpace: 'nowrap' }}>
                      {crumb.label}
                    </span>
                    <span style={{ color: '#d1d5db' }}>›</span>
                  </>
                ) : (
                  <span style={{ fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* Search */}
          {!isLeaf && (
            <input
              type="text" placeholder="Search folders…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
                fontSize: 13, outline: 'none', width: 180, fontFamily: 'inherit'
              }}
            />
          )}

          {isLeaf && (
            <button onClick={() => setShowUpload(true)} style={{
              padding: '7px 16px', background: '#4A90D9', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            }}>
              + Upload
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {isLeaf ? (
            loadingFiles ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', fontSize: 14 }}>Loading…</div>
            ) : (
              <FileList
                files={files}
                onDeleted={loadFiles}
                onUpload={() => setShowUpload(true)}
              />
            )
          ) : sections ? (
            sections.map(sec => (
              <div key={sec.label} style={{ marginBottom: 28 }}>
                <p style={{
                  fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase',
                  letterSpacing: '.06em', marginBottom: 10
                }}>
                  {sec.label}
                </p>
                {renderFolderGrid(sec.children)}
              </div>
            ))
          ) : (
            renderFolderGrid(children)
          )}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          folderId={currentId}
          folderName={currentNode?.label || currentId}
          userId={user.id}
          onClose={() => setShowUpload(false)}
          onUploaded={() => { setShowUpload(false); loadFiles() }}
        />
      )}
    </div>
  )
}
