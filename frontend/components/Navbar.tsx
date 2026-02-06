import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link href="/" className="flex items-center py-4 px-2">
                <span className="font-semibold text-gray-500 text-lg">YouEvent</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/" className="py-4 px-2 text-green-500 border-b-4 border-green-500 font-semibold ">Home</Link>
              <a href="#" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">Events</a>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3 ">
            <Link href="/login" className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-green-500 hover:text-white transition duration-300">Log In</Link>
            <Link href="/register" className="py-2 px-2 font-medium text-white bg-green-500 rounded hover:bg-green-400 transition duration-300">Sign Up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
