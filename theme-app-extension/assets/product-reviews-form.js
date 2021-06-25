// script is loaded with product-reviews.liquid block
// it is responsible for dynamically creating new review form
(function () {
  function selectElement(selector, node) {
    return (node || document).querySelector(selector);
  }

  function submitReview(productId) {
    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        review: {
          rating: selectElement("#prapp-form__rating").value,
          author: selectElement("#prapp-form__name").value,
          email: selectElement("#prapp-form__email").value,
          title: selectElement("#prapp-form__title").value,
          body: selectElement("#prapp-form__comment").value,
        },
      }),
    };

    return fetch("/apps/prapp/reviews", fetchOptions);
  }

  // utility function that simplifies creation of new html node
  function create({
    tag,
    appendTo,
    children = [],
    attributes = {},
    events = {},
  }) {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
      element[key] = value;
    });

    Object.entries(events).forEach(([key, value]) => {
      element.addEventListener(key, value);
    });

    if (appendTo) {
      appendTo.appendChild(element);
    }

    children.forEach((child) => element.appendChild(child));

    return element;
  }

  // utility function that simplifies creation of new input + label html nodes group
  function createField({ labelProps, fieldProps = {}, name, parentNode }) {
    const fieldClassName = (
      {
        select: "select__select",
        textarea: "field__input text-area",
      }[fieldProps.tag] || "field__input"
    ).concat(fieldProps.attributes?.className || "");

    const container = create({
      tag: "div",
      attributes: { className: "field" },
    });

    create({
      tag: "input",
      ...fieldProps,
      attributes: {
        name,
        id: `prapp-form__${name}`,
        type: "text",
        ...(fieldProps.attributes || {}),
        className: fieldClassName,
      },
      appendTo: container,
    });

    if (labelProps) {
      create({
        tag: "label",
        ...labelProps,
        attributes: {
          htmlFor: `prapp-form__${name}`,
          className: "field__label",
          ...(labelProps.attributes || {}),
        },
        appendTo: container,
      });
    }

    if (parentNode) {
      parentNode.appendChild(container);
    }

    return container;
  }

  // when user clicks on "write review" button this initializes new review form
  // adds event handling for the form, including submit response success/error message and form removal on response
  function initWriteReview({ target }) {
    const rootBlock = target.closest(".prapp-block[data-product-id]");
    const { productId } = rootBlock.dataset;
    const el = target.parentNode.classList.contains("prapp-summary__no-reviews")
      ? target.parentNode
      : target;
    el.parentNode.removeChild(el);

    const container = document.querySelector(".prapp-summary");
    const submitButton = create({
      tag: "button",
      attributes: {
        type: "submit",
        textContent: "Submit Review",
        className: "button button--secondary",
      },
    });
    const form = create({
      tag: "form",
      attributes: { className: "prapp-summary__form" },
      events: {
        submit: async (event) => {
          event.preventDefault();

          submitButton.textContent = "Sendind 🚀";
          submitButton.classList.add("prapp-form__submit--loading");

          const result = await submitReview(productId);
          const resultMessage =
            result.status === 200
              ? "Successfuly added your review to the queue of over 3000! 🏁_ _ _🏎 💨"
              : "Something went wrong! 😱 Your letuce lost in the wind 🌬 🥬";

          event.target.parentNode.removeChild(event.target);
          create({
            tag: "p",
            attributes: { textContent: resultMessage },
            appendTo: container,
          });
        },
      },
      appendTo: container,
    });

    const ratingOptions = [...Array(5)].map((_, i, arr) => {
      const count = i + 1;
      const option = create({
        tag: "option",
        attributes: {
          textContent: "⭐️".repeat(count),
          value: count,
          selected: count === arr.length,
        },
      });

      return option;
    });

    [
      {
        parentNode: form,
        name: "name",
        labelProps: { attributes: { textContent: "Name" } },
        fieldProps: { attributes: { placeholder: "Name" } },
      },
      {
        parentNode: form,
        name: "email",
        labelProps: { attributes: { textContent: "Email" } },
        fieldProps: { attributes: { type: "email", placeholder: "Email" } },
      },
      {
        parentNode: form,
        name: "rating",
        fieldProps: { tag: "select", children: ratingOptions },
      },
      {
        parentNode: form,
        name: "title",
        labelProps: { attributes: { textContent: "Title" } },
        fieldProps: { attributes: { placeholder: "Title" } },
      },
      {
        parentNode: form,
        name: "comment",
        labelProps: { attributes: { textContent: "Review" } },
        fieldProps: { tag: "textarea", attributes: { placeholder: "Review" } },
      },
    ].forEach((props) => createField(props));

    form.appendChild(submitButton);
  }

  document
    .querySelector(".prapp-summary__write-review")
    .addEventListener("click", initWriteReview);
})();
