import Link from 'next/link';

export const AboutDropdown = () => {
  return (
    <div className="absolute left-0 mt-2 w-48 rounded-lg bg-white p-4 opacity-0 shadow-lg transition-opacity duration-300 ease-in-out group-hover:opacity-100">
      <ul className="space-y-2">
        <li>
          <Link
            href="/about"
            className="block text-gray-600 text-sm hover:text-[#2CA8A4]"
          >
            About Us
          </Link>
        </li>
        <li>
          <Link
            href="/size-fit"
            className="block text-gray-600 text-sm hover:text-[#2CA8A4]"
          >
            Size & Fit
          </Link>
        </li>
        <li>
          <Link
            href="/faq"
            className="block text-gray-600 text-sm hover:text-[#2CA8A4]"
          >
            FAQs
          </Link>
        </li>
      </ul>
    </div>
  );
};
