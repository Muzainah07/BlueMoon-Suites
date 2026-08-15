import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import RoomCard from "../components/RoomCard";
import {
  Star,
  MessageSquarePlus,
  BedDouble,
  Loader2,
} from "lucide-react";
import "./Home.css";

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    fetchRooms();
    fetchReviews();
  }, []);

  async function fetchRooms() {
    setLoadingRooms(true);

    const {
      data,
      error,
    } = await supabase
      .from("rooms")
      .select("*");

    if (error) {
      console.error("Error fetching rooms:", error);
    } else {
      setRooms(data || []);
    }

    setLoadingRooms(false);
  }

  async function fetchReviews() {
    const {
      data,
      error,
    } = await supabase
      .from("hotel_reviews")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error fetching reviews:",
        error
      );
    } else {
      setReviews(data || []);
    }
  }

  async function submitReview() {
    if (!comment.trim()) return;

    setSubmitting(true);

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    const {
      error,
    } = await supabase
      .from("hotel_reviews")
      .insert([
        {
          rating,
          comment: comment.trim(),
          user_name:
            user?.email || "Anonymous",
        },
      ]);

    setSubmitting(false);

    if (error) {
      console.error(
        "Error submitting review:",
        error
      );
      return;
    }

    setComment("");
    setRating(5);

    fetchReviews();
  }

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, review) =>
              sum + review.rating,
            0
          ) / reviews.length
        ).toFixed(1)
      : null;

  const roomTypes = [
    "All",
    ...new Set(
      rooms
        .map((room) => room.type)
        .filter(Boolean)
    ),
  ];

  const visibleRooms =
    typeFilter === "All"
      ? rooms
      : rooms.filter(
          (room) =>
            room.type === typeFilter
        );

  return (
    <div className="home-container">
      {/* Hero */}
      <section className="home-hero">
        <p className="eyebrow">
          Welcome to BlueMoon Suites
        </p>

        <h1>
          Find your room at BlueMoon Suites
        </h1>

        <p className="page-subtitle">
          Nestled in the heart of the city,
          our boutique hotel combines
          comfort, luxury, and personalized
          experiences for business and
          leisure travelers alike.
        </p>
      </section>

      {/* Rooms */}
      <section className="rooms-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              Available Rooms
            </h2>

            <p className="section-note">
              Choose a room and reserve with
              instant confirmation.
            </p>
          </div>

          {roomTypes.length > 1 && (
            <div className="type-filter">
              {roomTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={
                    typeFilter === type
                      ? "type-chip active"
                      : "type-chip"
                  }
                  onClick={() =>
                    setTypeFilter(type)
                  }
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loadingRooms ? (
          <div className="rooms-grid">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="room-skeleton"
              />
            ))}
          </div>
        ) : visibleRooms.length === 0 ? (
          /* Empty */
          <div className="empty-state card">
            <BedDouble size={36} />

            <p>
              No rooms available right now.
              Please check back soon.
            </p>
          </div>
        ) : (
          /* Rooms */
          <div className="rooms-grid">
            {visibleRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="hotel-reviews">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              Guest Reviews
            </h2>

            <p className="section-note">
              What travelers are saying about
              their stay.
            </p>
          </div>

          {avgRating && (
            <div className="avg-rating">
              <Star
                size={18}
                fill="currentColor"
              />

              <span>{avgRating}</span>

              <span className="avg-rating-count">
                ({reviews.length} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Review Form */}
        <div className="review-form card">
          <p className="review-form-label">
            <MessageSquarePlus size={16} />
            Share your experience
          </p>

          <div className="star-picker">
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <button
                  type="button"
                  key={star}
                  className={
                    star <= rating
                      ? "star-btn active"
                      : "star-btn"
                  }
                  onClick={() =>
                    setRating(star)
                  }
                  aria-label={`${star} star`}
                >
                  <Star
                    size={22}
                    fill={
                      star <= rating
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              )
            )}
          </div>

          <textarea
            placeholder="Tell us about your stay…"
            value={comment}
            onChange={(event) =>
              setComment(event.target.value)
            }
          />

          <button
            type="button"
            className="button accent"
            onClick={submitReview}
            disabled={
              submitting ||
              !comment.trim()
            }
          >
            {submitting ? (
              <Loader2
                size={16}
                className="spin-icon"
              />
            ) : (
              "Submit Review"
            )}
          </button>
        </div>

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews">
              No reviews yet — be the first
              to share your experience.
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="review-item card"
              >
                <div className="review-item-header">
                  <span className="review-avatar">
                    {(
                      review.user_name ||
                      "A"
                    )[0].toUpperCase()}
                  </span>

                  <div>
                    <p className="review-name">
                      {review.user_name}
                    </p>

                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <Star
                            key={star}
                            size={13}
                            fill={
                              star <=
                              review.rating
                                ? "currentColor"
                                : "none"
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>

                <p className="review-comment">
                  Anonymous
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}