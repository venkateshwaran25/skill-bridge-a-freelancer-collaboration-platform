import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './FileManager.css';

const FileManager = ({ workplaceId, user }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileInput, setFileInput] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [workplaceId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/files/workplace/${workplaceId}`);
      setFiles(res.data.files || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleUploadFile = async (file) => {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workplaceId', workplaceId);
      formData.append('description', file.name);

      await API.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchFiles();
      setFileInput(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await API.delete(`/api/files/${fileId}`);
      fetchFiles();
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  return (
    <div className="file-manager">
      <div className="file-manager-header">
        <h2>File Sharing</h2>
        <label className="upload-button">
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            ref={(el) => setFileInput(el)}
            style={{ display: 'none' }}
          />
          + Upload File
        </label>
      </div>

      {uploading && (
        <div className="upload-progress">
          <p>Uploading file...</p>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {loading ? (
        <div className="loading">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <p>No files uploaded yet. Share files with your team!</p>
        </div>
      ) : (
        <div className="files-list">
          <div className="files-header">
            <span>File Name</span>
            <span>Type</span>
            <span>Size</span>
            <span>Uploaded By</span>
            <span>Date</span>
            <span>Actions</span>
          </div>
          {files.map(file => (
            <FileRow 
              key={file._id} 
              file={file}
              onDelete={() => handleDeleteFile(file._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileRow = ({ file, onDelete }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'document':
        return '📄';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🔊';
      case 'code':
        return '💻';
      default:
        return '📎';
    }
  };

  return (
    <div className="file-row">
      <div className="file-name">
        <span className="file-icon">{getFileIcon(file.fileType)}</span>
        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
          {file.fileName}
        </a>
      </div>
      <span className="file-type">{file.fileType}</span>
      <span className="file-size">{formatFileSize(file.fileSize)}</span>
      <span className="file-uploader">{file.uploadedBy?.name || 'Unknown'}</span>
      <span className="file-date">
        {new Date(file.createdAt).toLocaleDateString()}
      </span>
      <div className="file-actions">
        <a href={file.fileUrl} download className="download-btn" title="Download">
          ⬇️
        </a>
        <button onClick={onDelete} className="delete-btn" title="Delete">
          🗑️
        </button>
      </div>
    </div>
  );
};

export default FileManager;
