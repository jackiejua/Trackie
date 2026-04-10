function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { name: 'Today', icon: '🔔' },
    { name: 'Schedule', icon: '📅' },
    { name: 'Tasks', icon: '✂' },
    { name: 'Analytics', icon: '⚠' }
  ];

  return (
    <aside className="w-64 bg-[#1a1a1a] p-6 flex flex-col gap-4 border-r border-gray-800">
      <div className="mb-10 px-2 text-[#a3e635] text-3xl">⏱</div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.name 
                ? 'bg-[#a3e635] text-black font-bold' 
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
export default Sidebar;