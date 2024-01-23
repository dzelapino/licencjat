import Navbar from "./navbar";
import Footer from "./footer";
import styles from "@/styles/components/Layout.module.scss";
import { LoadScript } from "@react-google-maps/api";
import useInit from "@/hooks/useInit";
import useWebsocket from "@/hooks/useWebsocket";
import AccountDisabled from "./accountDisabled";

export default function Layout({ children }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useInit();
  const { disabled } = useWebsocket();

  return (
    <div className={styles.Layout}>
      <LoadScript googleMapsApiKey={key}>
        <Navbar />
        {disabled ? (
          <AccountDisabled />
        ) : (
          <div className={styles.LayoutChildren}>{children}</div>
        )}
        <Footer />
      </LoadScript>
    </div>
  );
}
