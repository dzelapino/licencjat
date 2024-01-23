import Link from "next/link";
import styles from "@/styles/account/User.module.scss";
import { useState } from "react";
import Gravatar from "react-gravatar";
import Router from "next/router";
import { useSelector } from "react-redux";
import useAxios from "@/hooks/useAxios";
import Modal from "@/components/modals/modal";
import { selectId } from "slices/authSlice";
const apiUrl = process.env.SERVER_URL || "http://localhost:5000";

export default function User() {
  const [animationEnabled, enableAnimations] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const id = useSelector(selectId);

  const { data, isPending, error } = useAxios(`${apiUrl}/users/byId/${id}`);

  const closeModal = () => {
    Router.push("/");
  };

  const MenuToggleButton = () => {
    return (
      <button
        className={styles.UserMenuShowButton}
        onClick={() => {
          setMenuActive(!menuActive);
          enableAnimations(true);
        }}
      >
        {menuActive ? "Hide Menu ✖" : "Show Menu ☰"}
      </button>
    );
  };

  const UserTile = () => {
    return (
      <div className={styles.UserTile}>
        <Gravatar className={styles.UserPicture} email={data.email} alt={""} />
        <div className={styles.Username}>{data.username}</div>
        <MenuToggleButton />
      </div>
    );
  };

  const UserMenu = () => {
    return (
      <div className={styles.UserMenu}>
        <Link href="/account/games">My games</Link>
        <Link href="/account/scores">My scores</Link>
        <Link href="/account/editEmail">Change Email</Link>
        <Link href="/account/editPassword">Change Password</Link>
        <MenuToggleButton />
      </div>
    );
  };

  if (isPending) {
    return (
      <main className={styles.MainContainerLoading}>
        <div className={styles.Dot} />
        <div className={styles.Dot} />
        <div className={styles.Dot} />
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.MainContainer}>
        <Modal
          modalText={error}
          buttonFunction={closeModal}
          buttonText={"Redirect to home"}
        />
      </main>
    );
  }

  return (
    <main className={styles.MainContainer}>
      {animationEnabled ? (
        <div className={styles.UserContainer}>
          {menuActive ? (
            <div className={styles.UserContainer}>
              <div className={styles.UserTileInactive}>
                <UserTile />
              </div>
              <div className={styles.UserMenuActive}>
                <UserMenu />
              </div>
            </div>
          ) : (
            <div className={styles.UserContainer}>
              <div className={styles.UserTileActive}>
                <UserTile />
              </div>
              <div className={styles.UserMenuInactive}>
                <UserMenu />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.UserContainer}>
          <div className={styles.UserContainer}>
            <div className={styles.UserTileNoAnimation}>
              <UserTile />
            </div>
            <div className={styles.UserMenuNoAnimation}>
              {/* <UserMenu /> */}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
