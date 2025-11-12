import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../../services/room.api";
import type { Room, CreateRoomData } from "../../services/room.api";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../hooks/usePagination";
import {
  QUERY_KEYS,
  RoomType,
  RoomStatus,
  MessageType,
  API_MESSAGES,
  CONFIRM_MESSAGES,
  type RoomTypeType,
  type RoomStatusType,
} from "../../constants";
import "./AdminRooms.scss";

type RoomFormData = {
  room_number: string;
  room_type: RoomTypeType;
  price_per_night: string;
  status: RoomStatusType;
};

export default function AdminRooms() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>({
    room_number: "",
    room_type: RoomType.SINGLE,
    price_per_night: "",
    status: RoomStatus.AVAILABLE,
  });
  const [message, setMessage] = useState<{
    type: typeof MessageType.SUCCESS | typeof MessageType.ERROR;
    text: string;
  } | null>(null);

  const {
    data: rooms = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.ROOMS],
    queryFn: () => getAllRooms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedRooms,
    goToPage,
    itemsPerPage,
  } = usePagination({
    data: rooms,
    itemsPerPage: 12,
  });

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROOMS] });
      setMessage({
        type: MessageType.SUCCESS,
        text: API_MESSAGES.ROOM_CREATED,
      });
      closeModal();
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({
        type: MessageType.ERROR,
        text: error?.response?.data?.message || API_MESSAGES.ROOM_CREATE_FAILED,
      });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRoomData }) =>
      updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROOMS] });
      setMessage({
        type: MessageType.SUCCESS,
        text: API_MESSAGES.ROOM_UPDATED,
      });
      closeModal();
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({
        type: MessageType.ERROR,
        text: error?.response?.data?.message || API_MESSAGES.ROOM_UPDATE_FAILED,
      });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROOMS] });
      setMessage({
        type: MessageType.SUCCESS,
        text: API_MESSAGES.ROOM_DELETED,
      });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({
        type: MessageType.ERROR,
        text: error?.response?.data?.message || API_MESSAGES.ROOM_DELETE_FAILED,
      });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      room_number: "",
      room_type: RoomType.SINGLE,
      price_per_night: "",
      status: RoomStatus.AVAILABLE,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      price_per_night: room.price_per_night.toString(),
      status: room.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const roomData: CreateRoomData = {
      room_number: formData.room_number,
      room_type: formData.room_type,
      price_per_night: parseInt(formData.price_per_night),
      status: formData.status,
    };

    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.room_id, data: roomData });
    } else {
      createMutation.mutate(roomData);
    }
  };

  const handleDelete = (roomId: string) => {
    if (window.confirm(CONFIRM_MESSAGES.DELETE_ROOM)) {
      deleteMutation.mutate(roomId);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <div className="error-message">Error loading rooms</div>;

  return (
    <div className="admin-rooms">
      <div className="header">
        <h1 className="page-title">Manage Rooms</h1>
        <Button onClick={openCreateModal}>Add New Room</Button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}

      <div className="rooms-grid">
        {paginatedRooms.map((room) => (
          <Card key={room.room_id} className="room-card">
            <div className="room-header">
              <h3 className="room-number">Room {room.room_number}</h3>
              <span className={`room-status status-${room.status}`}>
                {room.status}
              </span>
            </div>
            <div className="room-details">
              <p className="room-type">{room.room_type}</p>
              <p className="room-price">${room.price_per_night}/night</p>
            </div>
            <div className="room-actions">
              <Button onClick={() => openEditModal(room)} variant="secondary">
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(room.room_id)}
                variant="danger"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {rooms && rooms.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          itemsPerPage={itemsPerPage}
          totalItems={rooms.length}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRoom ? "Edit Room" : "Add New Room"}
      >
        <form onSubmit={handleSubmit} className="room-form">
          <div className="form-group">
            <label htmlFor="room_number">Room Number</label>
            <input
              id="room_number"
              type="text"
              value={formData.room_number}
              onChange={(e) =>
                setFormData({ ...formData, room_number: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="room_type">Room Type</label>
            <select
              id="room_type"
              value={formData.room_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  room_type: e.target.value as RoomTypeType,
                })
              }
              required
            >
              <option value={RoomType.SINGLE}>Single</option>
              <option value={RoomType.DOUBLE}>Double</option>
              <option value={RoomType.SUITE}>Suite</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price_per_night">Price Per Night ($)</label>
            <input
              id="price_per_night"
              type="number"
              min="1"
              value={formData.price_per_night}
              onChange={(e) =>
                setFormData({ ...formData, price_per_night: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as RoomStatusType,
                })
              }
              required
            >
              <option value={RoomStatus.AVAILABLE}>Available</option>
              <option value={RoomStatus.BOOKED}>Booked</option>
            </select>
          </div>

          <div className="form-actions">
            <Button type="button" onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingRoom
                ? "Update Room"
                : "Create Room"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
