interface PaginationData {
  page: number;
  totalPages: number;
  total: number;
}

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  if (pagination.totalPages <= 1) return null;

  const handlePrevious = () => {
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleNext = () => {
    if (pagination.page < pagination.totalPages) {
      onPageChange(pagination.page + 1);
    }
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={handlePrevious}
        disabled={pagination.page === 1}
        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors duration-200"
      >
        Previous
      </button>
      
      <span className="px-4 py-2 text-gray-600">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      
      <button
        onClick={handleNext}
        disabled={pagination.page === pagination.totalPages}
        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors duration-200"
      >
        Next
      </button>
    </div>
  );
}