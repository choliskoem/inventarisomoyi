import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Library pembuat file dijalankan apa adanya di Node.js (tidak di-bundle)
  serverExternalPackages: ['exceljs', 'jspdf', 'jspdf-autotable'],
};

export default nextConfig;