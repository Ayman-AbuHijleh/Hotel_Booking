import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllRooms } from "../../services/room.api";
import { createBooking } from "../../services/booking.api";
import type { Room } from "../../services/room.api";
import type { CreateBookingData } from "../../services/booking.api";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../hooks/usePagination";
import "./Rooms.scss";

type BookingFormData = {
  start_date: string;
  end_date: string;
};

export default function Rooms() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    start_date: "",
    end_date: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    data: rooms = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => getAllRooms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoize filtered rooms
  const availableRooms = useMemo(
    () => rooms.filter((room) => room.status === "available"),
    [rooms]
  );
  const bookedRooms = useMemo(
    () => rooms.filter((room) => room.status === "booked"),
    [rooms]
  );

  // Pagination for available rooms
  const {
    currentPage: availablePage,
    totalPages: availableTotalPages,
    paginatedData: paginatedAvailableRooms,
    goToPage: goToAvailablePage,
    itemsPerPage: availableItemsPerPage,
  } = usePagination({
    data: availableRooms,
    itemsPerPage: 9,
  });

  // Pagination for booked rooms
  const {
    currentPage: bookedPage,
    totalPages: bookedTotalPages,
    paginatedData: paginatedBookedRooms,
    goToPage: goToBookedPage,
    itemsPerPage: bookedItemsPerPage,
  } = usePagination({
    data: bookedRooms,
    itemsPerPage: 9,
  });

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setMessage({ type: "success", text: "Room booked successfully!" });
      closeModal();
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({
        type: "error",
        text: error?.response?.data?.message || "Failed to book room",
      });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const openBookingModal = (room: Room) => {
    if (room.status === "booked") {
      setMessage({ type: "error", text: "This room is already booked" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setSelectedRoom(room);
    setFormData({
      start_date: "",
      end_date: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom || !formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights > 0 ? nights * selectedRoom.price_per_night : 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoom) return;

    // Validate dates
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);

    if (start >= end) {
      setMessage({ type: "error", text: "End date must be after start date" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const bookingData: CreateBookingData = {
      room_id: selectedRoom.room_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
    };

    bookingMutation.mutate(bookingData);
  };

  if (isLoading) return <Loader />;
  if (error) return <div className="error-message">Error loading rooms</div>;

  return (
    <div className="rooms">
      <div className="header">
        <h1 className="page-title">Available Rooms</h1>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      {availableRooms.length === 0 && bookedRooms.length === 0 && (
        <div className="empty-state">
          <p>No rooms available at the moment.</p>
        </div>
      )}

      {availableRooms.length > 0 && (
        <>
          <h2 className="section-title">Available for Booking</h2>
          <div className="rooms-grid">
            {paginatedAvailableRooms.map((room) => (
              <Card key={room.room_id} className="room-card">
                <div className="room-header">
                  <h3 className="room-number">Room {room.room_number}</h3>
                  <span className="room-status status-available">
                    Available
                  </span>
                </div>
                <div className="room-details">
                  <p className="room-type">{room.room_type}</p>
                  <p className="room-price">${room.price_per_night}/night</p>
                </div>
                <div className="room-actions">
                  <Button onClick={() => openBookingModal(room)}>
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination
            currentPage={availablePage}
            totalPages={availableTotalPages}
            onPageChange={goToAvailablePage}
            itemsPerPage={availableItemsPerPage}
            totalItems={availableRooms.length}
          />
        </>
      )}

      {bookedRooms.length > 0 && (
        <>
          <h2 className="section-title">Currently Booked</h2>
          <div className="rooms-grid">
            {paginatedBookedRooms.map((room) => (
              <Card key={room.room_id} className="room-card booked">
                <div className="room-header">
                  <h3 className="room-number">Room {room.room_number}</h3>
                  <span className="room-status status-booked">Booked</span>
                </div>
                <div className="room-details">
                  <p className="room-type">{room.room_type}</p>
                  <p className="room-price">${room.price_per_night}/night</p>
                </div>
              </Card>
            ))}
          </div>
          <Pagination
            currentPage={bookedPage}
            totalPages={bookedTotalPages}
            onPageChange={goToBookedPage}
            itemsPerPage={bookedItemsPerPage}
            totalItems={bookedRooms.length}
          />
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Book Room ${selectedRoom?.room_number}`}
      >
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="room-info">
            <p>
              <strong>Type:</strong> {selectedRoom?.room_type}
            </p>
            <p>
              <strong>Price:</strong> ${selectedRoom?.price_per_night}/night
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="start_date">Check-in Date</label>
            <input
              id="start_date"
              type="date"
              value={formData.start_date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">Check-out Date</label>
            <input
              id="end_date"
              type="date"
              value={formData.end_date}
              min={
                formData.start_date || new Date().toISOString().split("T")[0]
              }
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              required
            />
          </div>

          {formData.start_date && formData.end_date && (
            <div className="total-price">
              <strong>Total Price:</strong> ${calculateTotalPrice()}
            </div>
          )}

          <div className="form-actions">
            <Button type="button" onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={bookingMutation.isPending}>
              {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
