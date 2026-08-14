import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  X,
  User,
  Mail,
  Users,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import "./BookingForm.css";

export default function BookingForm({ room, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    num_people: 1,
    num_rooms: 1,
    checkin: "",
    checkout: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  /*
   * Load the currently logged-in user's email
   * so the customer doesn't have to type it again.
   */
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setFormData((current) => ({
          ...current,
          email: user.email || "",
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "",
        }));
      }
    }

    loadUser();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrorMessage("");
  }

  /*
   * Calculate number of nights.
   */
  const nights =
    formData.checkin && formData.checkout
      ? Math.max(
          0,
          Math.round(
            (
              new Date(formData.checkout) -
              new Date(formData.checkin)
            ) / 86400000
          )
        )
      : 0;

  /*
   * Calculate estimated total.
   */
  const estTotal =
    nights > 0
      ? nights *
        Number(room.price || 0) *
        Number(formData.num_rooms || 1)
      : 0;

  async function handleSubmit(e) {
    e.preventDefault();

    setErrorMessage("");

    /*
     * Validate dates.
     */
    if (!formData.checkin || !formData.checkout) {
      setErrorMessage(
        "Please select both check-in and check-out dates."
      );
      return;
    }

    const checkInDate = new Date(
      formData.checkin
    );

    const checkOutDate = new Date(
      formData.checkout
    );

    if (checkOutDate <= checkInDate) {
      setErrorMessage(
        "Check-out must be after check-in."
      );
      return;
    }

    /*
     * Validate guest count.
     */
    if (
      Number(formData.num_people) < 1 ||
      Number(formData.num_people) > 3
    ) {
      setErrorMessage(
        "This room allows between 1 and 3 guests."
      );
      return;
    }

    /*
     * Validate room count.
     */
    if (Number(formData.num_rooms) < 1) {
      setErrorMessage(
        "Please select at least one room."
      );
      return;
    }

    setSubmitting(true);

    /*
     * Verify the authenticated user.
     */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSubmitting(false);

      setErrorMessage(
        "Your session has expired. Please sign in again."
      );

      return;
    }

    /*
     * Check whether the room is already booked
     * during the selected dates.
     */
    const {
      data: existingBookings,
      error: fetchError,
    } = await supabase
      .from("bookings")
      .select("id")
      .eq("room_id", room.id)
      .in("status", ["confirmed", "pending"])
      .or(
        `and(check_in.lte.${formData.checkout},check_out.gte.${formData.checkin})`
      );

    if (fetchError) {
      console.error(
        "Availability check failed:",
        fetchError
      );

      setSubmitting(false);

      setErrorMessage(
        "Failed to check room availability. Please try again."
      );

      return;
    }

    if (
      existingBookings &&
      existingBookings.length > 0
    ) {
      setSubmitting(false);

      setErrorMessage(
        "Sorry, this room is already booked for the selected dates."
      );

      return;
    }

    /*
     * Create booking.
     */
    const { error: bookingError } =
      await supabase.from("bookings").insert([
        {
          user_id: user.id,
          room_id: room.id,
          customer_name: formData.name.trim(),
          customer_email: formData.email.trim(),
          num_people: Number(
            formData.num_people
          ),
          num_rooms: Number(
            formData.num_rooms
          ),
          check_in: formData.checkin,
          check_out: formData.checkout,
          status: "confirmed",
        },
      ]);

    if (bookingError) {
      console.error(
        "Booking failed:",
        bookingError
      );

      setSubmitting(false);

      setErrorMessage(
        "Booking failed: " +
          bookingError.message
      );

      return;
    }

    /*
     * Send confirmation email.
     *
     * This is intentionally non-blocking.
     * A failed email should NOT undo a successful booking.
     */
    try {
      const { error: emailError } =
        await supabase.functions.invoke(
          "send_booking_email",
          {
            body: {
              email: formData.email.trim(),
              customer_name:
                formData.name.trim(),
              room_id: room.id,
              check_in: formData.checkin,
              check_out: formData.checkout,
            },
          }
        );

      if (emailError) {
        console.error(
          "Booking email error:",
          emailError
        );
      }
    } catch (emailError) {
      console.error(
        "Booking email exception:",
        emailError
      );
    }

    setSubmitting(false);

    setConfirmationMessage(
      `Your stay in Room ${room.room_number} has been confirmed from ${formData.checkin} to ${formData.checkout}.`
    );

    setBookingComplete(true);
  }

  /*
   * SUCCESS SCREEN
   */
  if (bookingComplete) {
    return (
      <div className="booking-success-panel">
        <button
          type="button"
          className="booking-close-button"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="booking-success-icon">
          <CheckCircle2 size={48} />
        </div>

        <h2>Booking Confirmed!</h2>

        <p className="booking-success-message">
          {confirmationMessage}
        </p>

        <div className="booking-success-details">
          <div>
            <span>Room</span>
            <strong>
              Room {room.room_number}
            </strong>
          </div>

          <div>
            <span>Check-in</span>
            <strong>
              {formData.checkin}
            </strong>
          </div>

          <div>
            <span>Check-out</span>
            <strong>
              {formData.checkout}
            </strong>
          </div>

          <div>
            <span>Total</span>
            <strong>
              ${estTotal}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="button accent block"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    );
  }

  /*
   * BOOKING FORM
   */
  return (
    <div className="booking-form-panel card">
      <div className="panel-header">
        <div>
          <p className="ui-label">
            Reserve room
          </p>

          <h2>
            Room {room.room_number} ·{" "}
            {room.type}
          </h2>
        </div>

        <button
          type="button"
          className="button ghost icon-only"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {errorMessage && (
        <div className="form-error">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        className="booking-form"
        onSubmit={handleSubmit}
      >
        {/* NAME */}
        <div className="form-group">
          <label htmlFor="booking-name">
            Name
          </label>

          <div className="field-wrap">
            <User size={16} />

            <input
              id="booking-name"
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* EMAIL */}
        <div className="form-group">
          <label htmlFor="booking-email">
            Email
          </label>

          <div className="field-wrap">
            <Mail size={16} />

            <input
              id="booking-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* GUESTS + ROOMS */}
        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="booking-guests">
              Guests
            </label>

            <div className="field-wrap">
              <Users size={16} />

              <input
                id="booking-guests"
                type="number"
                name="num_people"
                min="1"
                max="3"
                value={formData.num_people}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="booking-rooms">
              Rooms
            </label>

            <div className="field-wrap">
              <BedDouble size={16} />

              <input
                id="booking-rooms"
                type="number"
                name="num_rooms"
                min="1"
                value={formData.num_rooms}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* DATES */}
        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="booking-checkin">
              Check-in
            </label>

            <div className="field-wrap">
              <CalendarDays size={16} />

              <input
                id="booking-checkin"
                type="date"
                name="checkin"
                value={formData.checkin}
                onChange={handleChange}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="booking-checkout">
              Check-out
            </label>

            <div className="field-wrap">
              <CalendarDays size={16} />

              <input
                id="booking-checkout"
                type="date"
                name="checkout"
                value={formData.checkout}
                onChange={handleChange}
                min={
                  formData.checkin ||
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                required
              />
            </div>
          </div>
        </div>

        {/* PRICE SUMMARY */}
        {nights > 0 && (
          <div className="booking-summary">
            <span>
              {nights}{" "}
              {nights === 1
                ? "night"
                : "nights"}{" "}
              × {formData.num_rooms}{" "}
              {Number(formData.num_rooms) === 1
                ? "room"
                : "rooms"}
            </span>

            <span className="booking-summary-total">
              ${estTotal}
            </span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="form-actions">
          <button
            type="submit"
            className="button accent"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2
                  size={16}
                  className="spin-icon"
                />
                Booking...
              </>
            ) : (
              "Confirm booking"
            )}
          </button>

          <button
            type="button"
            className="button secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}