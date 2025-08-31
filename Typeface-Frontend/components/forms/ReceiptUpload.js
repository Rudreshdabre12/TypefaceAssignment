'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadReceipt, uploadTransactionHistory } from '../../lib/api'

export default function ReceiptUpload() {
  const [uploadType, setUploadType] = useState('pos')
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState([])
  const [errors, setErrors] = useState('')
  const fileInputRef = useRef(null)
  const router = useRouter()

  const acceptedFileTypes = {
    pos: '.jpg,.jpeg,.png,.pdf',
    history: '.pdf'
  }

  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

  const validateFile = (file) => {
    const errors = []

    if (file.size > maxFileSize) {
      errors.push(`File size must be less than 10MB`)
    }

    const allowedTypes = acceptedFileTypes[uploadType].split(',')
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

    if (!allowedTypes.includes(fileExtension)) {
      errors.push(`File type not supported. Allowed: ${allowedTypes.join(', ')}`)
    }

    return errors
  }

  const handleFiles = (newFiles) => {
    setErrors('')
    const validFiles = []
    const fileErrors = []

    newFiles.forEach(file => {
      const validationErrors = validateFile(file)
      if (validationErrors.length === 0) {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        })
      } else {
        fileErrors.push(`${file.name}: ${validationErrors.join(', ')}`)
      }
    })

    if (fileErrors.length > 0) {
      setErrors(fileErrors.join('\n'))
    }

    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (fileId) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      // Cleanup preview URLs
      const removedFile = prev.find(f => f.id === fileId)
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview)
      }
      return updated
    })
  }

  const handleUpload = async () => {
    setIsUploading(true);
    const results = [];

    try {
      // Process files sequentially to avoid overwhelming the server
      for (const file of files) {
        let result;
        if(uploadType == "pos") result = await uploadReceipt(file);
        else if(uploadType == 'history') result = await uploadTransactionHistory(file);
        results.push({
          ...result,
          fileName: file.name
        });
      }

      setUploadResults(results);

      // Check if all uploads were successful
      const allSuccessful = results.every(result => result.success);
      if (allSuccessful) {
        // Optionally clear the files after successful upload
        setFiles([]);
        // Clean up preview URLs
        files.forEach(file => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResults([...results, {
        success: false,
        message: 'Upload failed: ' + error.message,
        fileName: 'Upload process'
      }]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Upload Type</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${uploadType === 'pos' ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'
            }`}>
            <input
              type="radio"
              name="uploadType"
              value="pos"
              checked={uploadType === 'pos'}
              onChange={(e) => setUploadType(e.target.value)}
              className="sr-only"
            />
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900">POS Receipt</span>
                <span className="block text-sm text-gray-500">Upload receipt images or PDFs from stores, restaurants, etc.</span>
              </div>
            </div>
          </label>

          <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${uploadType === 'history' ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'
            }`}>
            <input
              type="radio"
              name="uploadType"
              value="history"
              checked={uploadType === 'history'}
              onChange={(e) => setUploadType(e.target.value)}
              className="sr-only"
            />
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900">Transaction History</span>
                <span className="block text-sm text-gray-500">Upload bank statement PDFs in tabular format</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h2>

        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={uploadType === 'pos'}
            accept={acceptedFileTypes[uploadType]}
            onChange={handleFileSelect}
            className="sr-only"
          />

          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Drop files here or click to upload
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  {uploadType === 'pos' ? 'JPG, PNG or PDF up to 10MB each' : 'PDF up to 10MB'}
                </span>
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 btn-primary"
              >
                Select Files
              </button>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-red-700 text-sm whitespace-pre-line">{errors}</div>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Selected Files</h3>
            <div className="space-y-3">
              {files.map((fileItem) => (
                <div key={fileItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {fileItem.preview ? (
                      <img src={fileItem.preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fileItem.name}</p>
                      <p className="text-xs text-gray-500">{(fileItem.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                `Upload ${files.length} file${files.length > 1 ? 's' : ''}`
              )}
            </button>
          </div>
        )}

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Upload Results</h3>
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div key={index} className={`p-3 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center">
                    <svg className={`w-5 h-5 mr-2 ${result.success ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d={result.success
                        ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        : "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      } clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.fileName}
                      </p>
                      <p className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                        {result.success ?
                          `Extraction Completed` :
                          result.message
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {uploadResults.some(r => r.success) && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push('/transactions')}
                  className="btn-primary"
                >
                  View Transactions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}