import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Loading } from "@shopify/app-bridge/actions";

export const useRouteChangeLoader = () => {
  const router = useRouter();
  const appBridge = useAppBridge();

  /**
   * Subscribe Next.js route update events (start, complete and error)
   * dispatch app-bridge loading actions approapreatly to start/finish shoing progressbar
   */
  useEffect(() => {
    const loading = Loading.create(appBridge);

    const routeChangeStart = () => {
      loading.dispatch(Loading.Action.START);
    };

    const routeChangeEnd = () => {
      loading.dispatch(Loading.Action.STOP);
    };

    router.events.on("routeChangeStart", routeChangeStart);
    router.events.on("routeChangeComplete", routeChangeEnd);
    router.events.on("routeChangeError", routeChangeEnd);

    // If the component is unmounted, unsubscribe route events listeners
    return () => {
      router.events.off("routeChangeStart", routeChangeStart);
      router.events.off("routeChangeComplete", routeChangeEnd);
      router.events.off("routeChangeError", routeChangeEnd);
    };
  }, [router]);
};
