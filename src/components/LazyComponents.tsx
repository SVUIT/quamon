import dynamic from 'next/dynamic';

// Lazy load heavy components to improve initial load time
export const LazyGradeTable = dynamic(
  () => import('../components/GradeTable/GradeTable').then(mod => ({ default: mod.default })),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải bảng điểm...</p>
        </div>
      </div>
    )
  }
);

export const LazyAddSubjectForm = dynamic(
  () => import('../components/AddSubject/AddSubjectForm').then(mod => ({ default: mod.default })),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải form thêm môn học...</p>
        </div>
      </div>
    )
  }
);

export const LazyInstructions = dynamic(
  () => import('../components/Instructions/Instructions').then(mod => ({ default: mod.default })),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải hướng dẫn...</p>
        </div>
      </div>
    )
  }
);

export const LazyEditModal = dynamic(
  () => import('../components/GradeTable/EditModal').then(mod => ({ default: mod.default })),
  { 
    ssr: false, 
    loading: () => null // Don't show loading for modal
  }
);
