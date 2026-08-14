import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CustomerPicker } from "@/components/forms/customer-picker";

const customers = [
  {
    id: "21",
    name: "김철수",
    phone: "010-1111-2222"
  },
  {
    id: "22",
    name: "박영희",
    phone: "010-3333-4444"
  }
];

describe("CustomerPicker", () => {
  it("filters customers by name or phone and writes the selected customer id", () => {
    const { container } = render(<CustomerPicker customers={customers} />);

    fireEvent.change(screen.getByRole("textbox", { name: "고객 검색" }), {
      target: {
        value: "3333"
      }
    });
    fireEvent.click(screen.getByRole("option", { name: /박영희/ }));

    expect(container.querySelector('input[name="customerId"]')).toHaveValue("22");
    expect(screen.getByRole("textbox", { name: "고객 검색" })).toHaveValue(
      "박영희 / 010-3333-4444"
    );
  });

  it("shows the default customer as selected", () => {
    const { container } = render(
      <CustomerPicker customers={customers} defaultCustomerId="21" />
    );

    expect(container.querySelector('input[name="customerId"]')).toHaveValue("21");
    expect(screen.getByRole("textbox", { name: "고객 검색" })).toHaveValue(
      "김철수 / 010-1111-2222"
    );
  });
});
