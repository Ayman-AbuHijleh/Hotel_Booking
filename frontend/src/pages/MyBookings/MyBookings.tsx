import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  getUserBookings,
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
} from "../../constants";
import "./MyBookings.scss";

export default function MyBookings() {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);
  const [message, setMessage] = useState<{
    type: typeof MessageType.SUCCESS | typeof MessageType.ERROR;
    text: string;
  } | null>(null);

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: [QUERY_KEYS.USER_BOOKINGS, user?.user_id],
    queryFn: () => getUserBookings(user?.user_id || ""),
    enabled: !!user?.user_id,
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
  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status === BookingStatus.ACTIVE),
    [bookings]
  );
  const pastBookings = useMemo(
    () => bookings.filter((b) => b.status !== BookingStatus.ACTIVE),
    [bookings]
  );

  // Pagination for active bookings
  const {
    currentPage: activePage,
    totalPages: activeTotalPages,
    paginatedData: paginatedActiveBookings,
    goToPage: goToActivePage,
    itemsPerPage: activeItemsPerPage,
  } = usePagination({
    data: activeBookings,
    itemsPerPage: 9,
  });

  // Pagination for past bookings
  const {
    currentPage: pastPage,
    totalPages: pastTotalPages,
    paginatedData: paginatedPastBookings,
    goToPage: goToPastPage,
    itemsPerPage: pastItemsPerPage,
  } = usePagination({
    data: pastBookings,
    itemsPerPage: 9,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_BOOKINGS] });
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_BOOKINGS] });
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
    <div className="my-bookings">
      <div className="header">
        <h1 className="page-title">My Bookings</h1>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      {bookings.length === 0 && (
        <div className="empty-state">
          <p>You don't have any bookings yet.</p>
        </div>
      )}

      {activeBookings.length > 0 && (
        <>
          <h2 className="section-title">Active Bookings</h2>
          <div className="bookings-grid">
            {paginatedActiveBookings.map((booking) => {
              const room = getRoomDetails(booking.room_id);
              return (
                <Card key={booking.booking_id} className="booking-card">
                  <div className="booking-header">
                    <h3 className="room-number">
                      Room {room?.room_number || "N/A"}
                    </h3>
                    <span className="booking-status status-active">Active</span>
                  </div>

                  <div className="booking-details">
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
                      <span className="value">
                        {formatDate(booking.end_date)}
                      </span>
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
                    <Button
                      onClick={() => handleCancel(booking.booking_id)}
                      variant="danger"
                    >
                      Cancel Booking
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          <Pagination
            currentPage={activePage}
            totalPages={activeTotalPages}
            onPageChange={goToActivePage}
            itemsPerPage={activeItemsPerPage}
            totalItems={activeBookings.length}
          />
        </>
      )}

      {pastBookings.length > 0 && (
        <>
          <h2 className="section-title">Past Bookings</h2>
          <div className="bookings-grid">
            {paginatedPastBookings.map((booking) => {
              const room = getRoomDetails(booking.room_id);
              return (
                <Card key={booking.booking_id} className="booking-card past">
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
                      <span className="value">
                        {formatDate(booking.end_date)}
                      </span>
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
          <Pagination
            currentPage={pastPage}
            totalPages={pastTotalPages}
            onPageChange={goToPastPage}
            itemsPerPage={pastItemsPerPage}
            totalItems={pastBookings.length}
          />
        </>
      )}
    </div>
  );
}
