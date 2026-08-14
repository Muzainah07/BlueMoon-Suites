import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { CheckCircle2, CalendarX2, Users, BedDouble } from "lucide-react";
import "./Booking.css";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    fetchBookings();

    // Subscribe to real-time booking confirmations (Supabase v2 API)
    const channel = supabase
      .channel("bookings-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings" },
        (payload) => {
          const updatedBooking = payload.new;
          if (updatedBooking.status === "confirmed") {
            setDialogMessage(
              `Booking confirmed for Room ${updatedBooking.room_id} from ${updatedBooking.check_in} to ${updatedBooking.check_out}`
            );
            fetchBookings();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, customer_name, room_id, num_rooms, num_people, check_in, check_out, status")
      .eq("status", "confirmed");

    if (error) console.error(error);
    else setBookings(data || []);
  }

  return (
    <div className="bookings-container">
      {dialogMessage && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <div className="dialog-icon"><CheckCircle2 size={28} /></div>
            <p>{dialogMessage}</p>
            <button className="button primary block" onClick={() => setDialogMessage("")}>OK</button>
          </div>
        </div>
      )}

      <div className="section-header">
        <div>
          <h2 className="section-title">Confirmed Bookings</h2>
          <p className="section-note">Live view of confirmed reservations.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state card">
          <CalendarX2 size={36} />
          <p>No confirmed bookings yet.</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((b) => (
            <div key={b.id} className="booking-card card">
              <p className="booking-card-name">{b.customer_name}</p>
              <div className="booking-card-meta">
                <span><BedDouble size={13} /> Room {b.room_id}</span>
                <span><Users size={13} /> {b.num_rooms} room(s), {b.num_people} people</span>
              </div>
              <p className="booking-card-dates">{b.check_in} → {b.check_out}</p>
              <span className={`badge ${(b.status || "pending").toLowerCase()}`}>{b.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
