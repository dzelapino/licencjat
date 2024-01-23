import Link from "next/link";
import styles from "@/styles/admin/View.module.scss";

export default function View() {
  return (
    <main className={styles.MainContainer}>
      <div className={styles.TileCenter}>
        <div className={styles.TileCenterContent}>
          <Link href="/admin/userList">
            <div className={styles.Tile}>Users</div>
          </Link>
          <Link href="/admin/gamesList">
            <div className={styles.Tile}>Games</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
