import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { addDoc, collection, getDocFromServer, serverTimestamp } from 'firebase/firestore'
import Form from '../components/Form.jsx'
import { db } from '../firebase.js'

const allowedCategories = [
  'Welfare Council',
  'Academic Council',
  'Cultural Council',
  'Sports Council',
  'PDC Council',
  'IRP Council',
  'General Complaints',
]

function Submit() {
  const navigate = useNavigate()
  const params = useParams()
  const category = decodeURIComponent(params.category || '')

  const normalizedCategory = allowedCategories.find((c) => c === category)
  if (!normalizedCategory) {
    return <Navigate to="/" replace />
  }

  const withTimeout = async (promise, ms, stage) => {
    let timeoutId
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error(
          `Timed out while ${stage}. This is usually caused by Firestore rules or a network/adblocker blocking requests.`,
        )
        error.code = 'timeout'
        reject(error)
      }, ms)
    })

    try {
      return await Promise.race([promise, timeoutPromise])
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Failed to read the selected photo.'))
      reader.onload = () => {
        const result = String(reader.result || '')
        const commaIndex = result.indexOf(',')
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result)
      }
      reader.readAsDataURL(file)
    })

  const uploadToImgBB = async (file) => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY
    if (!apiKey) {
      const error = new Error('Missing VITE_IMGBB_API_KEY. Photo upload is not configured.')
      error.code = 'missing-imgbb-key'
      throw error
    }

    const imageBase64 = await fileToBase64(file)
    const body = new FormData()
    body.append('image', imageBase64)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      const error = new Error(`Image upload failed (${response.status}). ${text}`.trim())
      error.code = 'img-upload-failed'
      throw error
    }

    const json = await response.json()
    const url = json?.data?.url || json?.data?.display_url
    if (!url) {
      const error = new Error('Image upload succeeded but no URL was returned.')
      error.code = 'img-no-url'
      throw error
    }

    return url
  }

  const handleSubmit = async (formData) => {
    const { photoFile, ...rest } = formData || {}

    let photoUrl = ''
    let photoName = ''
    let photoSize = 0

    if (photoFile) {
      photoName = String(photoFile.name || '')
      photoSize = Number(photoFile.size || 0)

      photoUrl = await withTimeout(uploadToImgBB(photoFile), 60000, 'uploading the photo')
    }

    const docRef = await withTimeout(
      addDoc(collection(db, 'grievances'), {
        ...rest,
        category: normalizedCategory,
        timestamp: serverTimestamp(),
        photoUrl: photoUrl || null,
        photoName: photoName || null,
        photoSize: photoSize || null,
      }),
      15000,
      'saving the grievance to Firestore',
    )

    await withTimeout(getDocFromServer(docRef), 15000, 'confirming the grievance was saved')
  }

  return (
    <main className="page">
      <h1 className="title">{normalizedCategory} Grievance</h1>
      <p className="subtitle">Fill details and submit your concern.</p>

      <Form
        onSubmit={handleSubmit}
        onBack={() => navigate('/categories')}
      />
    </main>
  )
}

export default Submit
