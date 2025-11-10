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
import "./AdminBookings.scss";

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [filter, setFilter] = useState<
    "all" | "active" | "completed" | "cancelled"
  >("all");

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: ["allBookings"],
    queryFn: () => getAllBookings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => getAllRooms(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Memoize filtered bookings
  const filteredBookings = useMemo(
    () =>
      bookings?.filter((booking) => {
        if (filter === "all") return true;
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
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
      setMessage({ type: "success", text: "Booking cancelled successfully!" });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({
        type: "error",
        text: error?.response?.data?.message || "Failed to cancel booking",
      });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
      setMessage({ type: "success", text: "Booking deleted successfully!" });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({
        type: "error",
        text: error?.response?.data?.message || "Failed to delete booking",
      });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const handleCancel = (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelMutation.mutate(bookingId);
    }
  };

  const handleDelete = (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
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
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
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
                {booking.status === "active" && (
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
