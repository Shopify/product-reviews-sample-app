import { useMemo } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { RiskMinor, CircleTickOutlineMinor } from "@shopify/polaris-icons";
import {
  Page,
  Layout,
  Spinner,
  Stack,
  Card,
  TextContainer,
  Icon,
  TextStyle,
  Link,
} from "@shopify/polaris";
import useSWR from "swr";
import { fetch } from "lib/app-bridge";

const GettingStartedStep = ({ title, description, completed }) => {
  const source = completed ? CircleTickOutlineMinor : RiskMinor;
  const color = completed ? "success" : "critical";

  return (
    <Stack vertical spacing="tight">
      <Stack>
        <Icon color={color} source={source} />
        <TextStyle variation="strong">{title}</TextStyle>
      </Stack>
      {description && <div>{description}</div>}
    </Stack>
  );
};

const AppBlockSetupLayout = ({
  theme,
  supportsAppBlocks,
  supportsSe,
  containsAverageRatingAppBlock,
  containsProductReviewsAppBlock,
  editorUrl,
}) => {
  return (
    <Layout.AnnotatedSection
      title="Theme app blocks setup"
      description="Provide a way for your customers to engage with you and boost your sales by making sure you have installed the product reviews app blocks."
    >
      <Card>
        <Card.Section>
          <Stack vertical>
            <GettingStartedStep
              title="Average Review Score"
              completed={containsAverageRatingAppBlock}
            />
            <GettingStartedStep
              title="Product Reviews"
              completed={containsProductReviewsAppBlock}
            />
          </Stack>
        </Card.Section>

        <Card.Section>
          {supportsAppBlocks && supportsSe && (
            <p>
              Edit the product page for theme (
              <TextStyle variation="strong">{theme.name}</TextStyle>) in the{" "}
              <Link external url={editorUrl}>
                editor
              </Link>
              to add or update app blocks.
            </p>
          )}
          {(!supportsAppBlocks || !supportsSe) && (
            <p>Setup is only possible with supported themes.</p>
          )}
        </Card.Section>
      </Card>
    </Layout.AnnotatedSection>
  );
};

const CurrentThemeLayout = ({ theme, supportsAppBlocks, supportsSe }) => {
  const appBlocksUnsupportedDescription = (
    <p>
      Currently published theme's{" "}
      <TextStyle variation="strong">main-product</TextStyle> section (
      <TextStyle variation="strong">{theme.name}</TextStyle>) does not support
      app blocks.
    </p>
  );

  const sectionsEverywhereUnsupportedDescription = (
    <p>
      Currently published theme (
      <TextStyle variation="strong">{theme.name}</TextStyle>) does not support
      Sections Everywhere.
    </p>
  );

  return (
    <Layout.AnnotatedSection
      title="Current theme"
      description="Ensure your current theme fully supports theme app extensions."
    >
      <Card>
        <Card.Section>
          <Stack vertical>
            <GettingStartedStep
              title="Sections Everywhere support"
              completed={supportsSe}
              description={
                !supportsSe && sectionsEverywhereUnsupportedDescription
              }
            />
            <GettingStartedStep
              title="App block support"
              completed={supportsAppBlocks}
              description={
                !supportsAppBlocks && appBlocksUnsupportedDescription
              }
            />
          </Stack>
        </Card.Section>

        <Card.Section>
          {supportsAppBlocks && supportsSe && (
            <p>Your theme fully supports app blocks 🎉</p>
          )}
          {(!supportsAppBlocks || !supportsSe) && (
            <TextContainer>
              <p>
                It looks like your theme does not fully support the
                functionality of this app.
              </p>
              <p>
                Try switching to a different theme or contacting your theme
                developer to request support.
              </p>
            </TextContainer>
          )}
        </Card.Section>
      </Card>
    </Layout.AnnotatedSection>
  );
};

const GettingStarted = () => {
  const app = useAppBridge();

  const fetcher = useMemo(() => {
    return async (uri, options) => {
      return fetch(app)(uri, options).then((response) => response?.json());
    };
  }, [app]);

  const { data } = useSWR("/api/store/themes/main", fetcher);

  const contentMarkup = useMemo(() => {
    if (!data) {
      return (
        <Layout.Section>
          <Stack distribution="center">
            <Spinner />
          </Stack>
        </Layout.Section>
      );
    }

    const {
      theme,
      supportsAppBlocks,
      supportsSe,
      editorUrl,
      containsAverageRatingAppBlock,
      containsProductReviewsAppBlock,
    } = data;

    return (
      <>
        <CurrentThemeLayout
          theme={theme}
          supportsAppBlocks={supportsAppBlocks}
          supportsSe={supportsSe}
        />
        <AppBlockSetupLayout
          theme={theme}
          supportsAppBlocks={supportsAppBlocks}
          supportsSe={supportsSe}
          containsAverageRatingAppBlock={containsAverageRatingAppBlock}
          containsProductReviewsAppBlock={containsProductReviewsAppBlock}
          editorUrl={editorUrl}
        />
      </>
    );
  }, [data]);

  return (
    <Page title="Getting Started">
      <Layout>{contentMarkup}</Layout>
    </Page>
  );
};

export default GettingStarted;
