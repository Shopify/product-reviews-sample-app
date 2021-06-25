import { useState, useCallback, useMemo } from "react";
import {
  ChoiceList,
  Filters,
  ResourceList,
  TextStyle,
  Tabs,
  Icon,
  DisplayText,
} from "@shopify/polaris";
import { SearchMajor } from "@shopify/polaris-icons";
import { ReviewItem } from "../ReviewItem";
import styles from "./ReviewList.module.css";

const tabIndex = { published: 0, unpublished: 1 };
const tabs = [
  {
    id: "published",
    content: "Published",
    accessibilityLabel: "Published Reviews",
  },
  {
    id: "unpublished",
    content: "Unpublished",
    accessibilityLabel: "Unpublished Reviews",
  },
];

export const ReviewList = ({
  reviews: allReviews,
  loading,
  processing,
  state = "published",
  onTabChange,
  bulkActions,
}) => {
  const [ratedAs, setRatedAs] = useState([]);
  const [sortValue, setSortValue] = useState("newest");
  const [selectedTabIndex, setSelectedTab] = useState(tabIndex[state]);
  const [selectedResources, setSelectedResources] = useState([]);

  /**
   * 1. Clear the checkboxes
   * 2. Update the activeTab
   * 3. Trigger the `onTabChange` callback, which adds the `state` query param to the url
   */
  const updateActiveTab = useCallback((selectedTabIndex) => {
    setSelectedResources([]);
    setSelectedTab(selectedTabIndex);
    onTabChange(tabs[selectedTabIndex].id);
  }, []);

  /**
   * Return the reviews with the `ratedAs` filter applied
   */
  const reviews = useMemo(() => {
    if (!ratedAs.length) {
      return allReviews;
    }

    return allReviews.filter((review) =>
      ratedAs.includes(review.value?.rating?.toString())
    );
  }, [allReviews, ratedAs]);

  /**
   * Sort the reviews by date created
   * If the `sortValue` is set to "newest", then show the newest first
   * Otherwise show the oldest first
   */
  const sortedReviews = useMemo(() => {
    if (!sortValue) return reviews;
    const sortFunction = (a, b) => {
      if (!a.value.created_at || !b.value.created_at) return 0;
      const currTime = new Date(a.value.created_at).getTime();
      const nextTime = new Date(b.value.created_at).getTime();
      if (currTime > nextTime) return sortValue === "newest" ? -1 : 1;
      if (currTime < nextTime) return sortValue === "newest" ? 1 : -1;
      if (currTime === nextTime) return 0;
    };
    return reviews.sort(sortFunction);
  }, [reviews, sortValue]);

  /**
   * We pass this as the `filters` prop to `<Filters />`,
   * which gets passed as the `filterControl` prop
   * to `<ResourceList />`
   */
  const filters = [
    {
      key: "ratedAs",
      label: "Star rating",
      filter: (
        <ChoiceList
          title="Stars"
          titleHidden
          choices={[
            { label: "1 Star", value: "1" },
            { label: "2 Stars", value: "2" },
            { label: "3 Stars", value: "3" },
            { label: "4 Stars", value: "4" },
            { label: "5 Stars", value: "5" },
          ]}
          selected={ratedAs}
          onChange={setRatedAs}
          allowMultiple
        />
      ),
      shortcut: true,
      hideClearButton: true,
    },
  ];

  /**
   * Create a label to show each rating value
   * that has a filter applied
   */
  const appliedFilters = ratedAs.map((rating, index) => {
    const currentSelected = [...ratedAs];
    currentSelected.splice(index, 1);
    return {
      key: rating,
      label: `${rating} star${rating === 1 ? "" : "s"}`,
      onRemove: () => setRatedAs(currentSelected),
    };
  });

  /**
   * Update each bulkAction's `onAction` property
   * so that it also clears the checkboxes
   * after the action is finished
   */
  const actions = useMemo(() => {
    return bulkActions.map((action) => ({
      ...action,
      onAction: async () => {
        await action.onAction(selectedResources);
        setSelectedResources([]);
      },
    }));
  }, [setSelectedResources, selectedResources]);

  /**
   * This gets passed in as the `emptyState` prop on `<ResourceList/>`,
   * and displays automatically when the `items` prop is empty
   */
  const emptyTabMarkup = useMemo(() => {
    return (
      <div className={styles.EmptyState}>
        <div className={styles.SearchIcon}>
          <Icon source={SearchMajor} color="subdued" />
        </div>
        <div className={styles.NoResultsText}>
          <DisplayText size="small">You have 0 {state} reviews</DisplayText>
        </div>
        <TextStyle variation="subdued">
          Try changing the filters for different results
        </TextStyle>
      </div>
    );
  }, [selectedTabIndex, state]);

  return (
    <Tabs tabs={tabs} selected={selectedTabIndex} onSelect={updateActiveTab}>
      <ResourceList
        resourceName={{
          singular: "review",
          plural: "reviews",
        }}
        items={sortedReviews}
        selectedItems={selectedResources}
        onSelectionChange={setSelectedResources}
        loading={loading || processing}
        promotedBulkActions={actions}
        filterControl={
          <Filters
            filters={filters}
            appliedFilters={appliedFilters}
            hideQueryField
          />
        }
        sortOptions={[
          { label: "Newest", value: "newest" },
          { label: "Oldest", value: "oldest" },
        ]}
        sortValue={sortValue}
        onSortChange={(value) => setSortValue(value)}
        renderItem={(item) => (
          <ResourceList.Item
            id={item.id}
            onClick={() =>
              setSelectedResources([...selectedResources, item.id])
            }
            accessibilityLabel={`Select review entitled: ${item.title}`}
          >
            <ReviewItem review={item} />
          </ResourceList.Item>
        )}
        emptyState={emptyTabMarkup}
      />
    </Tabs>
  );
};
