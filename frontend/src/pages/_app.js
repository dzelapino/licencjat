import Layout from "@/components/layout";
import "@/styles/globals.scss";
import { store } from "app/store";
import { Provider } from "react-redux";

function App({ Component, pageProps }) {
  return (
    <div className="HTMLWrapper">
      <Provider store={store}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </div>
  );
}

export default App;
