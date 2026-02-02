<template>
  <div class="sync-page-container">
    <div class="sync-header">
      <h1>Data Synchronization</h1>
      <p class="subtitle">Manage and monitor your file uploads and sync status.</p>
    </div>

    <div class="sync-card">
      <div class="card-header">
        <div class="header-title">
          <h2>Synced Files</h2>
          <span class="badge count">{{ files.length }} Files</span>
        </div>
        <!-- <button class="sync-now-btn"><span class="icon">↻</span> Sync Now</button> -->
      </div>

      <div class="table-responsive">
        <table class="sync-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Status</th>
              <th>Last Synced</th>
              <th>Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(file, index) in files" :key="index">
              <td class="file-name-cell">
                <div class="file-icon">📄</div>
                <div class="file-info">
                  <span class="name">{{ file.name }}</span>
                  <span class="type">{{ file.type }}</span>
                </div>
              </td>
              <td>
                <span :class="['status-badge', file.status.toLowerCase()]">
                  {{ file.status }}
                </span>
              </td>
              <td class="time-cell">{{ file.lastSynced }}</td>
              <td class="size-cell">{{ file.size }}</td>
              <td>
                <button class="action-btn" title="View Details">⋯</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const files = ref([
  {
    name: 'student_roster_2025.csv',
    type: 'CSV',
    lastSynced: '2 mins ago',
    status: 'Synced',
    size: '1.2 MB',
  },
  {
    name: 'q3_grades_export.xlsx',
    type: 'Excel',
    lastSynced: '45 mins ago',
    status: 'Synced',
    size: '450 KB',
  },
  {
    name: 'attendance_log_feb.csv',
    type: 'CSV',
    lastSynced: 'Syncing',
    status: 'Pending',
    size: '890 KB',
  },
  {
    name: 'curriculum_mapping.pdf',
    type: 'PDF',
    lastSynced: '2 days ago',
    status: 'Error',
    size: '2.5 MB',
  },
  {
    name: 'staff_directory.json',
    type: 'JSON',
    lastSynced: '1 week ago',
    status: 'Synced',
    size: '120 KB',
  },
])
</script>

<style scoped>
.sync-page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #333;
}

.sync-header {
  margin-bottom: 2rem;
  text-align: left;
}

.sync-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1.1rem;
}

.sync-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.sync-card:hover {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.5);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.badge.count {
  background: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.sync-now-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.sync-now-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.sync-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.sync-table th {
  text-align: left;
  padding: 1rem 2rem;
  color: #64748b;
  font-weight: 500;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.sync-table td {
  padding: 1.25rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

.sync-table tbody tr:last-child td {
  border-bottom: none;
}

.sync-table tbody tr:hover {
  background-color: rgba(248, 250, 252, 0.6);
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-icon {
  width: 40px;
  height: 40px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-info .name {
  font-weight: 500;
  color: #0f172a;
}

.file-info .type {
  font-size: 0.75rem;
  color: #94a3b8;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-block;
}

.status-badge.synced {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fff7ed;
  color: #9a3412;
  animation: pulse 2s infinite;
}

.status-badge.error {
  background: #fef2f2;
  color: #991b1b;
}

.time-cell {
  color: #64748b;
  font-size: 0.95rem;
}

.size-cell {
  color: #94a3b8;
  font-family: monospace;
}

.action-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
