// src/components/Spinner.tsx
export default function Spinner() {
  return (
    <div className="flex justify-center items-center py-6">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
}
