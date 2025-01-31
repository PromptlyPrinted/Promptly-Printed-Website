import { useState } from "react"
import Link from "next/link"
import { User, ChevronDown } from "lucide-react"
import { useAuth } from "@repo/auth/client"

export const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { signOut } = useAuth()

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white dark:text-white hover:text-[#172A45] dark:hover:text-[#172A45]"
        aria-label="Account"
      >
        <User className="h-5 w-5" />

      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/my-images"
                className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2CA8A4] dark:hover:text-[#2CA8A4]"
              >
                My Images
              </Link>
            </li>
            <li>
              <Link
                href="/orders"
                className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2CA8A4] dark:hover:text-[#2CA8A4]"
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                href="/refer-a-friend"
                className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2CA8A4] dark:hover:text-[#2CA8A4]"
              >
                Refer-a-friend
              </Link>
            </li>
            <li>
              <button
                onClick={() => signOut()}
                className="block w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-[#2CA8A4] dark:hover:text-[#2CA8A4]"
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

