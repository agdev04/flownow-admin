import { useEffect, useState } from 'preact/hooks'
import { useAuth } from '@clerk/clerk-react'
import './styles/meditation.css'

interface Meditation {
  id: string
  title: string
  description: string
  category?: string
  tags?: string[]
  script?: string
  image_url?: string
  audio_url?: string
}

type EditingMeditation = Meditation | null

export function MeditationsTable() {
  const { getToken } = useAuth()
  const [meditations, setMeditations] = useState<Meditation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    script: '',
    image_url: '',
    audio_url: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [editingMeditation, setEditingMeditation] = useState<EditingMeditation>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchMeditations() {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()
        const url = editingMeditation
        ? `https://b88g8kk0k0owcgw08ocgg8gk.coolify.agnieve.com/meditations/${editingMeditation.id}`
        : 'https://b88g8kk0k0owcgw08ocgg8gk.coolify.agnieve.com/meditations/'
      
      const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!res.ok) throw new Error('Failed to fetch meditations')
        const data = await res.json()
        setMeditations(Array.isArray(data.meditations) ? data.meditations : [])
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchMeditations()
  }, [getToken])

  async function handleDelete(meditation: Meditation) {
    if (!confirm('Are you sure you want to delete this meditation?')) return
    
    setIsDeleting(true)
    try {
      const token = await getToken()
      const res = await fetch(`https://b88g8kk0k0owcgw08ocgg8gk.coolify.agnieve.com/meditations/${meditation.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error('Failed to delete meditation')
      setMeditations(meds => meds.filter(m => m.id !== meditation.id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete meditation')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleEdit(meditation: Meditation) {
    setEditingMeditation(meditation)
    setForm({
      title: meditation.title,
      description: meditation.description,
      category: meditation.category || '',
      tags: meditation.tags?.join(', ') || '',
      script: meditation.script || '',
      image_url: meditation.image_url || '',
      audio_url: meditation.audio_url || ''
    })
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    setFormError(null)
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Title and Description are required.')
      return
    }
    setFormLoading(true)
    try {
      const token = await getToken()
      const url = editingMeditation
        ? `https://b88g8kk0k0owcgw08ocgg8gk.coolify.agnieve.com/meditations/${editingMeditation.id}`
        : 'https://b88g8kk0k0owcgw08ocgg8gk.coolify.agnieve.com/meditations/'
      
      const res = await fetch(url, {
        method: editingMeditation ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          script: form.script,
          image_url: form.image_url,
          audio_url: form.audio_url
        })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to create meditation')
      }
      setForm({ title: '', description: '', category: '', tags: '', script: '', image_url: '', audio_url: '' })
      setEditingMeditation(null)
      setFormError(null)
      // Refetch meditations
      setLoading(true)
      const getRes = await fetch('https://b88g8kk0k0owcgw08ocgg8gk.coolify.agnieve.com/meditations/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await getRes.json()
      setMeditations(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setFormError(err.message || 'Unknown error')
    } finally {
      setFormLoading(false)
      setLoading(false)
    }
  }

  if (loading) return <div className="loading-state">Loading meditations...</div>
  if (error) return <div className="error-state">Error: {error}</div>

  return (
    <div className="meditation-container">
      <form onSubmit={handleSubmit} className="meditation-form">
        <h3 className="form-title">{editingMeditation ? 'Edit Meditation' : 'Create Meditation'}</h3>
        <div className="form-group">
          <input className="form-input" placeholder="Title*" value={form.title} onInput={e => setForm(f => ({...f, title: (e.target as HTMLInputElement).value}))} />
          <input className="form-input" placeholder="Description*" value={form.description} onInput={e => setForm(f => ({...f, description: (e.target as HTMLInputElement).value}))} />
          <input className="form-input" placeholder="Category" value={form.category} onInput={e => setForm(f => ({...f, category: (e.target as HTMLInputElement).value}))} />
          <input className="form-input" placeholder="Tags (comma separated)" value={form.tags} onInput={e => setForm(f => ({...f, tags: (e.target as HTMLInputElement).value}))} />
        </div>
        <div className="form-group">
          <input className="form-input" placeholder="Image URL" value={form.image_url} onInput={e => setForm(f => ({...f, image_url: (e.target as HTMLInputElement).value}))} />
          <input className="form-input" placeholder="Audio URL" value={form.audio_url} onInput={e => setForm(f => ({...f, audio_url: (e.target as HTMLInputElement).value}))} />
        </div>
        <div className="form-group">
          <textarea className="form-textarea" placeholder="Script" value={form.script} onInput={e => setForm(f => ({...f, script: (e.target as HTMLTextAreaElement).value}))} />
        </div>
        {formError && <div className="form-error">{formError}</div>}
        <button type="submit" disabled={formLoading} className="submit-button">
          {formLoading ? (editingMeditation ? 'Updating...' : 'Creating...') : (editingMeditation ? 'Update Meditation' : 'Create Meditation')}
        </button>
      </form>
      {(!meditations.length) ? <div className="empty-state">No meditations found.</div> : (
        <table className="meditations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meditations.map(med => (
              <tr key={med.id}>
                <td>{med.id}</td>
                <td>{med.title}</td>
                <td>{med.description}</td>
                <td>
                  <button 
                    onClick={() => handleEdit(med)} 
                    className="action-button edit"
                    disabled={isDeleting}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(med)} 
                    className="action-button delete"
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}