const STORAGE_KEY = 'storedFiles';

// DOM Elements
const fileInput = document.getElementById('fileInput');
const filesGrid = document.getElementById('filesGrid');
const mediaPlayer = document.getElementById('mediaPlayer');
const uploadArea = document.getElementById('uploadArea');

// State
let storedFiles = [];

// Initialize
loadFiles();

// File Handling
function loadFiles() {
  const savedFiles = localStorage.getItem(STORAGE_KEY);
  if (savedFiles) {
    storedFiles = JSON.parse(savedFiles);
    renderFiles();
  }
}

// Drag and drop handling
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = 'var(--primary-color)';
  uploadArea.style.background = '#fafafa';
});

uploadArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = 'var(--border-color)';
  uploadArea.style.background = 'var(--surface-color)';
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = 'var(--border-color)';
  uploadArea.style.background = 'var(--surface-color)';
  
  const files = e.dataTransfer.files;
  handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  for (const file of files) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const fileData = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        data: e.target.result,
        size: file.size,
        lastModified: file.lastModified
      };
      
      storedFiles.push(fileData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedFiles));
      renderFiles();
    };
    
    reader.readAsDataURL(file);
  }
  
  fileInput.value = '';
}

function renderFiles() {
  filesGrid.innerHTML = '';
  
  storedFiles.forEach(file => {
    const fileCard = document.createElement('div');
    fileCard.className = 'file-card';
    
    const fileIcon = getFileIcon(file.type);
    const fileSize = formatFileSize(file.size);
    
    fileCard.innerHTML = `
      <div class="file-icon">${fileIcon}</div>
      <div class="file-name">${file.name}</div>
      <div class="file-size">${fileSize}</div>
      <div class="file-actions">
        <button class="btn btn-primary" onclick="openFile('${file.id}')">Open</button>
        <button class="btn btn-secondary" onclick="downloadFile('${file.id}')">Download</button>
        <button class="btn btn-delete" onclick="deleteFile('${file.id}')">Delete</button>
      </div>
    `;
    
    filesGrid.appendChild(fileCard);
  });
}

window.openFile = (fileId) => {
  const file = storedFiles.find(f => f.id === fileId);
  if (!file) return;
  
  mediaPlayer.innerHTML = '';
  
  if (file.type.startsWith('video/')) {
    mediaPlayer.innerHTML = `<video controls src="${file.data}"></video>`;
    mediaPlayer.style.display = 'block';
  } else if (file.type.startsWith('audio/')) {
    mediaPlayer.innerHTML = `<audio controls src="${file.data}"></audio>`;
    mediaPlayer.style.display = 'block';
  } else if (file.type === 'text/plain') {
    mediaPlayer.innerHTML = `<div class="text-viewer">${atob(file.data.split(',')[1])}</div>`;
    mediaPlayer.style.display = 'block';
  }
};

window.downloadFile = (fileId) => {
  const file = storedFiles.find(f => f.id === fileId);
  if (!file) return;
  
  const link = document.createElement('a');
  link.href = file.data;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.deleteFile = (fileId) => {
  if (confirm('Are you sure you want to delete this file?')) {
    storedFiles = storedFiles.filter(f => f.id !== fileId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedFiles));
    renderFiles();
    mediaPlayer.style.display = 'none';
  }
};

function getFileIcon(type) {
  if (type.startsWith('video/')) return '🎥';
  if (type.startsWith('audio/')) return '🎵';
  if (type === 'text/plain') return '📄';
  return '📁';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}