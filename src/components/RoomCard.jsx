import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import BookingForm from "./BookingForm";
import { Users, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";
import "./RoomCard.css";

const IMAGE_BY_TYPE = {
  single: "/images/102.jpg",
  double: "/images/double_room.jpg",
  suite: "/images/suite_room.jpg",
};

function imageForRoom(room) {
  const key = (room.type || "").toLowerCase();

  return (
    IMAGE_BY_TYPE[key] ||
    "/images/double_room.jpg"
  );
}

export default function RoomCard({ room }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showForm, setShowForm] = useState(false);

  const statusKey = (
    room.status || "available"
  ).toLowerCase();

  const isAvailable =
    statusKey.includes("available") ||
    statusKey === "";

  const badgeClass = statusKey.includes("available")
    ? "available"
    : statusKey.includes("confirmed")
    ? "confirmed"
    : statusKey.includes("pending")
    ? "pending"
    : statusKey.includes("cancel")
    ? "cancelled"
    : "unavailable";

  async function handleBookRoom() {
    if (!isAvailable) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname,
          roomId: room.id,
        },
      });

      return;
    }

    setShowForm(true);
  }

  return (
    <>
      <article className="room-card card">
        <div className="room-card__image-wrap">
          <img
            src={imageForRoom(room)}
            alt={room.type || "Room"}
            className="room-card__image"
          />

          <span
            className={`badge ${badgeClass} room-card__badge`}
          >
            {room.status || "Available"}
          </span>
        </div>

        <div className="room-card__body">
          <div className="room-card__header">
            <p className="room-card__title">
              Room {room.room_number}
            </p>

            <p className="room-card__meta">
              {room.type}
            </p>
          </div>

          <div className="room-card__features">
            <span>
              <Users size={13} />
              Up to 3 guests
            </span>

            <span>
              <ShieldCheck size={13} />
              Free cancellation
            </span>
          </div>

          <div className="room-card__footer">
            <div>
              <span className="room-card__price">
                ${room.price}
              </span>

              <span className="room-card__price-unit">
                {" "}
                / night
              </span>
            </div>

            <button
              type="button"
              className="button accent"
              onClick={handleBookRoom}
              disabled={!isAvailable}
            >
              {isAvailable
                ? "Book room"
                : "Unavailable"}
            </button>
          </div>
        </div>
      </article>

      {showForm &&
        createPortal(
          <div
            className="booking-modal-overlay"
            onClick={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setShowForm(false);
              }
            }}
          >
            <div className="booking-modal-container">
              <BookingForm
                room={room}
                onClose={() =>
                  setShowForm(false)
                }
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}