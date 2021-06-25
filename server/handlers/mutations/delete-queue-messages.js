import "isomorphic-fetch";
import { METAFIELD_DELETE } from "../../../graphql";

const deleteQueueMessage = (client, message) => {
  return client.mutate({
    mutation: METAFIELD_DELETE,
    variables: { input: { id: message.id } },
  });
};

export const deleteQueueMessages = (client, messages) => {
  return Promise.all(
    messages.map((message) => deleteQueueMessage(client, message))
  );
};
