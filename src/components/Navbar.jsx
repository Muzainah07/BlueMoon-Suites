import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Moon,
  BedDouble,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const LINKS = [
  {
    to: "/home",
    label: "Rooms",
    icon: BedDouble,
  },
  {
    to: "/my-bookings",
    label: "My Bookings",
    icon: ClipboardList,
  },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const accountRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setUser(session?.user ?? null);
        setLoadingUser(false);
      }
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoadingUser(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();

    setUser(null);
    setAccountOpen(false);
    setMenuOpen(false);

    navigate("/");
  }

  const initial = (
    user?.email?.charAt(0) || "?"
  ).toUpperCase();

  /*
   * Navbar is NOT displayed on login because App.jsx
   * already hides Navbar on /login.
   *
   * This extra check is just a safety measure.
   */
  if (
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  if (loadingUser) {
    return (
      <header
        className={
          scrolled
            ? "navbar scrolled"
            : "navbar"
        }
      >
        <NavLink
          to="/"
          className="navbar-brand"
        >
          <span className="brand-mark">
            <Moon size={18} />
          </span>

          <span className="brand-text">
            <span className="brand-name">
              BlueMoon Suites
            </span>

            <span className="brand-tag">
              Premium guest booking
            </span>
          </span>
        </NavLink>
      </header>
    );
  }

  return (
    <header
      className={
        scrolled
          ? "navbar scrolled"
          : "navbar"
      }
    >
      <NavLink
        to="/"
        className="navbar-brand"
      >
        <span className="brand-mark">
          <Moon size={18} />
        </span>

        <span className="brand-text">
          <span className="brand-name">
            BlueMoon Suites
          </span>

          <span className="brand-tag">
            Premium guest booking
          </span>
        </span>
      </NavLink>

      {user && (
        <>
          {/* DESKTOP NAVIGATION */}
          <nav className="navbar-links desktop-only">
            {LINKS.map(
              ({
                to,
                label,
                icon: Icon,
              }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active"
                      : "nav-link"
                  }
                >
                  <Icon size={16} />
                  <span className="label">
                    {label}
                  </span>
                </NavLink>
              )
            )}

            {/* ACCOUNT */}
            <div
              className="account-menu"
              ref={accountRef}
            >
              <button
                type="button"
                className="account-trigger"
                onClick={() =>
                  setAccountOpen(
                    (value) => !value
                  )
                }
              >
                <span className="account-avatar">
                  {initial}
                </span>

                <span className="account-email">
                  {user.email}
                </span>

                <ChevronDown
                  size={14}
                  className={
                    accountOpen
                      ? "chev open"
                      : "chev"
                  }
                />
              </button>

              {accountOpen && (
                <div className="account-dropdown">
                  <div className="account-dropdown-header">
                    <span className="account-avatar lg">
                      {initial}
                    </span>

                    <span className="account-dropdown-email">
                      {user.email}
                    </span>
                  </div>

                  <NavLink
                    to="/my-bookings"
                    className="account-dropdown-item"
                  >
                    <ClipboardList size={15} />
                    My Bookings
                  </NavLink>

                  <button
                    type="button"
                    className="account-dropdown-item danger"
                    onClick={handleSignOut}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className="navbar-burger mobile-only"
            onClick={() =>
              setMenuOpen(
                (value) => !value
              )
            }
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

          {/* MOBILE DRAWER */}
          <div
            className={
              menuOpen
                ? "mobile-drawer open"
                : "mobile-drawer"
            }
          >
            <nav className="mobile-drawer-links">
              {LINKS.map(
                ({
                  to,
                  label,
                  icon: Icon,
                }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      isActive
                        ? "mobile-link active"
                        : "mobile-link"
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                )
              )}
            </nav>

            <div className="mobile-drawer-footer">
              <div className="mobile-account">
                <span className="account-avatar">
                  {initial}
                </span>

                <span>
                  {user.email}
                </span>
              </div>

              <button
                type="button"
                className="button secondary block"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>

          {menuOpen && (
            <div
              className="mobile-scrim"
              onClick={() =>
                setMenuOpen(false)
              }
            />
          )}
        </>
      )}
    </header>
  );
}