// src/components/ShareButtons.tsx
"use client";

import { FaTwitter, FaFacebook, FaLinkedin } from "react-icons/fa";

export default function ShareButtons({ url }: { url: string }) {
  const encodedUrl = encodeURIComponent(url);
  const text = encodeURIComponent("Check out this accessibility review on Accessana!");

  return (
    <div className="flex items-center gap-4 text-sm text-blue-600">
      <span className="font-medium text-gray-700">Share:</span>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        <FaTwitter className="inline mr-1" /> Twitter
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        <FaLinkedin className="inline mr-1" /> LinkedIn
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        <FaFacebook className="inline mr-1" /> Facebook
      </a>
    </div>
  );
}
