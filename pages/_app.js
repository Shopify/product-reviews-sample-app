import { useMemo } from "react";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import NextApp from "next/app";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import {
  Provider as AppBridgeProvider,
  useAppBridge,
} from "@shopify/app-bridge-react";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import { fetch } from "lib/app-bridge";
import { RoutePropagator, Link } from "components";
import { useRouteChangeLoader } from "hooks";
import styles from "./_app.module.css";
import "./styles.css";

/**
 * React Apollo Context Provider configuration
 * Done as a separate component so we could use App Bridge Context
 * App Bridge is configured and made available bellow in App component
 *
 * More on Apollo Context Provider:
 * https://www.apollographql.com/docs/react/api/react/hooks/#the-apolloprovider-component
 */
function ConfiguredApolloProvider({ children }) {
  const app = useAppBridge();

  const client = useMemo(
    () =>
      new ApolloClient({
        // configuring custom fetch so we could have reusable App Bridge logic on requests
        fetch: fetch(app),
        fetchOptions: {
          credentials: "include",
        },
      }),
    [app]
  );

  useRouteChangeLoader();

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

/**
 * App configuration for every page in our app
 * Here we configure App Bridge context provider so every page could use it
 *
 * App Brige allows to customize Shopify Admin beyond your app
 * More on App Bridge: https://shopify.dev/tools/app-bridge
 */
class App extends NextApp {
  render() {
    const { Component, pageProps, host } = this.props;

    return (
      <AppBridgeProvider
        config={{
          host: host,
          apiKey: API_KEY,
          forceRedirect: true,
        }}
      >
        <RoutePropagator />
        <PolarisAppProvider i18n={translations} linkComponent={Link}>
          <ConfiguredApolloProvider>
            <div className={styles.PageWrapper}>
              <Component {...pageProps} />
            </div>
          </ConfiguredApolloProvider>
        </PolarisAppProvider>
      </AppBridgeProvider>
    );
  }
}

App.getInitialProps = async ({ ctx }) => {
  return {
    host: ctx.query.host,
  };
};

export default App;
