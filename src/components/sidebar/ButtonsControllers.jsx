// src/components/sidebar/ButtonsControllers.jsx
export default function ButtonsControllers() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <h2 className="text-2xl font-semibold text-[#212121] mb-6">
        Controles del Robot
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div></div>
        <button className="bg-[#5C7A8B] hover:bg-[#4C6977] text-white font-semibold py-3 px-5 rounded-xl shadow-md transition-all">
          ↑
        </button>
        <div></div>

        <button className="bg-[#5C7A8B] hover:bg-[#4C6977] text-white font-semibold py-3 px-5 rounded-xl shadow-md transition-all">
          ←
        </button>
        <button className="bg-[#A3B7C1] text-[#212121] font-semibold py-3 px-5 rounded-xl shadow-md">
          ●
        </button>
        <button className="bg-[#5C7A8B] hover:bg-[#4C6977] text-white font-semibold py-3 px-5 rounded-xl shadow-md transition-all">
          →
        </button>

        <div></div>
        <button className="bg-[#5C7A8B] hover:bg-[#4C6977] text-white font-semibold py-3 px-5 rounded-xl shadow-md transition-all">
          ↓
        </button>
        <div></div>
      </div>
    </div>
  );
}
