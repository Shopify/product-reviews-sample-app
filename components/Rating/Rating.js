import { clamp } from "lodash";
import { Icon, TextStyle } from "@shopify/polaris";
import { StarFilledMinor, StarOutlineMinor } from "@shopify/polaris-icons";
import styles from "./Rating.module.css";
import { MAX_RATING, MIN_RATING } from "../../constants";

const FULL_STAR = "*";
const EMPTY_STAR = "-";

const starIcons = {
  [FULL_STAR]: StarFilledMinor,
  [EMPTY_STAR]: StarOutlineMinor,
};

/**
 * Safety to ensure the rating stays within the max/min bounds,
 * incase of polluted data
 */
const clampRating = (value) => clamp(value, MIN_RATING, MAX_RATING);

const Star = ({ type, color = "default" }) => {
  return (
    <span className={styles.StarIcon}>
      <Icon source={starIcons[type]} color={color} />
    </span>
  );
};

/**
 * Here we want to show faded stars and text, in the case that a rating is
 * missing or not calculated yet (e.g: products with only "unpublished" reviews)
 */
const notRatedStars = () => {
  const starTypes = Array(MAX_RATING).fill(EMPTY_STAR);
  return (
    <>
      {starTypes.map((type, index) => (
        <Star key={index} type={type} color="subdued" />
      ))}
      <p className={styles.TextValue}>
        <TextStyle variation="subdued">(No Rating)</TextStyle>
      </p>
    </>
  );
};

/**
 * If there is a rating value, we use this function
 * to visualize it with full and empty stars.
 * We round up to the nearest star (e.g 3.5 rating shows as 4 full stars)
 * We also show the numerical value in parenthesis
 */
const ratedStars = (rating) => {
  const integerRating = parseInt(rating);
  const decimalRating = Math.round(rating - integerRating);

  const fullStars = Array(integerRating + decimalRating).fill(FULL_STAR);

  const starTypes = [
    ...fullStars,
    ...Array(MAX_RATING - fullStars.length).fill(EMPTY_STAR),
  ];

  return (
    <>
      {starTypes.map((type, index) => (
        <Star key={index} type={type} />
      ))}
      <p className={styles.TextValue}>
        <TextStyle>({rating})</TextStyle>
      </p>
    </>
  );
};

/**
 * Export the <Rating/> component
 */
export const Rating = ({ value }) => {
  const hasRating = !!Number(value);
  const starRating = hasRating
    ? ratedStars(clampRating(value))
    : notRatedStars();

  return <div className={styles.Wrapper}>{starRating}</div>;
};
