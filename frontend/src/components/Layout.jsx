import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <>
      <Header />
      <main className="main-content-wrapper" style={{ minHeight: "calc(100vh - 120px)" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
