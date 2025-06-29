import { useAuth } from '@repo/auth/client';
import { User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  return (
    <div className="group relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white hover:text-[#172A45]"
        aria-label="Account"
      >
        <User className="h-5 w-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white p-4 shadow-lg">
          <ul className="space-y-2">
            <li>
              <Link
                href="/my-images"
                className="block text-gray-600 text-sm hover:text-[#2CA8A4]"
              >
                My Images
              </Link>
            </li>
            <li>
              <Link
                href="/orders"
                className="block text-gray-600 text-sm hover:text-[#2CA8A4]"
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                href="/refer-a-friend"
                className="block text-gray-600 text-sm hover:text-[#2CA8A4]"
              >
                Refer-a-friend
              </Link>
            </li>
            <li>
              <button
                onClick={() => signOut()}
                className="block w-full text-left text-gray-600 text-sm hover:text-[#2CA8A4]"
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
