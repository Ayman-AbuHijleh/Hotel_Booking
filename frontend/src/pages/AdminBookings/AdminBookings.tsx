import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllBookings,
  cancelBooking,
  deleteBooking,
} from "../../services/booking.api";
import { getAllRooms } from "../../services/room.api";
import type { Room } from "../../services/room.api";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../hooks/usePagination";
import {
  QUERY_KEYS,
  BookingStatus,
  MessageType,
  API_MESSAGES,
  CONFIRM_MESSAGES,
  FILTER_OPTIONS,
  type BookingStatusType,
} from "../../constants";
import "./AdminBookings.scss";

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{
    type: typeof MessageType.SUCCESS | typeof MessageType.ERROR;
    text: string;
  } | null>(null);
  const [filter, setFilter] = useState<
    typeof FILTER_OPTIONS.ALL | BookingStatusType
  >(FILTER_OPTIONS.ALL);

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: [QUERY_KEYS.ALL_BOOKINGS],
    queryFn: () => getAllBookings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: rooms = [] } = useQuery({
    queryKey: [QUERY_KEYS.ROOMS],
    queryFn: () => getAllRooms(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Memoize filtered bookings
  const filteredBookings = useMemo(
    () =>
      bookings?.filter((booking) => {
        if (filter === FILTER_OPTIONS.ALL) return true;
        return booking.status === filter;
      }) || [],
    [bookings, filter]
  );

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedBookings,
    goToPage,
    itemsPerPage,
  } = usePagination({
    data: filteredBookings,
    itemsPerPage: 12,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_BOOKINGS] });
      setMessage({
        type: MessageType.SUCCESS,
        text: API_MESSAGES.BOOKING_CANCELLED,
      });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({
        type: MessageType.ERROR,
        text:
          error?.response?.data?.message || API_MESSAGES.BOOKING_CANCEL_FAILED,
      });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_BOOKINGS] });
      setMessage({
        type: MessageType.SUCCESS,
        text: API_MESSAGES.BOOKING_DELETED,
      });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({
        type: MessageType.ERROR,
        text:
          error?.response?.data?.message || API_MESSAGES.BOOKING_DELETE_FAILED,
      });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const handleCancel = (bookingId: string) => {
    if (window.confirm(CONFIRM_MESSAGES.CANCEL_BOOKING)) {
      cancelMutation.mutate(bookingId);
    }
  };

  const handleDelete = (bookingId: string) => {
    if (window.confirm(CONFIRM_MESSAGES.DELETE_BOOKING)) {
      deleteMutation.mutate(bookingId);
    }
  };

  const getRoomDetails = (roomId: string): Room | undefined => {
    return rooms?.find((room) => room.room_id === roomId);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateNights = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (bookingsLoading) return <Loader />;
  if (bookingsError)
    return <div className="error-message">Error loading bookings</div>;

  return (
    <div className="admin-bookings">
      <div className="header">
        <h1 className="page-title">All Bookings</h1>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${
              filter === FILTER_OPTIONS.ALL ? "active" : ""
            }`}
            onClick={() => setFilter(FILTER_OPTIONS.ALL)}
          >
            All
          </button>
          <button
            className={`filter-btn ${
              filter === BookingStatus.ACTIVE ? "active" : ""
            }`}
            onClick={() => setFilter(BookingStatus.ACTIVE)}
          >
            Active
          </button>
          <button
            className={`filter-btn ${
              filter === BookingStatus.COMPLETED ? "active" : ""
            }`}
            onClick={() => setFilter(BookingStatus.COMPLETED)}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${
              filter === BookingStatus.CANCELLED ? "active" : ""
            }`}
            onClick={() => setFilter(BookingStatus.CANCELLED)}
          >
            Cancelled
          </button>
        </div>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      {filteredBookings.length === 0 && (
        <div className="empty-state">
          <p>No bookings found.</p>
        </div>
      )}

      <div className="bookings-grid">
        {paginatedBookings.map((booking) => {
          const room = getRoomDetails(booking.room_id);
          return (
            <Card key={booking.booking_id} className="booking-card">
              <div className="booking-header">
                <h3 className="room-number">
                  Room {room?.room_number || "N/A"}
                </h3>
                <span className={`booking-status status-${booking.status}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <div className="detail-row">
                  <span className="label">Booking ID:</span>
                  <span className="value small">
                    {booking.booking_id.slice(0, 8)}...
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">User ID:</span>
                  <span className="value small">
                    {booking.user_id.slice(0, 8)}...
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Room Type:</span>
                  <span className="value">{room?.room_type || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Check-in:</span>
                  <span className="value">
                    {formatDate(booking.start_date)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Check-out:</span>
                  <span className="value">{formatDate(booking.end_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Nights:</span>
                  <span className="value">
                    {calculateNights(booking.start_date, booking.end_date)}
                  </span>
                </div>
                <div className="detail-row total">
                  <span className="label">Total Price:</span>
                  <span className="value">${booking.total_price}</span>
                </div>
              </div>

              <div className="booking-actions">
                {booking.status === BookingStatus.ACTIVE && (
                  <Button
                    onClick={() => handleCancel(booking.booking_id)}
                    variant="danger"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(booking.booking_id)}
                  variant="secondary"
                >
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredBookings.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredBookings.length}
        />
      )}
    </div>
  );
}
