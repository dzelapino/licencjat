import Link from 'next/link'
import styles from "@/styles/404.module.scss";

export default function FourOhFour() {
  return <div className={styles.NotFoundPage}>
    <h1>404 - Page Not Found</h1>
    <Link href="/">
        Go back home
    </Link>
  </div>
}