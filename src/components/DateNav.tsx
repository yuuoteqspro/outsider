import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';

interface DateNavProps {
  date: Date;
  onChange: (date: Date) => void;
}

function formatKoreanDate(date: Date): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dow = days[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dow})`;
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DateNav({ date, onChange }: DateNavProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function prev() {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    onChange(d);
  }

  function next() {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    onChange(d);
  }

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value) {
      const [y, m, day] = e.target.value.split('-').map(Number);
      onChange(new Date(y, m - 1, day));
    }
    setPickerOpen(false);
  }

  function openPicker() {
    setPickerOpen(true);
    setTimeout(() => inputRef.current?.showPicker?.(), 50);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
      <button
        onClick={prev}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        <ChevronLeft size={20} className="text-gray-600" />
      </button>

      <button
        onClick={openPicker}
        className="text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors relative"
      >
        {formatKoreanDate(date)}
        <input
          ref={inputRef}
          type="date"
          value={toLocalDateString(date)}
          onChange={handlePickerChange}
          className="absolute inset-0 opacity-0 w-full cursor-pointer"
          style={{ fontSize: 0 }}
        />
      </button>

      <button
        onClick={next}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        <ChevronRight size={20} className="text-gray-600" />
      </button>
    </div>
  );
}
