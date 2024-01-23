import styles from "@/styles/CreateGameInfo.module.scss";
import Link from "next/link";

export default function Info() {
  return (
    <div className={styles.createGameContainer}>
      <div className={styles.infoContainer}>
        <div className={styles.info__column}>
          <h1>POST GAME</h1>
          <div>1. Post a React Component with your game</div>
          <div className={styles.font_start}>
            Don't forget to include the following inside your JS code <br/>
            <p className="rowwrap">
            Stylefile:
            <div className={styles.info__underlined}>
              import styles from "@/styles/games/yourgamename.module.scss";
            </div>
            </p>
            <p className="rowwrap">
            Function that posts scores:
            <div className={styles.info__underlined}>
              import postScore from "./postScore";
            </div>
            </p>
            <p className="rowwrap">
            Post score payload example:
            <div className={styles.info__underlined}>
            postScore(&#123;"amount": points, "private": false, "game": "game name", "player": userId&#125;)
            </div>
            </p>
            <p className="rowwrap">
            Player id selector:
            <div className={styles.info__underlined}>
            import &#123; useSelector &#125; from "react-redux"
            </div>
            <div className={styles.info__underlined}>
              import &#123; selectId &#125; from "slices/authSlice";
            </div>
            </p>
            <p className="rowwrap">
            Select id example:
            <div className={styles.info__underlined}>
            const userId = useSelector(selectId);
            </div>
            </p>
          </div>

          <div>2. Wait for admins to verify the code</div>
          <div>
            3. Apply the required changes if any bug occurs in your code. We
            will provide you with a guidance
          </div>
          <div>4. Get your code verified</div>
          <div>5. Enjoy playing your game together!</div>
          <Link href="/createGame/publish" className={styles.link}>
            <button>POST GAME</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
