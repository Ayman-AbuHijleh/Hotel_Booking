import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllBookings } from "../../services/booking.api";
import { getAllRooms } from "../../services/room.api";
import DashboardCard from "../../components/DashboardCard";
import DetailCard from "../../components/DetailCard";
import Loader from "../../components/Loader";
import {
  QUERY_KEYS,
  BookingStatus,
  RoomStatus,
  RoomType,
} from "../../constants";
import "./AdminDashboard.scss";

export default function AdminDashboard() {
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: [QUERY_KEYS.ALL_BOOKINGS],
    queryFn: () => getAllBookings(),
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: [QUERY_KEYS.ROOMS],
    queryFn: () => getAllRooms(),
  });

  const stats = useMemo(() => {
    const activeBookings = bookings.filter(
      (b) => b.status === BookingStatus.ACTIVE
    );
    const completedBookings = bookings.filter(
      (b) => b.status === BookingStatus.COMPLETED
    );
    const cancelledBookings = bookings.filter(
      (b) => b.status === BookingStatus.CANCELLED
    );
    const availableRooms = rooms.filter(
      (r) => r.status === RoomStatus.AVAILABLE
    );
    const bookedRooms = rooms.filter((r) => r.status === RoomStatus.BOOKED);

    const totalRevenue = bookings.reduce((sum, booking) => {
      if (booking.status !== BookingStatus.CANCELLED)
        return sum + booking.total_price;
      return sum;
    }, 0);

    const roomsByType = {
      single: rooms.filter((r) => r.room_type === RoomType.SINGLE).length,
      double: rooms.filter((r) => r.room_type === RoomType.DOUBLE).length,
      suite: rooms.filter((r) => r.room_type === RoomType.SUITE).length,
    };

    return {
      totalBookings: bookings.length,
      activeBookings,
      completedBookings,
      cancelledBookings,
      totalRooms: rooms.length,
      availableRooms,
      bookedRooms,
      totalRevenue,
      roomsByType,
    };
  }, [bookings, rooms]);

  // Dashboard Cards Data
  const dashboardCards = [
    {
      icon: "📅",
      value: stats.totalBookings,
      label: "Total Bookings",
      colorClass: "bookings",
    },
    {
      icon: "✓",
      value: stats.activeBookings.length,
      label: "Active Bookings",
      colorClass: "active",
    },
    {
      icon: "🏠",
      value: stats.totalRooms,
      label: "Total Rooms",
      colorClass: "rooms",
    },
    {
      icon: "🔓",
      value: stats.availableRooms.length,
      label: "Available Rooms",
      colorClass: "available",
    },
    {
      icon: "🔒",
      value: stats.bookedRooms.length,
      label: "Booked Rooms",
      colorClass: "booked",
    },
    {
      icon: "💰",
      value: `$${stats.totalRevenue}`,
      label: "Total Revenue",
      colorClass: "revenue",
    },
  ];

  const bookingStatusDetails = [
    { label: "Active:", value: stats.activeBookings.length },
    { label: "Completed:", value: stats.completedBookings.length },
    { label: "Cancelled:", value: stats.cancelledBookings.length },
  ];

  const roomTypeDetails = [
    { label: "Single:", value: stats.roomsByType.single },
    { label: "Double:", value: stats.roomsByType.double },
    { label: "Suite:", value: stats.roomsByType.suite },
  ];

  if (bookingsLoading || roomsLoading) return <Loader />;

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Dashboard</h1>

      {/*  Dashboard Cards */}
      <div className="stats-grid">
        {dashboardCards.map((card, index) => (
          <DashboardCard
            key={index}
            icon={card.icon}
            value={card.value}
            label={card.label}
            colorClass={card.colorClass}
          />
        ))}
      </div>

      {/*  Detail Cards */}
      <div className="details-grid">
        <DetailCard title="Booking Status" items={bookingStatusDetails} />
        <DetailCard title="Room Types" items={roomTypeDetails} />
      </div>
    </div>
  );
}
