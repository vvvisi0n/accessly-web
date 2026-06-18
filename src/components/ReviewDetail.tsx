import { useRouter } from "next/navigation";
import { ArrowLeft } from "react-feather";
export default function ReviewDetail({ id }: { id: string }) {
  const router = useRouter();
  import {
    FacebookShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon,
  } from "react-share";
  import { usePathname } from "next/navigation";

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* 🔙 Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to reviews
      </button>

      {/* ...rest of your detail rendering */}
    </div>
  );
}
{
  /* 🔗 Share Buttons */
}
<div className="mt-6">
  <p className="text-sm text-gray-600 mb-2">Share this review:</p>
  <div className="flex gap-4 items-center">
    <FacebookShareButton url={`https://accessana.io${pathname}`}>
      <FacebookIcon size={32} round />
    </FacebookShareButton>
    <TwitterShareButton url={`https://accessana.io${pathname}`}>
      <TwitterIcon size={32} round />
    </TwitterShareButton>
    <WhatsappShareButton url={`https://accessana.io${pathname}`}>
      <WhatsappIcon size={32} round />
    </WhatsappShareButton>
  </div>
</div>;
const pathname = usePathname();
