import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import UploadModal from './UploadModal'
import FileList from './FileList'

const COLORS = ['#dbeafe', '#dcfce7', '#fce7f3', '#fef3c7', '#ede9fe', '#fde68a', '#d1fae5']

function getColor(name) {
  if (!name) return '#f8fafc'
  const idx = name.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

function getFolderIcon(name) {
  if (!name) return '??'
  const label = name.toLowerCase()
  if (label.includes('doc') || label.includes('report')) return '??'
  if (label.includes('img') || label.includes('photo') || label.includes('jpeg') || label.includes('png')) return '???'
  if (label.includes('slide') || label.includes('presentation')) return '??'
  return '??'
}

export default function FileManager({ user }) {
  const [currentFolderId, setCurrentFolderId] = useState(null)
  const [currentFolder, setCurrentFolder] = useState({ id: null, name: 'Home', parent_id: null })
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Home' }])
  const [history, setHistory] = useState([])
  const [childFolders, setChildFolders] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [folderSearch, setFolderSearch] = useState('')
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const loadCurrentFolder = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')

    const childrenQuery = supabase.from('folders').select('id,name,parent_id,created_at').eq('user_id', user.id)
    const filesQuery = supabase.from('files').select('*').eq('user_id', user.id)

    if (currentFolderId === null) {
      childrenQuery.is('parent_id', null)
      filesQuery.is('folder_id', null)
    } else {
      childrenQuery.eq('parent_id', currentFolderId)
      filesQuery.eq('folder_id', currentFolderId)
    }

    const [folderResponse, childResponse, filesResponse] = await Promise.all([
      currentFolderId === null
        ? Promise.resolve({ data: null, error: null })
        : supabase.from('folders').select('id,name,parent_id').eq('user_id', user.id).eq('id', currentFolderId).single(),
      childrenQuery.order('created_at', { ascending: false }),
      filesQuery.order('created_at', { ascending: false })
    ])

    const folderData = folderResponse.data
    setCurrentFolder(
      folderData ? { id: folderData.id, name: folderData.name, parent_id: folderData.parent_id } : { id: null, name: 'Home', parent_id: null }
    )
    setChildFolders(childResponse.data || [])
    setFiles(filesResponse.data || [])

    if (currentFolderId) {
      const trail = [{ id: null, name: 'Home' }]
      let nextId = currentFolderId
      while (nextId) {
        const { data, error } = await supabase
          .from('folders')
          .select('id,name,parent_id')
          .eq('user_id', user.id)
          .eq('id', nextId)
          .single()
        if (error || !data) break
        trail.push({ id: data.id, name: data.name })
        nextId = data.parent_id
      }
      setBreadcrumbs(trail)
    } else {
      setBreadcrumbs([{ id: null, name: 'Home' }])
    }

    setLoading(false)
  }, [currentFolderId, user.id])

  useEffect(() => { loadCurrentFolder() }, [loadCurrentFolder])

  const navigate = (folder) => {
    setHistory((prev) => [...prev, currentFolderId])
    setCurrentFolderId(folder.id)
    setFolderSearch('')
  }

  const goBack = () => {
    if (!history.length) return
    const previous = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    setCurrentFolderId(previous)
    setFolderSearch('')
  }

  const jumpTo = (index) => {
    const next = breadcrumbs[index]
    if (!next) return
    setCurrentFolderId(next.id)
    setHistory(breadcrumbs.slice(0, index).map((item) => item.id))
    setFolderSearch('')
  }

  const createFolder = async () => {
    const name = window.prompt(`Enter ${currentFolderId === null ? 'topic' : 'folder'} name`)?.trim()
    if (!name) return

    const { error } = await supabase.from('folders').insert({
      user_id: user.id,
      parent_id: currentFolderId,
      name
    })

    if (error) {
      setErrorMessage(error.message)
      return
    }

    loadCurrentFolder()
  }

  const collectDescendantFolderIds = async (folderId) => {
    const ids = [folderId]
    const stack = [folderId]

    while (stack.length) {
      const parent = stack.pop()
      const { data, error } = await supabase.from('folders').select('id').eq('user_id', user.id).eq('parent_id', parent)
      if (error || !data) continue
      const children = data.map((item) => item.id)
      ids.push(...children)
      stack.push(...children)
    }

    return ids
  }

  const deleteFolderTree = async (folderId) => {
    const ids = await collectDescendantFolderIds(folderId)
    const { data: filePaths } = await supabase.from('files').select('storage_path').eq('user_id', user.id).in('folder_id', ids)
    const paths = filePaths?.map((item) => item.storage_path).filter(Boolean) || []

    if (paths.length) {
      await supabase.storage.from('files').remove(paths)
    }

    await supabase.from('files').delete().eq('user_id', user.id).in('folder_id', ids)
    await supabase.from('folders').delete().eq('user_id', user.id).in('id', ids)
  }

  const confirmDelete = async () => {
    if (!confirmDeleteFolder) return
    await deleteFolderTree(confirmDeleteFolder.id)

    if (currentFolderId === confirmDeleteFolder.id) {
      setCurrentFolderId(currentFolder.parent_id)
      setHistory((prev) => prev.slice(0, -1))
    }

    setConfirmDeleteFolder(null)
    loadCurrentFolder()
  }

  const currentIsRoot = currentFolderId === null
  const filteredFolders = childFolders.filter((folder) => folder.name.toLowerCase().includes(folderSearch.toLowerCase()))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>??</span>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#fff' }}>Chem Cloud</p>
              <p style={{ fontSize: 11, color: '#cbd5e1', margin: '4px 0 0' }}>{user.email}</p>
            </div>
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-section-label">Folders</div>
          <button className="sidebar-button" onClick={() => setCurrentFolderId(null)}>
            <span>Home</span>
            <span>??</span>
          </button>
          {breadcrumbs.length > 1 && (
            <div className="sidebar-path">
              <span>{breadcrumbs.map((crumb) => crumb.name).join(' / ')}</span>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <button className="action-button secondary" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="toolbar">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
            <button className="action-button outline" onClick={goBack} disabled={!history.length}>? Back</button>
            <div className="breadcrumb-bar">
              {breadcrumbs.map((crumb, index) => (
                <span key={`${crumb.id ?? 'root'}-${index}`} className="breadcrumb-item">
                  <button type="button" onClick={() => jumpTo(index)} className="breadcrumb-link">
                    {crumb.name}
                  </button>
                  {index < breadcrumbs.length - 1 && <span className="breadcrumb-separator">›</span>}
                </span>
              ))}
            </div>
          </div>

          <div className="toolbar-actions">
            <input
              type="search"
              value={folderSearch}
              onChange={(e) => setFolderSearch(e.target.value)}
              placeholder="Search folders"
              className="search-input"
            />
            <button className="action-button primary" onClick={createFolder}>
              + {currentIsRoot ? 'New Topic' : 'New Folder'}
            </button>
            <button className="action-button primary" onClick={() => setShowUpload(true)}>
              Upload File
            </button>
            {!currentIsRoot && (
              <button className="action-button danger" onClick={() => setConfirmDeleteFolder(currentFolder)}>
                Delete
              </button>
            )}
          </div>
        </header>

        <section className="content-area">
          <div className="section-header">
            <div>
              <p className="section-label">{currentFolder.name}</p>
              <p className="section-note">{filteredFolders.length} folder{filteredFolders.length !== 1 ? 's' : ''} · {files.length} file{files.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="folder-grid">
            {filteredFolders.map((folder) => (
              <div key={folder.id} className="folder-card">
                <button type="button" className="folder-card-main" onClick={() => navigate(folder)}>
                  <div className="folder-avatar" style={{ background: getColor(folder.name) }}>
                    {getFolderIcon(folder.name)}
                  </div>
                  <div>
                    <div className="folder-title">{folder.name}</div>
                    <div className="folder-meta">Folder · {new Date(folder.created_at).toLocaleDateString()}</div>
                  </div>
                </button>
                <button className="icon-button" onClick={() => setConfirmDeleteFolder(folder)} title="Delete folder">
                  ???
                </button>
              </div>
            ))}
          </div>

          <div className="file-section">
            <FileList
              files={files}
              onDeleted={loadCurrentFolder}
              onUpload={() => setShowUpload(true)}
            />
          </div>

          {loading && (
            <div className="loading-overlay">
              <div>Loading…</div>
            </div>
          )}

          {!loading && filteredFolders.length === 0 && files.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">??</div>
              <p className="empty-title">This folder is empty</p>
              <p className="empty-copy">Create a new folder or upload your first file.</p>
              <div className="empty-actions">
                <button className="action-button primary" onClick={createFolder}>+ New Folder</button>
                <button className="action-button outline" onClick={() => setShowUpload(true)}>Upload File</button>
              </div>
            </div>
          )}
        </section>
      </main>

      {showUpload && (
        <UploadModal
          folderId={currentFolderId}
          folderName={currentFolder.name}
          userId={user.id}
          onClose={() => setShowUpload(false)}
          onUploaded={() => { setShowUpload(false); loadCurrentFolder() }}
        />
      )}

      {confirmDeleteFolder && (
        <div className="modal-backdrop" onClick={() => setConfirmDeleteFolder(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Delete folder?</h3>
            <p>"{confirmDeleteFolder.name}" and all nested files will be permanently removed.</p>
            <div className="modal-actions">
              <button className="action-button outline" onClick={() => setConfirmDeleteFolder(null)}>Cancel</button>
              <button className="action-button danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="toast-error">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage('')} className="toast-close">×</button>
        </div>
      )}
    </div>
  )
}
