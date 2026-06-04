import { useRef, useState } from 'react'

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024

const ImageUploadField = ({ value, onChange, label = 'Product image', hint = 'Drop an image, choose a file, or capture one from your device camera.' }) => {
  const fileInputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')

  const readImageFile = (file) => {
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError('Image must be 2MB or smaller.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setError('')
      onChange(String(reader.result || ''))
    }
    reader.onerror = () => {
      setError('Unable to read the selected image.')
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragActive(false)
    readImageFile(event.dataTransfer.files?.[0])
  }

  const handleFileChange = (event) => {
    readImageFile(event.target.files?.[0])
    event.target.value = ''
  }

  const openPicker = () => {
    fileInputRef.current?.click()
  }

  const clearImage = (event) => {
    event.stopPropagation()
    setError('')
    onChange('')
  }

  return (
    <div className="image-upload-field form-grid__full">
      <div
        className={`image-upload-dropzone${dragActive ? ' active' : ''}${value ? ' has-image' : ''}`}
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openPicker()
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setDragActive(false)
        }}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="image-upload-input" onChange={handleFileChange} />

        {value ? (
          <>
            <img className="image-upload-preview" src={value} alt={label} />
            <div className="image-upload-overlay">
              <span className="pill">Image selected</span>
              <p>{label}</p>
            </div>
          </>
        ) : (
          <div className="image-upload-empty">
            <span className="image-upload-title">{label}</span>
            <p>{hint}</p>
            <p className="muted">Drop a file here or tap to choose from your phone or PC.</p>
          </div>
        )}
      </div>

      <div className="image-upload-controls">
        <button className="button ghost small" type="button" onClick={openPicker}>
          Choose image
        </button>
        {value && (
          <button className="button ghost small" type="button" onClick={clearImage}>
            Remove image
          </button>
        )}
      </div>

      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

export default ImageUploadField