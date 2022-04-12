import { useState } from "react";
import {
  Card,
  Form,
  FormLayout,
  TextField,
  Select,
  Button,
} from "@shopify/polaris";
import { nanoid } from "nanoid";
import { useRouter } from "next/router";
import { useProductMetafieldCreate } from "hooks";
import { generateShopifyProductGid } from "../../utilities/metafields";
import { METAFIELD_NAMESPACE } from "../../constants";

/**
 * We prefill the form inputs since this form is meant for quickly creating
 * mock reviews for debugging purposes
 */
export const ReviewForm = ({ productId, productInfo }) => {
  const [name, setName] = useState("Debug User");
  const [email, setEmail] = useState("debug@email.com");
  const [rating, setRating] = useState("5");
  const [title, setTitle] = useState("Life changing.");
  const [body, setBody] = useState(
    "Tiramisu cotton candy cotton candy cotton candy. Icing jelly jelly beans. Jelly-o caramels gummi bears gingerbread. Sesame snaps wafer topping apple pie lollipop caramels. Liquorice jelly beans candy. Icing jujubes cotton candy cake pastry carrot cake gingerbread. Bear claw bonbon liquorice biscuit chocolate cake tart sweet"
  );
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const createProductMetafield = useProductMetafieldCreate();

  const getReviewData = () => {
    /**
     * There is a limit of 30 characters
     * when setting a Metafield id
     */
    const reviewId = nanoid(30);
    return {
      key: reviewId,
      namespace: METAFIELD_NAMESPACE.privateReviews,
      value: JSON.stringify({
        name,
        email,
        rating,
        title,
        body,
        created_at: new Date().toISOString(),
        id: reviewId,
        state: "unpublished",
      }),
      type: "json",
    };
  };

  const onCreate = async () => {
    setProcessing(true);
    const reviewData = getReviewData();
    const id = generateShopifyProductGid(productId);
    await createProductMetafield({ productId: id, metafield: reviewData });
    /**
     * After the new review is created, redirect to the product review page
     * with the "unpublished" tab active (this is where to new review will show up)
     */
    router.push({
      pathname: `/products/${productId}`,
      query: {
        state: "unpublished",
      },
    });
  };

  return (
    <Card>
      <Card.Section>{productInfo}</Card.Section>
      <Card.Section>
        <Form onSubmit={onCreate}>
          <FormLayout>
            <FormLayout.Group>
              <TextField
                type="text"
                label="Name"
                placeholder="Enter your name"
                onChange={setName}
                value={name}
              />
              <TextField
                type="email"
                label="Email"
                placeholder="Enter your email"
                onChange={setEmail}
                value={email}
              />
              <Select
                label="Rating"
                options={[...Array(5)].map((_, i) => ({
                  label: "⭐️".repeat(i + 1),
                  value: String(i + 1),
                }))}
                value={rating}
                onChange={setRating}
              />
            </FormLayout.Group>
            <TextField
              type="text"
              label="Review Title"
              placeholder="Give your review a title"
              onChange={setTitle}
              value={title}
            />
            <TextField
              type="text"
              label="Review"
              placeholder="Write your comments here"
              onChange={setBody}
              value={body}
              multiline={8}
            />
            <Button primary submit loading={processing}>
              Create Review
            </Button>
          </FormLayout>
        </Form>
      </Card.Section>
    </Card>
  );
};
