import { useRef, useState } from 'react'

function Form({ onSubmit, onBack }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const photoInputRef = useRef(null)

  const withTimeout = (promise, ms) => {
    let timeoutId
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error(
          'Request timed out. Could not confirm submission. Please try again (and disable adblock/VPN if enabled).',
        )
        error.code = 'timeout'
        reject(error)
      }, ms)
    })

    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId)
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!description.trim()) {
      setSubmitSuccess('')
      setSubmitError('Please enter a description.')
      return
    }

    setSubmitError('')
    setSubmitSuccess('')
    setIsSubmitting(true)
    try {
      const timeoutMs = photoFile ? 90000 : 12000
      await withTimeout(
        onSubmit({
          name: name.trim(),
          description: description.trim(),
          photoFile,
        }),
        timeoutMs,
      )
      setName('')
      setDescription('')
      setPhotoFile(null)
      if (photoInputRef.current) {
        photoInputRef.current.value = ''
      }
      setSubmitSuccess('Grievance submitted successfully.')
    } catch (error) {
      const code = error?.code ? String(error.code) : ''
      const details = error?.message ? String(error.message) : ''
      const base = code ? `Submission failed (${code}).` : 'Submission failed.'
      const hint = code === 'permission-denied' ? ' Check Firestore rules and try again.' : ''
      setSubmitError(details ? `${base}${hint} ${details}`.trim() : `${base}${hint}`.trim())
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2 className="title">Submit Grievance</h2>
      <p className="subtitle">Fill details and submit your concern.</p>

      <div className="field">
        <label htmlFor="name">Name (optional)</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter your name"
        />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the grievance"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="photo">Photo (optional)</label>
        <input
          id="photo"
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null
            if (!file) {
              setPhotoFile(null)
              return
            }

            // Basic guardrail to avoid very large uploads.
            if (file.size > 5 * 1024 * 1024) {
              setSubmitSuccess('')
              setSubmitError('Please choose an image smaller than 5 MB.')
              event.target.value = ''
              setPhotoFile(null)
              return
            }

            setSubmitError('')
            setPhotoFile(file)
          }}
        />
      </div>

      <div className="row">
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>

        {onBack && (
          <button className="button" type="button" onClick={onBack}>
            Back
          </button>
        )}
      </div>

      {submitSuccess && <p style={{ color: '#166534', marginTop: 10 }}>{submitSuccess}</p>}
      {submitError && <p style={{ color: '#b91c1c', marginTop: 10 }}>{submitError}</p>}
    </form>
  )
}

export default Form
