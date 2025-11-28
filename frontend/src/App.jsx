import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import PassengerDashboard from "./pages/passenger/PassengerDashboard";
import DriverDashboard from "./pages/driver/DriverDashboard";

import BookRide from "./pages/passenger/BookRide";
import MyRides from "./pages/passenger/MyRides";
import Carpool from "./pages/passenger/Carpool";
import LiveTracking from "./pages/passenger/LiveTracking";
import Reviews from "./pages/passenger/Reviews";
import Register from "./pages/auth/Register";
import RideRequests from "./pages/driver/RideRequests";
import ActiveRide from "./pages/driver/ActiveRide";
import Earnings from "./pages/driver/Earnings";
import DriverReviews from "./pages/driver/DriverReviews";
import DriverProfile from "./pages/driver/DriverProfile";


import PrivateRoute from "./routes/PrivateRoute";
import Layout from "./components/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      {
        path: "passenger/dashboard",
        element: (
          <PrivateRoute role="passenger">
            <PassengerDashboard />
          </PrivateRoute>
        ),
      },

      {
        path: "passenger/book",
        element: (
          <PrivateRoute role="passenger">
            <BookRide />
          </PrivateRoute>
        ),
      },

      {
        path: "driver/requests",
        element: (
          <PrivateRoute role="driver">
            <RideRequests />
          </PrivateRoute>
        ),
      },

      {
        path: "driver/active-ride",
        element: (
          <PrivateRoute role="driver">
            <ActiveRide />
          </PrivateRoute>
        ),
      },

      {
        path: "driver/earnings",
        element: (
          <PrivateRoute role="driver">
            <Earnings />
          </PrivateRoute>
        ),
      },

      {
        path: "driver/reviews",
        element: (
          <PrivateRoute role="driver">
            <DriverReviews />
          </PrivateRoute>
        ),
      },

      {
        path: "driver/profile",
        element: (
          <PrivateRoute role="driver">
            <DriverProfile />
          </PrivateRoute>
        ),
      },

      {
        path: "passenger/rides",
        element: (
          <PrivateRoute role="passenger">
            <MyRides />
          </PrivateRoute>
        ),
      },

      {
        path: "passenger/carpool",
        element: (
          <PrivateRoute role="passenger">
            <Carpool />
          </PrivateRoute>
        ),
      },

      {
        path: "passenger/live",
        element: (
          <PrivateRoute role="passenger">
            <LiveTracking />
          </PrivateRoute>
        ),
      },
      {
        path: "track/:id",
        element: (
          <PrivateRoute role="passenger">
            <LiveTracking />
          </PrivateRoute>
        ),
      },

      {
        path: "passenger/reviews",
        element: (
          <PrivateRoute role="passenger">
            <Reviews />
          </PrivateRoute>
        ),
      },

      {
        path: "driver/dashboard",
        element: (
          <PrivateRoute role="driver">
            <DriverDashboard />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
