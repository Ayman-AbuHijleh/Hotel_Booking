import { lazy, Suspense } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Loader from "../components/Loader";

// Eager load critical pages (Login and Signup)
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";

// Lazy load other pages for better performance
const MainLayout = lazy(() => import("../layouts/MainLayout"));
const AdminDashboard = lazy(
  () => import("../pages/AdminDashboard/AdminDashboard")
);
const AdminRooms = lazy(() => import("../pages/AdminRooms/AdminRooms"));
const AdminBookings = lazy(
  () => import("../pages/AdminBookings/AdminBookings")
);
const Rooms = lazy(() => import("../pages/Rooms/Rooms"));
const MyBookings = lazy(() => import("../pages/MyBookings/MyBookings"));
const ProtectedRoute = lazy(() => import("../features/auth/ProtectedRoutes"));
const PageNotFound = lazy(() => import("../features/errors/PageNotFound"));
const ErrorHandler = lazy(() => import("../features/errors/ErrorHandler"));

// Wrapper component for lazy loaded routes
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loader />}>{children}</Suspense>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        index
        element={<Login />}
        errorElement={
          <LazyWrapper>
            <ErrorHandler />
          </LazyWrapper>
        }
      />
      <Route
        path="/signup"
        element={<Signup />}
        errorElement={
          <LazyWrapper>
            <ErrorHandler />
          </LazyWrapper>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <LazyWrapper>
            <ProtectedRoute requiredRole="admin">
              <MainLayout />
            </ProtectedRoute>
          </LazyWrapper>
        }
        errorElement={
          <LazyWrapper>
            <ErrorHandler />
          </LazyWrapper>
        }
      >
        <Route
          path="dashboard"
          element={
            <LazyWrapper>
              <AdminDashboard />
            </LazyWrapper>
          }
        />
        <Route
          path="rooms"
          element={
            <LazyWrapper>
              <AdminRooms />
            </LazyWrapper>
          }
        />
        <Route
          path="bookings"
          element={
            <LazyWrapper>
              <AdminBookings />
            </LazyWrapper>
          }
        />
      </Route>

      {/* Customer Routes */}
      <Route
        path="/"
        element={
          <LazyWrapper>
            <ProtectedRoute requiredRole="customer">
              <MainLayout />
            </ProtectedRoute>
          </LazyWrapper>
        }
        errorElement={
          <LazyWrapper>
            <ErrorHandler />
          </LazyWrapper>
        }
      >
        <Route
          path="rooms"
          element={
            <LazyWrapper>
              <Rooms />
            </LazyWrapper>
          }
        />
        <Route
          path="my-bookings"
          element={
            <LazyWrapper>
              <MyBookings />
            </LazyWrapper>
          }
        />
      </Route>

      {/* Error Handler */}
      <Route
        path="*"
        element={
          <LazyWrapper>
            <PageNotFound />
          </LazyWrapper>
        }
      />
    </>
  )
);

export default router;
