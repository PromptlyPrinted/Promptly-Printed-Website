import Link from "next/link"

export const AboutDropdown = () => {
  return (
    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
      <ul className="space-y-2">
        <li>
          <Link
            href="/about"
            className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2CA8A4] dark:hover:text-[#2CA8A4]"
          >
            About Us
          </Link>
        </li>
        <li>
          <Link
            href="/size-fit"
            className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2CA8A4] dark:hover:text-[#2CA8A4]"
          >
            Size & Fit
          </Link>
        </li>
        <li>
          <Link
            href="/faq"
            className="block text-sm text-gray-600 dark:text-gray-300 hover:text-[#2CA8A4] dark:hover:text-[#2CA8A4]"
          >
            FAQs
          </Link>
        </li>
      </ul>
    </div>
  )
}

