
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
  profilePhotoUrl?: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Aqui você vai chamar sua API para buscar os reviews
        // Por enquanto, vamos usar dados de exemplo
        const mockReviews: Review[] = [
          {
            author: "João Silva",
            rating: 5,
            text: "Excelente atendimento! Muito profissional e preços justos.",
            date: "2024-02-15",
          },
          {
            author: "Maria Santos",
            rating: 4,
            text: "Bom serviço, recomendo.",
            date: "2024-02-10",
          },
        ];

        setReviews(mockReviews);
        const avg = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;
        setAverageRating(avg);
      } catch (error) {
        console.error("Erro ao buscar reviews:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as avaliações",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [toast]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Avaliações do Google</h1>
          {!loading && (
            <div className="flex items-center justify-center mt-4 space-x-2">
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
              <span className="text-lg font-semibold">
                {averageRating.toFixed(1)} / 5.0
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {reviews.map((review, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {review.author}
                      </CardTitle>
                      <div className="flex mt-2">{renderStars(review.rating)}</div>
                    </div>
                    {review.profilePhotoUrl && (
                      <img
                        src={review.profilePhotoUrl}
                        alt={review.author}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{review.text}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(review.date).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
