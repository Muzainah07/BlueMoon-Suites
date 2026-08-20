import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Moon, LayoutDashboard, ClipboardList, BedDouble, Users,
  LogOut, ArrowLeft, Lock, User as UserIcon, Search, Trash2, Pencil, Check, X,
  Download, AlertCircle, CalendarX2,
} from "lucide-react";
import "./AdminDashboard.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: ClipboardList },
  { id: "rooms", label: "Rooms", icon: BedDouble },
  { id: "guests", label: "Guests", icon: Users },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [editingBooking, setEditingBooking] = useState(null);
  const [newRoom, setNewRoom] = useState({ room_number: "", type: "", price: "" });
  const [loginError, setLoginError] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [bookingSearch, setBookingSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loggingIn, setLoggingIn] = useState(false);

 async function handleLogin(e) {
  e.preventDefault();
  setLoggingIn(true);

  if (login.username === "Muzainah" && login.password === "muzainahkhan") {
    const { error } = await supabase.auth.signInWithPassword({
      email: "bluemoonsuites.auth@gmail.com",  
      password: "AdminPass2026!",          
    });

    if (error) {
      console.error("Backend session error:", error.message);
      setLoginError("Something went wrong. Try again.");
      setLoggingIn(false);
      return;
    }

    setIsAdmin(true);
    setLoginError("");
    fetchBookings();
    fetchRooms();
  } else {
    setLoginError("Invalid username or password.");
  }

  setLoggingIn(false);
}

  async function handleLogout() {
  await supabase.auth.signOut();
  setIsAdmin(false);
  setLogin({ username: "", password: "" });
  setActiveSection("dashboard");
}
  async function fetchBookings() {
    const { data } = await supabase.from("bookings").select("*");
    setBookings(data || []);
  }

  async function fetchRooms() {
    const { data } = await supabase.from("rooms").select("*");
    setRooms(data || []);
  }

  async function deleteBooking(id) {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) setDialogMessage("Failed to delete booking: " + error.message);
    fetchBookings();
  }

  async function updateBookingStatus(id, newStatus) {
    const statusMap = { approved: "confirmed", rejected: "cancelled" };
    const statusToUpdate = statusMap[newStatus] || newStatus;

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (bookingError || !bookingData) {
      setDialogMessage("Error fetching booking details.");
      return;
    }

    if (statusToUpdate === "confirmed") {
      const { data: overlapping, error: overlapError } = await supabase
        .from("bookings")
        .select("*")
        .eq("room_id", bookingData.room_id)
        .eq("status", "confirmed")
        .or(`and(check_in.lte.${bookingData.check_out},check_out.gte.${bookingData.check_in})`);

      if (overlapError) {
        console.error(overlapError);
        setDialogMessage("Error checking room availability.");
        return;
      }

      if (overlapping.length > 0) {
        setDialogMessage("Cannot confirm: Room is already booked for these dates.");
        return;
      }

      const { error: emailError } = await supabase.functions.invoke("send_booking_email", {
        body: {
          email: bookingData.customer_email,
          customer_name: bookingData.customer_name,
          room_id: bookingData.room_id,
          check_in: bookingData.check_in,
          check_out: bookingData.check_out,
        },
      });
      if (emailError) console.error("Email error:", emailError);
    }

    const { error } = await supabase.from("bookings").update({ status: statusToUpdate }).eq("id", id);
    if (error) setDialogMessage("Failed to update booking status: " + error.message);
    fetchBookings();
  }

  async function saveEditedBooking() {
    await supabase.from("bookings").update(editingBooking).eq("id", editingBooking.id);
    setEditingBooking(null);
    fetchBookings();
  }

  async function addRoom() {
    if (!newRoom.room_number || !newRoom.type || !newRoom.price) {
      setDialogMessage("Please fill all required fields!");
      return;
    }

    const { error } = await supabase.from("rooms").insert([
      { room_number: newRoom.room_number, type: newRoom.type, price: Number(newRoom.price) },
    ]);

    if (error) {
      setDialogMessage("Error adding room: " + error.message);
      return;
    }

    setNewRoom({ room_number: "", type: "", price: "" });
    fetchRooms();
  }

  async function deleteRoom(id) {
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) setDialogMessage("Error deleting room: " + error.message);
    fetchRooms();
  }

  function exportCSV() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Customer,Email,Room,Rooms,People,Check-in,Check-out,Status"]
        .concat(
          bookings.map(
            (b) =>
              `${b.customer_name},${b.customer_email},${b.room_id},${b.num_rooms},${b.num_people},${b.check_in},${b.check_out},${b.status || "pending"}`
          )
        )
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "bookings.csv");
    document.body.appendChild(link);
    link.click();
  }

  const totalBookings = bookings.length;
  const totalRooms = rooms.length;
  const totalRevenue = bookings.reduce((sum, b) => {
    const room = rooms.find((r) => r.id === b.room_id);
    const nights = b.check_in && b.check_out
      ? Math.max(0, Math.round((new Date(b.check_out) - new Date(b.check_in)) / 86400000))
      : 0;
    return sum + (room ? room.price * nights * (b.num_rooms || 1) : 0);
  }, 0);

  const guestCount = new Set(
    bookings.map((b) => (b.customer_email || b.customer_name || "").trim()).filter(Boolean)
  ).size;

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !bookingSearch ||
      (b.customer_name || "").toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.customer_email || "").toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || (b.status || "pending").toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const recentBookings = bookings
    .slice()
    .sort((a, b) => new Date(b.check_in) - new Date(a.check_in))
    .slice(0, 5);

  if (!isAdmin) {
    return (
      <div className="admin-login">
        <div className="admin-login-card card">
          <button type="button" className="admin-login-back" onClick={() => navigate("/")}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="admin-login-mark"><Moon size={20} /></div>
          <h2>Admin sign in</h2>
          <p className="admin-login-sub">Manage rooms, bookings and guest activity.</p>

          {loginError && <div className="form-error"><AlertCircle size={16} /><span>{loginError}</span></div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <div className="field-wrap">
                <UserIcon size={16} />
                <input
                  type="text"
                  value={login.username}
                  onChange={(e) => setLogin({ ...login, username: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="field-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="button primary block" disabled={loggingIn}>
              {loggingIn && <span className="spinner" />}
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      {dialogMessage && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <p>{dialogMessage}</p>
            <button className="button primary block" onClick={() => setDialogMessage("")}>OK</button>
          </div>
        </div>
      )}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark"><Moon size={16} /></span>
          <span>BlueMoon Admin</span>
        </div>
        <nav className="admin-side-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activeSection === item.id ? "admin-side-link active" : "admin-side-link"}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon size={17} /> {item.label}
              </button>
            );
          })}
        </nav>
        <button className="admin-side-link logout" onClick={handleLogout}>
          <LogOut size={17} /> Logout
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>{NAV_ITEMS.find((n) => n.id === activeSection)?.label}</h1>
            <p className="tagline">Your hotel operations, simplified.</p>
          </div>
          <button className="button secondary" onClick={exportCSV}>
            <Download size={15} /> Export CSV
          </button>
        </header>

        {activeSection === "dashboard" && (
          <section className="admin-section">
            <div className="stats">
              <div className="stat-card"><p className="stat-label">Bookings</p><p className="stat-value">{totalBookings}</p></div>
              <div className="stat-card"><p className="stat-label">Rooms</p><p className="stat-value">{totalRooms}</p></div>
              <div className="stat-card"><p className="stat-label">Guests</p><p className="stat-value">{guestCount}</p></div>
              <div className="stat-card accent"><p className="stat-label">Est. Revenue</p><p className="stat-value">${totalRevenue}</p></div>
            </div>

            <div className="admin-panel card">
              <h3>Recent bookings</h3>
              {recentBookings.length === 0 ? (
                <p className="section-note">No bookings yet.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Guest</th><th>Room</th><th>Check-in</th><th>Status</th></tr></thead>
                    <tbody>
                      {recentBookings.map((b) => (
                        <tr key={b.id}>
                          <td>{b.customer_name}</td>
                          <td>{b.room_id}</td>
                          <td>{b.check_in}</td>
                          <td><span className={`badge ${(b.status || "pending").toLowerCase()}`}>{b.status || "pending"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === "bookings" && (
          <section className="admin-section">
            <div className="admin-toolbar">
              <div className="field-wrap toolbar-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by guest name or email…"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="toolbar-select">
                <option value="all">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="empty-state card"><CalendarX2 size={32} /><p>No bookings match your filters.</p></div>
            ) : (
              <div className="grid">
                {filteredBookings.map((b) =>
                  editingBooking?.id === b.id ? (
                    <div key={b.id} className="booking-admin-card card editing">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          value={editingBooking.customer_name}
                          onChange={(e) => setEditingBooking({ ...editingBooking, customer_name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          value={editingBooking.customer_email}
                          onChange={(e) => setEditingBooking({ ...editingBooking, customer_email: e.target.value })}
                        />
                      </div>
                      <div className="admin-card-actions">
                        <button className="button primary sm" onClick={saveEditedBooking}><Check size={14} /> Save</button>
                        <button className="button ghost sm" onClick={() => setEditingBooking(null)}><X size={14} /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div key={b.id} className="booking-admin-card card">
                      <div className="booking-admin-top">
                        <div>
                          <p className="booking-admin-name">{b.customer_name}</p>
                          <p className="booking-admin-email">{b.customer_email}</p>
                        </div>
                        <span className={`badge ${(b.status || "pending").toLowerCase()}`}>{b.status || "pending"}</span>
                      </div>
                      <div className="booking-admin-meta">
                        <span><BedDouble size={13} /> Room {b.room_id}</span>
                        <span><Users size={13} /> {b.num_rooms} room(s), {b.num_people} people</span>
                      </div>
                      <p className="booking-admin-dates">{b.check_in} → {b.check_out}</p>
                      <div className="admin-card-actions">
                        <button className="button ghost sm" onClick={() => setEditingBooking(b)}><Pencil size={13} /> Edit</button>
                        <button className="button secondary sm" onClick={() => updateBookingStatus(b.id, "approved")}><Check size={13} /> Approve</button>
                        <button className="button danger sm" onClick={() => updateBookingStatus(b.id, "rejected")}><X size={13} /> Reject</button>
                        <button className="button ghost sm icon-only" onClick={() => deleteBooking(b.id)} aria-label="Delete"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        )}

        {activeSection === "rooms" && (
          <section className="admin-section">
            <div className="admin-panel card room-form-panel">
              <h3>Add a room</h3>
              <div className="room-form">
                <input
                  type="text"
                  placeholder="Room number"
                  value={newRoom.room_number}
                  onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                />
                <select value={newRoom.type} onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}>
                  <option value="">Select type</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                </select>
                <input
                  type="number"
                  placeholder="Price / night"
                  value={newRoom.price}
                  onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                />
                <button className="button accent" onClick={addRoom}>Add room</button>
              </div>
            </div>

            {rooms.length === 0 ? (
              <div className="empty-state card"><BedDouble size={32} /><p>No rooms added yet.</p></div>
            ) : (
              <div className="grid">
                {rooms.map((r) => (
                  <div key={r.id} className="room-admin-card card">
                    <div>
                      <p className="room-admin-title">Room {r.room_number}</p>
                      <p className="room-admin-meta">{r.type} · ${r.price}/night</p>
                    </div>
                    <button className="button ghost sm icon-only" onClick={() => deleteRoom(r.id)} aria-label="Delete room">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === "guests" && (
          <section className="admin-section">
            {guestCount === 0 ? (
              <div className="empty-state card"><Users size={32} /><p>No guests yet.</p></div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Guest</th><th>Email</th><th>Bookings</th></tr></thead>
                  <tbody>
                    {Object.values(
                      bookings.reduce((acc, b) => {
                        const key = b.customer_email || b.customer_name;
                        if (!key) return acc;
                        if (!acc[key]) acc[key] = { name: b.customer_name, email: b.customer_email, count: 0 };
                        acc[key].count += 1;
                        return acc;
                      }, {})
                    ).map((g, i) => (
                      <tr key={i}>
                        <td>{g.name}</td>
                        <td>{g.email}</td>
                        <td>{g.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
