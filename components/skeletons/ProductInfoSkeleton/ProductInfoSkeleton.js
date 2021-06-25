import {
  TextContainer,
  SkeletonBodyText,
  SkeletonThumbnail,
} from "@shopify/polaris";
import styles from "./ProductInfoSkeleton.module.css";

export const ProductInfoSkeleton = () => (
  <>
    <div className={styles.Title}>
      <SkeletonBodyText lines={1} />
    </div>
    <div className={styles.Body}>
      <SkeletonThumbnail />
      <div className={styles.Text}>
        <TextContainer>
          <SkeletonBodyText lines={2} />
        </TextContainer>
      </div>
    </div>
  </>
);
