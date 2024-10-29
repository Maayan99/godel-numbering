import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">Logo</Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:text-gray-300">Home</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-gray-300">About</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;