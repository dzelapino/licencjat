import Link from "next/link";
import styles from "@/styles/components/Navbar.module.scss";
import Logout from "@/components/logout";
import { useState } from "react";
import { selectAuthorizedState, selectRoleState } from "slices/authSlice";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Navbar() {
  const [sidebarActive, setSidebarActive] = useState(false);
  const authorized = useSelector(selectAuthorizedState);
  const role = useSelector(selectRoleState);
  const router = useRouter();

  const handleButtonClick = () => {
    router.back();
  };

  function ShowUserOrLogin(props) {
    return (
      <>
        {props.authorized ? (
          <>
            <Link className={styles.navLink} href="/account/user">
              Account
            </Link>
            <Link className={styles.navLink} href="/games">
              Games
            </Link>
          </>
        ) : (
          <>
            <Link className={styles.navLink} href="/account/login">
              Login
            </Link>
            <Link className={styles.navLink} href="/account/register">
              Register
            </Link>
          </>
        )}
      </>
    );
  }

  function ShowAdminRoute(props) {
    return (
      <>
        {props.role === "admin" ? (
          <>
            <Link className={styles.navLink} href="/admin/view">
              Admin
            </Link>
          </>
        ) : (
          <></>
        )}
      </>
    );
  }

  function ShowSidebar(props) {
    if (props.sidebarActive) {
      return (
        <div className={styles.sidebar}>
          <div
            className={styles.sidebarBackground}
            onClick={() => setSidebarActive(false)}
          ></div>
          <button
            className={styles.sidebarCancel}
            onClick={() => setSidebarActive(false)}
          >
            ✖
          </button>
          <div className={styles.dropMenu}>
            <Link
              className={styles.navLink}
              href="/"
              onClick={() => setSidebarActive(false)}
            >
              Home
            </Link>
            {authorized ? (
              <>
                <Link
                  className={styles.navLink}
                  href="/account/user"
                  onClick={() => setSidebarActive(false)}
                >
                  Account
                </Link>
                <Link
                  className={styles.navLink}
                  href="/games"
                  onClick={() => setSidebarActive(false)}
                >
                  Games
                </Link>
                <Link
                  className={styles.navLink}
                  href="/ranking/gameList"
                  onClick={() => setSidebarActive(false)}
                >
                  Rankings
                </Link>
              </>
            ) : null}
            {role === "admin" ? (
              <>
                <Link
                  className={styles.navLink}
                  href="/admin/view"
                  onClick={() => setSidebarActive(false)}
                >
                  Admin
                </Link>
                <Link
                  className={styles.navLink}
                  href="/API/swagger"
                  onClick={() => setSidebarActive(false)}
                >
                  API
                </Link>
              </>
            ) : null}
            <SideBarShowLogoutOrLogin authorized={authorized} />
          </div>
        </div>
      );
    }
  }

  function SideBarShowLogoutOrLogin(props) {
    if (props.authorized) {
      return (
        <div className={styles.sidebarButtons}>
          <Logout />
        </div>
      );
    } else {
      return (
        <div className={styles.sidebarButtons}>
          <Link
            className={styles.navLink}
            href="/account/login"
            onClick={() => setSidebarActive(false)}
          >
            Login
          </Link>
          <Link
            className={styles.navLink}
            href="/account/register"
            onClick={() => setSidebarActive(false)}
          >
            Register
          </Link>
        </div>
      );
    }
  }

  return (
    <main className={styles.main}>
      <button className={styles.backButton} onClick={handleButtonClick}>
        <Image
          className={styles.backButton__icon}
          src="/back-chevron.png"
          alt="back-icon"
          width={30}
          height={30}
        />
      </button>
      <div className={styles.leftSide}>
        <Link className={styles.navLink} href="/">
          Home
        </Link>
        <ShowUserOrLogin authorized={authorized} />
        <ShowAdminRoute role={role} />
      </div>

      <div className={styles.dropdown} tabIndex="1">
        <div
          className={styles.dropdownText}
          onClick={() => setSidebarActive(true)}
        >
          <div>Menu</div>☰
        </div>
      </div>
      <ShowSidebar sidebarActive={sidebarActive} />
    </main>
  );
}
