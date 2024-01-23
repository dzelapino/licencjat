import Link from "next/link";
import styles from "@/styles/Main.module.scss";
import Image from "next/image";
import Router from "next/router";

export default function Home() {
  return (
    <div className={styles.MainContainer}>
      <div className={styles.TileWrapper}>
        <div className={styles.HugeTile}>
          <div className={styles.GamepadImage}>
            <Image
              src="/gamepad.png"
              alt="gamepad-image"
              priority={true}
              width={216}
              height={216}
            />
          </div>
          <div className={styles.HugeTileText}>
            <p>Pick a game or add your own!</p>
            <p>Browse through your scores!</p>
            <p>Compare rankings!</p>
          </div>
        </div>
        <div className={styles.BasicTileWrapper}>
          <Link href="/games">
            <div className={styles.Tile}>Games</div>
          </Link>
          <Link href="/ranking/gameList">
            <div className={styles.Tile}>Rankings</div>
          </Link>
          <Link href="/createGame/info">
            <div className={styles.Tile}>Create Game</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
