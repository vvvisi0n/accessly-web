import AIReviewAnalysis from "@/components/reviews/AIReviewAnalysis";

export default function ReviewCard({ review }: { review: any }) {
  return (
    <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-900 mb-4">
      <h2 className="font-semibold text-lg">{review.placeName}</h2>
      <p className="text-sm text-gray-600">{review.description}</p>

      {review.imageUrl && (
        <img
          src={review.imageUrl}
          alt="Accessibility"
          className="w-full rounded-lg mt-3 object-cover"
        />
      )}

      {/* Insert AI analysis section */}
      <AIReviewAnalysis
        aiAnalysis={review.aiAnalysis}
        placeName={review.placeName}
        imageUrl={review.imageUrl}
      />
    </div>
  );
}
