import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
  currentRecords: any[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentRecords, totalRecords, currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="p-4 flex items-center justify-between border-t border-gray-100">
      <p className="text-xs text-[#667085]">
        Showing {currentRecords.length} of {totalRecords} records
      </p>
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          className="h-8 w-8 !p-0" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </Button>
        <Button 
          variant="secondary" 
          className="h-8 w-8 !p-0" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage >= totalPages}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}