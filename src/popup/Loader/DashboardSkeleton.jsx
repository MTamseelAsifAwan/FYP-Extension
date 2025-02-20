import heroimage from '../Ladingpagecomponents/assets/hero/hero-background.jpg';

const SkeletonLoader = () => {
  return (
    <div
      className="p-6 space-y-8 h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: `url(${heroimage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Title Section */}
      <div className="space-y-2 w-full max-w-2xl">
        <div className="bg-gray-300 h-8 w-2/3 rounded-md animate-pulse"></div>
        <div className="bg-gray-300 h-4 w-1/2 rounded-md animate-pulse"></div>
      </div>

      {/* Button Section */}
      <div className="flex space-x-4 mb-6">
        <div className="bg-gray-300 h-10 w-32 rounded-md animate-pulse"></div>
        <div className="bg-gray-300 h-10 w-32 rounded-md animate-pulse"></div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-300 h-40 rounded-md animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
