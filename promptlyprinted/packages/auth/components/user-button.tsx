'use client';

import { useState } from 'react';
import { signOut, useSession } from '../client';

interface UserButtonProps {
  showName?: boolean;
  appearance?: {
    elements?: {
      rootBox?: string;
      userButtonBox?: string;
      userButtonOuterIdentifier?: string;
    };
  };
}

export const UserButton = ({ showName = false, appearance }: UserButtonProps) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    // Redirect to web app home after sign out
    window.location.href = 'http://localhost:3001';
  };

  return (
    <div className={`relative ${appearance?.elements?.rootBox || ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${appearance?.elements?.userButtonBox || ''}`}
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
        </div>
        {showName && (
          <div className={`text-left ${appearance?.elements?.userButtonOuterIdentifier || ''}`}>
            <div className="text-sm font-medium">{session.user.name || 'User'}</div>
            <div className="text-xs text-gray-500">{session.user.email}</div>
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20">
            <div className="py-1">
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};