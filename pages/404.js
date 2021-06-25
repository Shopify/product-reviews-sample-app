import { Page, Layout, Banner } from "@shopify/polaris";
import { ROUTES } from "../constants";

const PageNotFound = () => (
  <Page title="404 - Not Found">
    <Layout>
      <Layout.Section>
        <Banner
          title="Page was stolen by crazy monkeys 🙊 🙈 🙉"
          action={{ content: "Back to Home 🏠", url: ROUTES.products }}
          status="critical"
        >
          <p>
            The page you are trying to reach either no longer exists or never
            did
          </p>
        </Banner>
      </Layout.Section>
    </Layout>
  </Page>
);

export default PageNotFound;
