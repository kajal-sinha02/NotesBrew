interface ResultsSummaryProps {
  loading: boolean;
  notesCount: number;
  totalCount: number;
}

export default function ResultsSummary({ 
  loading, 
  notesCount, 
  totalCount 
}: ResultsSummaryProps) {
  if (loading) return null;

  return (
    <div className="mb-4 text-sm text-gray-600">
      {totalCount > 0 ? (
        <span>Showing {notesCount} of {totalCount} notes</span>
      ) : (
        <span>No notes found</span>
      )}
    </div>
  );
}