import { useEffect, useState } from 'preact/hooks'
import { useAuth } from '@clerk/clerk-react'

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

  useEffect(() => {
    async function fetchMeditations() {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()
        const res = await fetch('https://b88g8kk0k0owcgw08ocgg8gk.coolify.agnieve.com/meditations/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!res.ok) throw new Error('Failed to fetch meditations')
        const data = await res.json()
        setMeditations(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchMeditations()
  }, [getToken])

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
      const res = await fetch('https://b88g8kk0k0owcgw08ocgg8gk.coolify.agnieve.com/meditations/', {
        method: 'POST',
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

  if (loading) return <div>Loading meditations...</div>
  if (error) return <div style={{color:'red'}}>Error: {error}</div>

  return (
    <div>
      <form onSubmit={handleSubmit} style={{marginBottom:'2rem',border:'1px solid #eee',padding:'1rem',borderRadius:'8px',background:'#fafbfc'}}>
        <h3 style={{marginTop:0}}>Create Meditation</h3>
        <div style={{display:'flex',flexWrap:'wrap',gap:'1rem'}}>
          <input style={{flex:'1 1 200px',padding:'8px'}} placeholder="Title*" value={form.title} onInput={e => setForm(f => ({...f, title: (e.target as HTMLInputElement).value}))} />
          <input style={{flex:'1 1 200px',padding:'8px'}} placeholder="Description*" value={form.description} onInput={e => setForm(f => ({...f, description: (e.target as HTMLInputElement).value}))} />
          <input style={{flex:'1 1 150px',padding:'8px'}} placeholder="Category" value={form.category} onInput={e => setForm(f => ({...f, category: (e.target as HTMLInputElement).value}))} />
          <input style={{flex:'1 1 150px',padding:'8px'}} placeholder="Tags (comma separated)" value={form.tags} onInput={e => setForm(f => ({...f, tags: (e.target as HTMLInputElement).value}))} />
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'1rem',marginTop:'1rem'}}>
          <input style={{flex:'1 1 200px',padding:'8px'}} placeholder="Image URL" value={form.image_url} onInput={e => setForm(f => ({...f, image_url: (e.target as HTMLInputElement).value}))} />
          <input style={{flex:'1 1 200px',padding:'8px'}} placeholder="Audio URL" value={form.audio_url} onInput={e => setForm(f => ({...f, audio_url: (e.target as HTMLInputElement).value}))} />
        </div>
        <div style={{marginTop:'1rem'}}>
          <textarea style={{width:'100%',padding:'8px',minHeight:'60px'}} placeholder="Script" value={form.script} onInput={e => setForm(f => ({...f, script: (e.target as HTMLTextAreaElement).value}))} />
        </div>
        {formError && <div style={{color:'red',marginTop:'0.5rem'}}>{formError}</div>}
        <button type="submit" disabled={formLoading} style={{marginTop:'1rem',padding:'8px 16px',background:'#1976d2',color:'#fff',border:'none',borderRadius:'4px',cursor:formLoading?'not-allowed':'pointer'}}>
          {formLoading ? 'Creating...' : 'Create Meditation'}
        </button>
      </form>
      {(!meditations.length) ? <div>No meditations found.</div> : (
        <table style={{width:'100%',borderCollapse:'collapse',marginTop:'1rem'}}>
          <thead>
            <tr>
              <th style={{border:'1px solid #ccc',padding:'8px'}}>ID</th>
              <th style={{border:'1px solid #ccc',padding:'8px'}}>Title</th>
              <th style={{border:'1px solid #ccc',padding:'8px'}}>Description</th>
            </tr>
          </thead>
          <tbody>
            {meditations.map(med => (
              <tr key={med.id}>
                <td style={{border:'1px solid #ccc',padding:'8px'}}>{med.id}</td>
                <td style={{border:'1px solid #ccc',padding:'8px'}}>{med.title}</td>
                <td style={{border:'1px solid #ccc',padding:'8px'}}>{med.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}