import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type HighScore, type InsertHighScore } from "@shared/schema";

export function useFirebase() {
  const queryClient = useQueryClient();

  // Get top scores
  const { data: topScores = [], refetch: refetchScores } = useQuery<HighScore[]>({
    queryKey: ['/api/high-scores'],
    queryFn: async () => {
      const response = await fetch('/api/high-scores');
      if (!response.ok) {
        throw new Error('Failed to fetch high scores');
      }
      return response.json();
    }
  });

  // Submit new score
  const { mutateAsync: submitScore, isPending: isSubmittingScore } = useMutation({
    mutationFn: async (scoreData: InsertHighScore) => {
      const response = await apiRequest('POST', '/api/high-scores', scoreData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/high-scores'] });
    }
  });

  // Get player's best score
  const getPlayerBestScore = async (playerName: string) => {
    const response = await fetch(`/api/high-scores/player/${encodeURIComponent(playerName)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch player best score');
    }
    return response.json();
  };

  return {
    topScores,
    submitScore,
    isSubmittingScore,
    refetchScores,
    getPlayerBestScore
  };
}
