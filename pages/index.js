import { useEffect } from "react";
import { useRouter } from "next/router";
import createPersistedState from "use-persisted-state";
import { useOnValueChange } from "@shopify/react-hooks";

import { ROUTES } from "../constants";

const usePageViewCountState = createPersistedState("prapp.pageViewCount");

/**
 * This page is accessible via `/`.
 * It is responsible for checking whether users are seeing this page for the first time.
 * This helps us to redirect users to the correct page if they are first time visitors.
 */
const Index = () => {
  const router = useRouter();
  /**
   * Since this is sample application, we persist page view count in the localStorage
   */
  const [pageViewCount, setPageViewCount] = usePageViewCountState(0);

  /**
   * This hook tracks a given value and invokes a callback when it has changed.
   * It aids us to know when page view count has changed.
   */
  useOnValueChange(pageViewCount, (_, oldPageViewCount) => {
    const url =
      oldPageViewCount === 0 ? ROUTES.gettingStarted : ROUTES.products;

    router.replace(url);
  });

  useEffect(() => {
    /**
     * Updates page view count once the component is mounted.
     */
    setPageViewCount((currentPageViewCount) => currentPageViewCount + 1);
  }, []);

  return null;
};

export default Index;
