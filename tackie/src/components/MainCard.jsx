function MainCard() {
  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden text-black shadow-2xl">
      {/* Classes Section */}
      <section className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Classes</h2>
          <button className="text-sm border border-black px-3 py-1 rounded-lg hover:bg-gray-100">+ Class</button>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
          <div>
            <p className="font-semibold">Calculus III (9:00 AM)</p>
            <p className="text-gray-500 text-sm">Physics I</p>
          </div>
          <span className="text-[#a3e635] font-bold text-xs bg-black px-2 py-1 rounded">COMPLETED ✓</span>
        </div>
      </section>

      {/* Assignments Section */}
      <section className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Assignments</h2>
          <button className="text-sm border border-black px-3 py-1 rounded-lg hover:bg-gray-100">+ Task</button>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-gray-700">History Essay - Due Friday</p>
            <span className="text-[#a3e635] font-bold text-xs bg-black px-2 py-1 rounded">COMPLETED ✓</span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-700">Chem Lab Report - Due Today</p>
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
export default MainCard;