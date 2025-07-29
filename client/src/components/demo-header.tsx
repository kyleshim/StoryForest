export function DemoHeader() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L21 9L13.09 9.74L12 16L10.91 9.74L3 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h1 className="font-bold text-xl text-black">StoryForest</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-600">D</span>
          </div>
        </div>
      </div>
    </header>
  );
}