function Widgets() {
  return (
    <aside className="w-80 p-8 flex flex-col gap-6">
      {/* Daily Focus */}
      <div className="text-center">
        <h3 className="text-xl font-bold mb-4">Daily Focus</h3>
        <div className="relative w-40 h-40 mx-auto mb-4 border-4 border-[#a3e635] rounded-full flex items-center justify-center">
          <div className="text-[#a3e635] text-4xl">✓</div>
          {/* You'd use a library like react-circular-progressbar here */}
        </div>
        <button className="w-full bg-[#a3e635] text-black font-bold py-3 rounded-xl hover:opacity-90">
          START FOCUS SESSION
        </button>
      </div>

      {/* Quick Add Icons */}
      <div className="bg-[#1a1a1a] p-6 rounded-2xl">
        <h4 className="font-bold mb-4">Quick Add</h4>
        <div className="flex justify-between">
          {[ 'plus', 'plus-sq', 'calendar', 'note' ].map((icon, i) => (
            <button key={i} className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 border border-gray-700">
              +
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
export default Widgets;