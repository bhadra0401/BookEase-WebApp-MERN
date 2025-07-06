import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { Star, CalendarCheck } from 'lucide-react';

const AdminReviews: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const res = await api.get('/reviews/admin/all');
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await api.put(`/reviews/approve/${reviewId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Review approved');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-books'] }); // to refresh ratings
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to approve review');
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Review Management</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">No reviews found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-2">Book</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Rating</th>
                <th className="px-4 py-2">Comment</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review: any) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{review.bookId?.title}</div>
                    <div className="text-xs text-gray-500">{review.bookId?.author}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{review.userId?.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{review.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-sm">
                    <div className="font-semibold">{review.title}</div>
                    <div className="text-gray-600">{review.comment}</div>
                  </td>
                  <td className="px-4 py-3">
                    {review.approvedByAdmin ? (
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!review.approvedByAdmin && (
                      <button
                        onClick={() => approveMutation.mutate(review._id)}
                        disabled={approveMutation.isPending}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                      </button>
                    )}
                    {review.approvedByAdmin && (
                      <div className="flex items-center text-green-600 text-xs">
                        <CalendarCheck className="h-4 w-4 mr-1" />
                        Approved
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
