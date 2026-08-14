import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ArrowLeft, CalendarX2, AlertCircle, Users, BedDouble } from "lucide-react";
import "./BookingList.css";

export default function BookingList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBookings() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      const userEmail = session?.user?.email;
      let query = supabase.from("bookings").select("*").order("check_in", { ascending: false });

      if (userEmail) {
        query = query.eq("customer_email", userEmail);
      }

      const { data, error } = await query;
      if (error) {
        setError(error.message);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    }

    fetchBookings();
  }, []);

  return (
    <div className="booking-list-container">
      <button className="booking-list-back" onClick={() => navigate("/home")}>
        <ArrowLeft size={16} /> Back to rooms
      </button>

      <div className="section-header">
        <div>
          <h2 className="section-title">My Bookings</h2>
          <p className="section-note">A record of your reservations at BlueMoon Suites.</p>
        </div>
      </div>

      {loading ? (
        <div className="booking-list-loading">
          {[1, 2, 3].map((i) => <div key={i} className="booking-skeleton" />)}
        </div>
      ) : error ? (
        <div className="form-error"><AlertCircle size={16} /><span>{error}</span></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state card">
          <CalendarX2 size={36} />
          <p>You don't have any bookings yet.</p>
          <button className="button accent" onClick={() => navigate("/home")}>Browse rooms</button>
        </div>
      ) : (
        <>
          <div className="booking-cards">
            {bookings.map((b) => (
              <div key={b.id} className="booking-row-card card">
                <div className="booking-row-main">
                  <p className="booking-row-guest">{b.customer_name}</p>
                  <div className="booking-row-meta">
                    <span><BedDouble size={13} /> Room {b.room_id}</span>
                    <span><Users size={13} /> {b.num_people} guest(s), {b.num_rooms} room(s)</span>
                  </div>
                  <p className="booking-row-dates">{b.check_in} → {b.check_out}</p>
                </div>
                <span className={`badge ${(b.status || "pending").toLowerCase()}`}>{b.status || "pending"}</span>
              </div>
            ))}
          </div>

          <div className="table-wrapper booking-table-desktop">
            <table className="booking-list">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Details</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.customer_name}</td>
                    <td>{booking.room_id}</td>
                    <td>{booking.num_rooms} room(s), {booking.num_people} guest(s)</td>
                    <td>{booking.check_in}</td>
                    <td>{booking.check_out}</td>
                    <td><span className={`badge ${(booking.status || "pending").toLowerCase()}`}>{booking.status || "pending"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
