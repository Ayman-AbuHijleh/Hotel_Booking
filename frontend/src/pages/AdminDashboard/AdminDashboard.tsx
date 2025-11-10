import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllBookings } from "../../services/booking.api";
import { getAllRooms } from "../../services/room.api";
import Card from "../../components/Card";
import Loader from "../../components/Loader";
import "./AdminDashboard.scss";

export default function AdminDashboard() {
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["allBookings"],
    queryFn: () => getAllBookings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => getAllRooms(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Memoize calculated values to avoid recalculation on every render
  const stats = useMemo(() => {
    const activeBookings = bookings.filter((b) => b.status === "active");
    const completedBookings = bookings.filter((b) => b.status === "completed");
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled");
    const availableRooms = rooms.filter((r) => r.status === "available");
    const bookedRooms = rooms.filter((r) => r.status === "booked");

    const totalRevenue = bookings.reduce((sum, booking) => {
      if (booking.status !== "cancelled") {
        return sum + booking.total_price;
      }
      return sum;
    }, 0);

    const roomsByType = {
      single: rooms.filter((r) => r.room_type === "Single").length,
      double: rooms.filter((r) => r.room_type === "Double").length,
      suite: rooms.filter((r) => r.room_type === "Suite").length,
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

  if (bookingsLoading || roomsLoading) return <Loader />;

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon bookings">📅</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalBookings}</h3>
            <p className="stat-label">Total Bookings</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon active">✓</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.activeBookings.length}</h3>
            <p className="stat-label">Active Bookings</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon rooms">🏠</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalRooms}</h3>
            <p className="stat-label">Total Rooms</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon available">🔓</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.availableRooms.length}</h3>
            <p className="stat-label">Available Rooms</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon booked">🔒</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.bookedRooms.length}</h3>
            <p className="stat-label">Booked Rooms</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <h3 className="stat-value">${stats.totalRevenue}</h3>
            <p className="stat-label">Total Revenue</p>
          </div>
        </Card>
      </div>

      <div className="details-grid">
        <Card className="detail-card">
          <h2 className="detail-title">Booking Status</h2>
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">Active:</span>
              <span className="detail-value">
                {stats.activeBookings.length}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Completed:</span>
              <span className="detail-value">
                {stats.completedBookings.length}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Cancelled:</span>
              <span className="detail-value">
                {stats.cancelledBookings.length}
              </span>
            </div>
          </div>
        </Card>

        <Card className="detail-card">
          <h2 className="detail-title">Room Types</h2>
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">Single:</span>
              <span className="detail-value">{stats.roomsByType.single}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Double:</span>
              <span className="detail-value">{stats.roomsByType.double}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Suite:</span>
              <span className="detail-value">{stats.roomsByType.suite}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
